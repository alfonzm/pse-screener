<template>
  <div>
    <template v-for="date in dates">
      <a href="#" @click="onSelectDate(date)">{{ date }}</a> /
    </template>
    
    <br><br>

    Top stocks for {{ moment(date).format('MMMM D, YYYY') }}
    <div v-if="status == 'loading'">Loading...</div>
    <div v-else-if="status == 'error'">ERROR LOADING STOCKS</div>
    <table>
      <thead>
        <td>chart</td>
        <td>stock</td>
        <td>% change</td>
        <td>vol change from ave</td>
        <td>vol change from prev</td>
      </thead>
      <tbody>
        <tr v-for="stock in stocks">
          <td><a :href=`https://investagrams.com/stock/${stock.symbol}` target="_blank">chart</a></td>
          <td><a href="#" @click="viewStats(stock.symbol)">{{ stock.symbol }}</a> ({{ stock.name}})</td>
          <td>{{ stock.percent_change }}%</td>
          <td>{{ volChangeFromAverage(stock) }}</td>
          <td>{{ volChange(stock) }}%</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from '~/plugins/axios'
import moment from 'moment'

export default {
  data() {
    return {
      date: null,
      status: '',
      iframeSrc: null,
      
      stocks: null,
      stock: null
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
  methods: {
    moment(d) {
      return moment(d)
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

      axios.get('/stocks/' + (date ? date.format('YYYYMMD') : ''))
      .then(function (response) {
        this.stocks = _
        .chain(response.data.stock)
        .filter(function(s) {
          return s.percent_change > 1
        })
        .orderBy('percent_change', 'desc')
        .value()

        _.forEach(this.stocks, function(stock) {
          this.getStats(stock.symbol)
        }.bind(this))

        this.status = 'done'
      }.bind(this))
      .catch(function (error) {
        this.status = 'error'
      }.bind(this))
    },
    getStats(symbol) {
      console.log(symbol)
      axios.get('/stock/' + symbol)
      .then(function(response){
        var stock = _.find(this.stocks, { symbol: symbol })
        Vue.set(stock, 'data', response.data)
      }.bind(this))
    },
    volChange(stock) {
      if(stock.data) {
        let latestVol = stock.data.v[stock.data.v.length-1]
        let previousVol = stock.data.v[stock.data.v.length-2]
        return _.round(((latestVol - previousVol)/previousVol) * 100, 2)
      }
    },
    volAverage(stock) {
      if(stock.data) {
        return _.round(_.mean(stock.data.v))
      }
    },
    volCount(stock) {
      if(stock.data) {
        return stock.data.v.length
      }
    },
    volChangeFromAverage(stock) {
      if(stock.data) {
        let volAverage = this.volAverage(stock)
        let currentVol = _.last(stock.data.v)
        return ((currentVol - volAverage)/volAverage) * 100
      }
    }
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