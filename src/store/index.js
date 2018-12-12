import Vue from 'vue';
import Vuex from 'vuex';

import myStore from './routeStore';
import userStore from './userStore';
console.log(myStore)
Vue.use(Vuex);

export const store = new Vuex.Store(
       {modules:{ myStore,userStore}}
);
