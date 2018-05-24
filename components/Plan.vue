<template lang="jade">
  tr
    td
      input(type="text" v-model="stock")
    td
      input(type="number" v-model="quantity")
    td
      {{ buyCost }}
      //- input(type="number" v-model="buyCost")
    td
      input(type="number" v-model="entry")
    td
      input(type="number" v-model="stopLoss")
    td
      input(type="number" v-model="trailingStop")
    td
      input(type="number" v-model="targetPrice")
    td
      {{ riskReward }}
    td
      {{ stopLossLoss }}
    td
      {{ trailingStopLossGain }}
    td
      {{ targetPriceProfit }}
</template>

<script>
import calc from '~/utils/calc'

export default {
  data() {
    return {
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
    compute() {
      this.buyCost = calc.getBuyCost(this.entry, this.quantity)
      this.targetPriceProfit = calc.getProfit(this.entry, this.targetPrice, this.quantity)
      this.stopLossLoss = calc.getProfit(this.entry, this.stopLoss, this.quantity)
      this.trailingStopLossGain = calc.getProfit(this.entry, this.trailingStop, this.quantity)
      this.riskReward = "1:" + calc.getRiskRewardRatio(this.entry, this.stopLoss, this.targetPrice)
    }
  },
  mounted() {
    this.compute()
  }
}
</script>

<style scoped lang="sass">
</style>