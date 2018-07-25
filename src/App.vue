<template>
  <div id="app">
    <dashboard />
  </div>
</template>

<script>
  import dashboard from './Dashboard';

  export default {
    name: 'App',
    components: {
      dashboard,
    }
  }
</script>

<style lang="scss">
  @import './assets/scss/main.scss';
</style>
