<template lang="jade">
  div
    table.stocks-table
      tbody
        tr
          th.stock Stock
          th.quantity #
          th.entry Entry
          th.target-price TP
          th.stop-loss Stop Loss
          th.trailing-stop Trailing Stop
          th.buy-cost Total Cost
          th.risk-reward Risk/Reward
          th.target-price-profit Profit
          th.stop-loss-loss SL Loss
          th.trailing-stop-loss-gain Trail Loss
      
        plan
        plan
        plan

    button Add trade plan
</template>

<script>
import Plan from '~/components/Plan.vue'

export default {
  layout: 'default',
  components: {
    Plan
  },
  mounted() {
  }
}
</script>

<style lang="sass">
$baseColumnWidth: 100px

table.stocks-table
  table-layout: fixed
  border-spacing: 0

  td, th
    text-align: center

    input
      width: 100%

.stock
  width: 60px
.quantity
  width: $baseColumnWidth
.buy-cost
  width: $baseColumnWidth
.entry
  width: $baseColumnWidth
.stop-loss
  width: $baseColumnWidth
.trailing-stop
  width: $baseColumnWidth
.target-price
  width: $baseColumnWidth
.risk-reward
  width: $baseColumnWidth
.stop-loss-loss
  width: $baseColumnWidth
.trailing-stop-loss-gain
  width: $baseColumnWidth
.target-price-profit
  width: 150px


</style>