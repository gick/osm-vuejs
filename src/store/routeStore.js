import {
  cpus
} from "os";
var osmAuth = require("osm-auth");
export default {
  modules: {
    navigator: {
      strict: true,
      namespaced: true,
      state: {
        stack: [],
        options: {}
      },
      mutations: {
        push(state, page) {
          state.stack.push(page);
        },
        pop(state) {
          if (state.stack.length > 1) {
            state.stack.pop();
          }
        },
        replace(state, page) {
          state.stack.pop();
          state.stack.push(page);
        },
        reset(state, page) {
          state.stack = [page || state.stack[0]];
        },
        options(state, newOptions = {}) {
          state.options = newOptions;
        }
      }
    },
    releve: {
      strict: true,
      namespaced: true,
      state: {
        releves: [],
      },
      mutations: {
        add(state, releve) {
          state.releves.push(releve);
        },
        addMultiple(state,observations){
          for(var observation of observations){
            state.releves.push(observation)
          }
        },
        delete(state) {
          if (state.releve.length > 1) {
            state.releve.pop();
          }
        },
      },
      actions:{
        setObservation({commit},releve){
          commit('add',releve)
          axios.defaults.withCredentials = true
                    axios.post('http://osm.reveries-project.fr:8000/observation',
          {releve:releve})
        }}

    },

    splitter: {
      strict: true,
      namespaced: true,
      state: {
        open: false
      },
      mutations: {
        toggle(state, shouldOpen) {
          if (typeof shouldOpen === 'boolean') {
            state.open = shouldOpen;
          } else {
            state.open = !state.open;
          }
        }
      }
    },
    completion: {
      strict: true,
      namespaced: true,
      state: {
        rate: 0
      },
      mutations: {
        set(state, rate) {
          state.rate = state.rate + rate;
        }
      }
    },
    user: {
      strict: true,
      namespaced: true,
      state: {
        name: null,
        id: null,
      },
      mutations: {
        set(state, user) {
          state.name = user.name
          state.id = user.id
        }
      },
      actions: {
        logout({
          commit
        }) {
          var auth = osmAuth({
            oauth_secret: '9WfJnwQxDvvYagx1Ut0tZBsOZ0ZCzAvOje3u1TV0',
            oauth_consumer_key: 'WLwXbm6XFMG7WrVnE8enIF6GzyefYIN6oUJSxG65',
            auto: true
          });
          auth.logout();
          commit("set", {
            name: null,
            id: null
          });
        },
        loadObservation({commit}){
          axios.get('http://osm.reveries-project.fr:8000/observation')
          .then(function(res){commit('releve/addMultiple',res.data,{root:true})})
        }
        ,
        login({
         dispatch, commit
        }) {
          var auth = osmAuth({
            oauth_secret: 'ycJOK6xrlW0tPXb280k1VLkH4zGlsaGyTPm4vGvr',
            oauth_consumer_key: '1zPARMhKbBJfy6lZa9Jt3SvXOM4D3bxr1s3pMly0',
            auto: true,
          });
          auth.authenticate(function () {
            auth.xhr({
              method: 'GET',
              path: '/api/0.6/user/details'
            }, (err, res) => {
              var user = res.getElementsByTagName('user')[0]
              let userObject = {
                name: user.getAttribute('display_name'),
                id: user.getAttribute('id')
              }
              axios.defaults.withCredentials = true
              commit('set', userObject)
             return axios.get('http://osm.reveries-project.fr:8000/login',{params: {
                id: user.getAttribute('id')
              }}).then(function(){
                dispatch('loadObservation')
              })

            });
          }.bind(this));
        }
      }
    }


    ,

    tabbar: {
      strict: true,
      namespaced: true,
      state: {
        index: 1
      },
      mutations: {
        set(state, index) {
          state.index = index;
        }
      }
    }
  }
};