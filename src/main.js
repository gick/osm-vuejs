import 'onsenui/css/onsenui.css'; // Onsen UI basic CSS
// import 'onsenui/css/onsen-css-components.css'; // Default Onsen UI CSS components
import './onsen-css-components.css'; // Onsen UI CSS components source for custom themes (requires cssnext)
import './vue-onsenui-kitchensink.css'; // CSS specific to this app

import Vue from 'vue';
import Vuex from 'vuex';
import VueOnsen from 'vue-onsenui'; // For UMD
import VueSocketIO from 'vue-socket.io'

import BootstrapVue from 'bootstrap-vue' // For progressBar

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import BProgress from 'bootstrap-vue/es/components/progress/progress'
import BProgressBar from 'bootstrap-vue/es/components/progress/progress-bar'

// import VueOnsen from 'vue-onsenui/esm'; // For ESM
// import * as OnsenComponents from './onsen-components'; // For ESM
import storeLike from './store/routeStore';
import CustomToolbar from './partials/CustomToolbar.vue';
import AppNavigator from './AppNavigator.vue';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
Vue.config.devtools = true
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});
Vue.use(new VueSocketIO({
  debug: true,
  connection: 'https://albiziapp.reveries-project.fr/',
  vuex: {
      storeLike,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
  } ,
}))
window.location.hash = "#de";

Vue.use(Vuex);
Vue.use(VueOnsen);
Vue.use(BootstrapVue)
window.addEventListener("hashchange", function(){
  console.log("Hash changed to", window.location.hash);
    window.location.hash = "#albiziapp"
  
  // .... Do your thing here...
});

// Register components globally
// Object.values(OnsenComponents).forEach(component => Vue.component(component.name, component)); // For ESM
Vue.component('custom-toolbar', CustomToolbar); // Common toolbar
Vue.component('b-progress', BProgress);
Vue.component('b-progress-bar', BProgressBar);

new Vue({
  el: '#app',
  render: h => h(AppNavigator),
  store: new Vuex.Store(storeLike),
  beforeCreate() {
    // Shortcut for Material Design
    Vue.prototype.md = this.$ons.platform.isAndroid();

    // Set iPhoneX flag based on URL
    if (window.location.search.match(/iphonex/i)) {
      document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
      document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
    }
  }
});
