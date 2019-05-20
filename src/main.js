
import 'onsenui/css/onsenui.css'; // Onsen UI basic CSS
// import 'onsenui/css/onsen-css-components.css'; // Default Onsen UI CSS components
import './onsen-css-components.css'; // Onsen UI CSS components source for custom themes (requires cssnext)
import './vue-onsenui-kitchensink.css'; // CSS specific to this app
import VueLodash from 'vue-lodash'
window._=require('lodash')
//TODO remove Vue-lodash
import Toasted from 'vue-toasted';
import LogRocket from 'logrocket';
LogRocket.init('mpgeqr/albiziapp');
import createPlugin from 'logrocket-vuex';

const logrocketPlugin = createPlugin(LogRocket);

import Vue from 'vue';
import Vuex from 'vuex';
import VueOnsen from 'vue-onsenui'; // For UMD

import BootstrapVue from 'bootstrap-vue' // For progressBar

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import BProgress from 'bootstrap-vue/es/components/progress/progress'
import BProgressBar from 'bootstrap-vue/es/components/progress/progress-bar'
import vSelect from 'vue-select'


// import VueOnsen from 'vue-onsenui/esm'; // For ESM
// import * as OnsenComponents from './onsen-components'; // For ESM
import storeLike from './store/routeStore';
import CustomToolbar from './partials/CustomToolbar.vue';
import AppNavigator from './AppNavigator.vue';
import 'vue-select/dist/vue-select.css';
import progressionPlugin from './store/progressionPlugin'
import knowledgePlugin from './store/knowledgePlugin'

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
Vue.config.devtools = true
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});
window.location.hash = "#de";
Vue.use(Toasted, {
    iconPack : 'fontawesome' // set your iconPack, defaults to material. material|fontawesome|custom-class
});
Vue.component('v-select', vSelect)
Vue.use(VueLodash)
Vue.use(Vuex);
Vue.use(VueOnsen);
Vue.use(BootstrapVue)
Vue.use(require('vue-moment'));
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

import Progress from 'vue-multiple-progress'
Vue.component('VmProgress', Progress)

new Vue({
  el: '#app',
  render: h => h(AppNavigator),
  store: new Vuex.Store({modules:storeLike.modules,  plugins: [knowledgePlugin]  }),
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
