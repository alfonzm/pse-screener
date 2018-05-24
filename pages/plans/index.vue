<template lang="jade">
  div
    table
      tr
        td stock
        td #
        td buy cost
        td entry
        td stoploss
        td trailing stop
        td target price
        td risk/reward
        td SL1 loss
        td trail stop loss/gain
        td TP profit
      
      plan
</template>

<style scoped lang="sass">
input
  display: inline-block
td
  padding: 8px
</style>

<script>
import calc from '~/utils/calc'
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