<template>
  <div>
    <template v-for="date in dates">
      <a href="#" @click="onSelectDate(date)">{{ date }}</a> /
    </template>
    
    <h2>{{ moment(date).format('MMMM D, YYYY') }}</h2>

    <input v-model="searchSymbol" type="text" placeholder="Filter symbol..."/>

    <br><br>

    <strong>Filters <a href="#" @click="clearFilters">(clear)</a>: </strong>

    <a href="#" @click="toggleFilter('positive_change')">positive change</a><template v-if="filters.includes('positive_change')">*</template> /
    <a href="#" @click="toggleFilter('negative_change')">negative change</a><template v-if="filters.includes('negative_change')">*</template> /
    <a href="#" @click="toggleFilter('green_candle')">green candle</a><template v-if="filters.includes('green_candle')">*</template> /
    <a href="#" @click="toggleFilter('red_candle')">red candle</a><template v-if="filters.includes('red_candle')">*</template> /
    <a href="#" @click="toggleFilter('uptrend_short')">uptrend short</a><template v-if="filters.includes('uptrend_short')">*</template> /
    <a href="#" @click="toggleFilter('downtrend_short')">downtrend short</a><template v-if="filters.includes('downtrend_short')">*</template> /
    <a href="#" @click="toggleFilter('sideways_short')">sideways short</a><template v-if="filters.includes('sideways_short')">*</template> /
    <a href="#" @click="toggleFilter('aots')">aots</a><template v-if="filters.includes('aots')">*</template> /
    <a href="#" @click="toggleFilter('oversold')">oversold</a><template v-if="filters.includes('oversold')">*</template> /

    <br><br>

    <div v-if="status == 'loading'">Loading...</div>
    <div v-else-if="status == 'error'">ERROR LOADING STOCKS</div>
    <table>
      <thead>
        <td>chart</td>
        <td>stock</td>
        <td v-for="header in ['%change', 'vol_change', 'trend_short', 'macd(12,26,9)', 'rsi(14)', 'rsi(14)_status', 'aots', 'candlestick(1)']">
          <a href="#" @click="toggleSort(header)">
            {{ header }}
          </a>
          <template v-if="sortType(header) == 'desc'"> (v)</template>
          <template v-if="sortType(header) == 'asc'"> (^)</template>
        </td>
      </thead>
      <tbody>
        <tr v-for="stock in filteredStocks">
          <td><a :href="'https://investagrams.com/stock/'+stock.stock" target="_blank">chart</a></td>
          <td>{{ stock.stock }}</td>
          <td>{{ stock['%change'] }}</td>
          <td>{{ volChangeFromVolumeAverage(stock) }}</td>
          <td>{{ stock.trend_short }}</td>
          <td>{{ stock['macd(12,26,9)'] }}</td>
          <td>{{ round(stock['rsi(14)']) }}</td>
          <td>{{ stock['rsi(14)_status'] }}</td>
          <td>{{ aots(stock) }}</td>
          <td>{{ stock['candlestick(1)'] }}</td>
        </tr>
      </tbody>
    </table>
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
      
      stocks: null,
      stock: null,

      searchSymbol: null,
      filters: [],
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
    this.fetchByDate()
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
          green_candle: s => s.close > s.open,
          red_candle: s => s.close < s.open,
          uptrend_short: s => s.trend_short == 'UPTREND',
          sideways_short: s => s.trend_short == 'SIDEWAYS',
          downtrend_short: s => s.trend_short == 'DOWNTREND',
          aots: s => this.aots(s) == true,
          oversold: s => s['rsi(14)_status'] == 'OVERSOLD',
        }

        _.map(this.filters, (filter) => {
          stocks = _.filter(stocks, filterFunctions[filter])
        })

        // if(this.filters.includes('uptrend_short')) {
        //   stocks = stocks.concat(_.filter(this.stocks, filterFunctions['uptrend_short']))
        // }
        // if(this.filters.includes('sideways_short')) {
        //   stocks = stocks.concat(_.filter(this.stocks, ))
        // }
        // if(this.filters.includes('downtrend_short')) {
        //   stocks = stocks.concat(_.filter(this.stocks, ))
        // }
        // if(this.filters.includes('aots')) {
        //   stocks = stocks.concat(_.filter(this.stocks, ))
        // }
        // if(this.filters.includes('oversold')) {
        //   stocks = stocks.concat(_.filter(this.stocks, ))
        // }
      }

      if(this.searchSymbol) {
        stocks = _.filter(stocks, (s) => s.stock.includes(this.searchSymbol.toUpperCase()))
      }

      // sorts
      let lodashSortFunctions = []
      const sortFunctions = {
        vol_change: (s) => this.volChangeFromVolumeAverage(s),
        aots: (s) => this.aots(s),
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
    sortType(sortField) {
      const sort = _.find(this.sorts, { field: sortField })
      if(sort)
        return sort.type
    },
    clearFilters() {
      this.filters = []
    },
    toggleFilter(filter) {
      this.filters = _.xor(this.filters, [filter])
    },
    toggleSort(sortField) {
      let sort = _.find(this.sorts, { field: sortField })
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
      // this.sorts = _.xorBy(this.sorts,  'field')
      // let sort = { field: sortField }
      // if(!this.sorts.includes(sortField)) {
      //   sort.type = 'desc'
      // } else {
      //   sort.type = sort.type == 'desc' ? 'asc' : 'desc'
      // }
    },
    onSelectDate(date) {
      this.fetchByDate(moment(date, 'YYYYMMD'))
    },
    fetchByDate(date) {
      this.date = date || moment()

      // if sunday or saturday, go to friday
      var dayOfWeek = moment(this.date).format('d')
      if(dayOfWeek == 0 || dayOfWeek == 6) {
        this.fetchByDate(this.date.subtract(1, 'day'))
        return
      }

      axios.get('/api/dailies/' + (Utils.getLatestTradingDate().format('YYYYMMD')))
      .then(function (response) {
        this.stocks = _
        .chain(response.data.data)
        // .filter(function(s) {
        //   return s['%change'] > 1
        // })
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
    volChangeFromVolumeAverage(stock, sma = 10) {
      const volAverage = stock[`volumesma(${sma})`]
      const vol = stock.volume
      return _.round(((vol - volAverage)/volAverage) * 100, 2)// + " " + `${vol} ${volAverage}`
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
</style>