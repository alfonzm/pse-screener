<template lang="jade">
  tr
    td.stock
      input(type="text" v-model="stock")
    td.quantity
      input(type="number" v-model="quantity")
    td.entry
      input(type="number" v-model="entry")
    td.target-price
      input(type="number" v-model="targetPrice")
    td.stop-loss
      input(type="number" v-model="stopLoss")
    td.trailing-stop
      input(type="number" v-model="trailingStop")
    td.buy-cost
      {{ currencify(buyCost) }}
    td.risk-reward
      {{ riskReward }}
    td.target-price-profit
      {{ currencify(targetPriceProfit) }} 
      template(v-if="targetPriceProfit && buyCost") ({{ Calc.getPercentChange(targetPriceProfit, buyCost) }}%)
    td.stop-loss-loss
      {{ currencify(stopLossLoss) }}
      template(v-if="stopLossLoss && buyCost") ({{ Calc.getPercentChange(stopLossLoss, buyCost) }}%)
    td.trailing-stop-loss-gain
      {{ currencify(trailingStopLossGain) }}
</template>

<script>
import Calc from '~/utils/calc'
import Utils from '~/utils/utils'

export default {
  data() {
    return {
      Calc,
      
      stock: null,
      quantity: null,
      buyCost: null,
      entry: null,
      stopLoss: null,
      trailingStop: null,
      riskReward: null,
      stopLossLoss: null,
      trailingStopLossGain: null,
      targetPriceProfit: null,
      targetPrice: null
    }
  },
  watch: {
    quantity() {
      this.compute()
    },
    entry() {
      this.compute()
    },
    targetPrice() {
      this.compute()
    },
    stopLoss() {
      this.compute()
    },
    trailingStop() {
      this.compute()
    },
  },
  methods: {
    Calc() {
      return Calc
    },
    currencify(amount) {
      return Utils.currencify(amount)
    },
    compute() {
      this.buyCost = Calc.getBuyCost(this.entry, this.quantity)
      this.targetPriceProfit = Calc.getProfit(this.entry, this.targetPrice, this.quantity)
      this.stopLossLoss = Calc.getProfit(this.entry, this.stopLoss, this.quantity)
      this.trailingStopLossGain = Calc.getProfit(this.entry, this.trailingStop, this.quantity)
      this.riskReward = "1:" + Calc.getRiskRewardRatio(this.entry, this.stopLoss, this.targetPrice)
    }
  },
  mounted() {
    this.compute()
  }
}
</script>

<style scoped lang="sass">
td
  padding: 4px 

  input[type="number"]
    text-align: center

  input
    font-family: Lato
    padding: 3px
    font-size: 1em
    border: 0
    outline: none
    background-color: #f2f2f2

</style>