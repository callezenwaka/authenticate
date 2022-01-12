import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

Vue.config.productionTip = false

/**
 * Register app
 * Handle page reloads
 * Check if user email is verified
 */
let app
let role = localStorage.getItem('role');
let profile = localStorage.getItem('profile');
if (role && profile) {
  store.dispatch('setProfile', profile);
  store.dispatch('setRole', role);
}
   
if (!app) {
  app = new Vue({
    el: '#app',
    router,
    store: store,
    render: h => h(App)
  })
}