<template>
  <div>
    <my-header/>
    <main>
      <nuxt/>
    </main>
  </div>
</template>

<script>
import MyHeader from '~/components/Header.vue'

export default {
  components: {
    MyHeader
  }
}
</script>

<style lang="sass">
body
  margin: 0
  font-family: Lato;

main
  margin: 10px

nav
  a 
    margin-right: 10px
    font-weight: 700
</style>