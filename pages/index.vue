<template>
  <div id="index">
    <template v-for="date in dates">
      <a href="javascript:;" @click="onSelectDate(date)">{{ date }}</a> /
    </template>
    
    <h2>
      <template v-if="date">
        {{ moment(date).format('MMMM D, YYYY') }}
      </template>
      <template v-else>
        Select a date above...
      </template>
    </h2>

    <input v-model="searchSymbol" type="text" placeholder="Filter symbol..."/>

    <section id="filters">
      <strong>Filters <a href="javascript:;" @click="clearFilters">(clear)</a> : </strong>
      <template v-for="filter in ['positive_change', 'negative_change', 'positive_vol_change', 'green_candle', 'red_candle', 'uptrend_short', 'uptrend_medium', 'downtrend_short', 'sideways_short', 'aots', 'oversold', 'near_resistance', 'near_support']">
        <a href="javascript:;" @click="toggleFilter(filter)">{{ Utils().replaceUnderscoreWithSpace(filter) }}</a>
        <template v-if="filters.includes(filter)">*</template> /
      </template>
    </section>

    <section id="setups">
      <strong>Setups <a href="javascript:;" @click="clearSetups">(clear)</a> : </strong>
      <template v-for="setup in ['breakout', 'bounce', 'near_support', 'near_resistance']">
        <a href="javascript:;" @click="toggleSetup(setup)">{{ Utils().replaceUnderscoreWithSpace(setup) }}</a>
        <!-- <template v-if="setups.includes(setup)">*</template> / -->
        /
      </template>
    </section>

    <section id="stock-data">
      <div v-if="status == 'loading'">Loading...</div>
      <div v-else-if="status == 'error'">ERROR LOADING STOCKS</div>

      <div v-if="status != 'loading' && stocks.length <= 0">No stocks found for {{ moment(date).format('MMMM D, YYYY') }}</div>
      <table v-else-if="status == 'done' && stocks.length > 0" cellspacing="0">
        <thead>
          <td v-for="header in ['stock', 'open', 'last', '%change', 'vol_change', 'trend_short', 'trend_medium', 'distance_from_resistance_1', 'distance_from_support_1', 'macd(12,26,9)', 'rsi(14)', 'rsi(14)_status', 'aots', 'candlestick(1)']">
            <a href="javascript:;" @click="toggleSort(header)">
              {{ header }}
            </a>
            <template v-if="sortType(header) == 'desc'"> ⬇</template>
            <template v-if="sortType(header) == 'asc'"> ⬆</template>
          </td>
        </thead>
        <tbody>
          <tr v-for="stock in filteredStocks">
            <td><a :href="'https://investagrams.com/stock/'+stock.stock" target="_blank">{{ stock.stock }}</a></td>
            <td>{{ stock.open }}</td>
            <td>{{ stock.last }}</td>
            <td>{{ stock['%change'] }}</td>
            <td>{{ volChangeFromVolumeAverage(stock) }}</td>
            <td>{{ stock.trend_short }}</td>
            <td>{{ stock.trend_medium }}</td>
            <td>{{ distanceFromResistance1(stock) }}</td>
            <td>{{ distanceFromSupport1(stock) }}</td>
            <td>{{ stock['macd(12,26,9)'] }}</td>
            <td>{{ round(stock['rsi(14)']) }}</td>
            <td>{{ stock['rsi(14)_status'] }}</td>
            <td>{{ aots(stock) }}</td>
            <td>{{ stock['candlestick(1)'] }}</td>
          </tr>
        </tbody>
      </table>
    </section>

  </div>
</template>

<script>
import axios from '~/plugins/axios'
import moment from 'moment'
import _ from 'lodash'
import Utils from '../utils/utils'

export default {
  data() {
    return {
      date: null,
      status: '',
      iframeSrc: null,
      
      stocks: [],
      stock: null,

      searchSymbol: null,
      filters: [],
      setups: [],
      sorts: [],
    }
  },
  async asyncData () {
    let dates = await axios.get('/api/dates')
    return {
      dates: dates.data
    }
  },
  mounted() {
    this.status = 'loading'
    this.fetchByDate(Utils.getLatestTradingDate())
  },
  computed: {
    filteredStocks() {
      let stocks = []

      stocks = this.stocks

      // filters
      if(this.filters.length <= 0) {
      } else {
        const filterFunctions = {
          positive_change: s => s['%change'] > 0,
          negative_change: s => s['%change'] < 0,
          positive_vol_change: s => this.volChangeFromVolumeAverage(s) > 0,
          green_candle: s => s.last > s.open,
          red_candle: s => s.last < s.open,
          uptrend_short: s => s.trend_short == 'UPTREND',
          uptrend_medium: s => s.trend_medium == 'UPTREND',
          sideways_short: s => s.trend_short == 'SIDEWAYS',
          downtrend_short: s => s.trend_short == 'DOWNTREND',
          aots: s => this.aots(s) == true,
          oversold: s => s['rsi(14)_status'] == 'OVERSOLD',
          near_resistance: s => this.distanceFromResistance1(s) < 30,
          near_support: s => this.distanceFromSupport1(s) < 30,
        }

        _.map(this.filters, (filter) => {
          stocks = _.filter(stocks, filterFunctions[filter])
        })
      }

      if(this.searchSymbol) {
        stocks = _.filter(stocks, (s) => s.stock.includes(this.searchSymbol.toUpperCase()))
      }

      // sorts
      let lodashSortFunctions = []
      const sortFunctions = {
        vol_change: (s) => this.volChangeFromVolumeAverage(s),
        aots: (s) => this.aots(s),
        distance_from_resistance_1: (s) => this.distanceFromResistance1(s),
        distance_from_support_1: (s) => this.distanceFromSupport1(s),
      }

      _.forEach(this.sorts, (sort) => {
        if(Utils.csvHeaders.includes(sort.field)) {
          lodashSortFunctions.push((c) => c[sort.field])
        } else {
          lodashSortFunctions.push(sortFunctions[sort.field])
        }
      })
      stocks = _.orderBy(stocks, lodashSortFunctions, _.map(this.sorts, 'type'))

      return stocks
    }
  },
  methods: {
    round(value, precision) {
      return _.round(value, precision)
    },
    moment(d) {
      return moment(d)
    },
    Utils() {
      return Utils
    },
    sortType(sortField) {
      const sort = _.find(this.sorts, { field: sortField })
      if(sort)
        return sort.type
    },
    clearSetups() {
      this.setups = []
    },
    clearFilters() {
      this.filters = []
    },
    clearSorts() {
      this.sorts = []
    },
    toggleSetup(setup) {
      this.clearFilters()
      this.clearSorts()

      // this.setups = this.setups.includes(setup) ? [] : [setup]

      const setupFunctions = {
        breakout: (setup) => {
          this.toggleFilter(['sideways_short', 'positive_change', 'positive_vol_change'])
          this.toggleSort('distance_from_resistance_1', 'desc')
        },
        bounce: (setup) => {

        },
        near_resistance: (setup) => {
          this.toggleFilter(['near_resistance'])
          this.toggleSort('near_resistance_1', 'asc')
        },
        near_support: (setup) => {
          this.toggleFilter(['near_support'])
          this.toggleSort('near_support_1', 'asc')
        },
      }

      // _.map(this.setups, setupFunctions[setup])
      setupFunctions[setup]()
    },
    toggleFilter(filter) {
      this.filters = _.xor(this.filters, filter instanceof Array ? filter : [filter])
    },
    toggleSort(sortField, sortType) {
      let sort = _.find(this.sorts, { field: sortField })

      if(sortType) {
        this.sorts = _.union(this.sorts, { field: sortField, type: sortType })
      }

      if(sort) {
        if(sort.type == 'desc') {
          sort.type = 'asc'
        } else if(sort.type == 'asc') {
          const indexToRemove = _.indexOf(_.map(this.sorts, 'field'), sortField)
          this.sorts.splice(indexToRemove, 1)
        }
      } else {
        this.sorts.push({ field: sortField, type: 'desc' })
      }
    },
    onSelectDate(date) {
      this.fetchByDate(moment(date, 'YYYYMMD'))
    },
    fetchByDate(date) {
      this.date = date

      this.status = 'loading'
      this.stocks = []

      // if sunday or saturday, go to friday
      var dayOfWeek = moment(this.date).format('d')
      if(dayOfWeek == 0 || dayOfWeek == 6) {
        this.fetchByDate(this.date.subtract(1, 'day'))
        return
      }

      axios.get('/api/dailies/' + (this.date.format('YYYYMMD')))
      .then(function (response) {
        this.stocks = _
        .chain(response.data.data)
        .orderBy([(c) => c['%change']], ['desc'])
        .value()

        this.status = 'done'
      }.bind(this))
      .catch(function (error) {
        console.log("ERROR", error)
        this.status = 'error'
      }.bind(this))
    },

    // additional calculations
    aots(stock) {
      return (stock.ma_20 > stock.ma_50) && (stock.ma_50 > stock.ma_100)
    },
    candleTop(stock) {
      // get the top price of candle (last if green, open if red)
      return stock.last > stock.open ? stock.last : stock.open
    },
    candleBottom(stock) {
      // get the bottom price of candle (last if red, open if green)
      return stock.last < stock.open ? stock.last : stock.open
    },
    volChangeFromVolumeAverage(stock, sma = 10) {
      const volAverage = stock[`volumesma(${sma})`]
      const vol = stock.volume
      return _.round(((vol - volAverage)/volAverage) * 100, 2)// + " " + `${vol} ${volAverage}`
    },
    distanceFromResistance1(stock) {
      const roof = stock.resistance_1 - stock.support_1
      const candleTopPosition = this.candleTop(stock) - stock.support_1
      const distance = (roof - candleTopPosition) / roof
      return _.round(distance * 100, 3)
      // return _.round(((this.candleTop(stock) - stock.resistance_1) / stock.resistance_1) * 100, 3)
    },
    distanceFromSupport1(stock) {
      const roof = (stock.resistance_1 - stock.support_1)
      const candleBottomPosition = this.candleBottom(stock) - stock.support_1
      const distance = (roof - candleBottomPosition) / roof
      return _.round(distance * 100, 3)
      // return _.round(((this.candleBottom(stock) - stock.support_1) / stock.support_1) * 100, 3)
    },
  },
  head () {
    return {
      title: 'Stocks'
    }
  }
}
</script>

<style scoped>
#index section {
  margin: 1em 0;
}

#index {
  font-family: Lato;
  font-size: 11pt;
}

#index table tr:nth-child(odd) {
  background-color: #fafafa;
}

#index table tr:hover {
  background-color: #eee;
}

#index table td {
  padding: 4px;
}
</style>