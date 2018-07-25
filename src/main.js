// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueTouch from 'vue-touch';
Vue.use(VueTouch);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App, VueTouch },
  template: '<App/>'
})
