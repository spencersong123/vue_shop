import Vue from 'vue'
import App from './App.vue'
import router from './router'
import'element-ui/lib/theme-chalk/index.css';
import "./assets/global.css"
import ElementUI from 'element-ui';
import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";

// 设置拦截器,为每次请求都携带上token参数,便于鉴权
axios.interceptors.request.use(config =>{
  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

Vue.use(ElementUI);
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
