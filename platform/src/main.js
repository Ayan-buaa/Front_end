import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "./assets/css/global.css"
import axios from 'axios'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
Vue.config.productionTip = false

Vue.prototype.$axios = axios
axios.defaults.baseURL='http://127.0.0.1:8000/'
Vue.prototype.$http=axios

Vue.directive('focus', {
  inserted: function(el) {
    el.querySelector('input').focus();
  }
});
Vue.prototype.error = function (msg) {
  this.$message.error(msg);
}

Vue.prototype.success = function (msg) {
  this.$message.success(msg);
}


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
