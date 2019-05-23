import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import validator from "./validator";

Vue.use(ElementUI);
Vue.config.productionTip = false;
Vue.use(validator);

new Vue({
  render: h => h(App)
}).$mount("#app");
