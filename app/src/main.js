// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './App'
import store from './store'
import router from './router'

import BN from 'bignumber.js'
Object.defineProperty(Vue.prototype, '$BN', { value: BN })

import Clv from '@/components/CloverFunc'
import CloverIcon from '@/components/CloverIcon'
import CloverGridItem from '@/components/CloverGridItem'

Vue.component('clv', Clv)
Vue.component('clover-icon', CloverIcon)
Vue.component('clover-grid-item', CloverGridItem)

Vue.config.productionTip = false

sync(store, router)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})
