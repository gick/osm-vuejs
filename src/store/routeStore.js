import { cpus } from "os";
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
        setGenusSpecie(state,genusSpecie){
          var currentState=state.releves.pop()
          currentState.genus=genusSpecie.genus
          currentState.specie=genusSpecie.specie
          state.releves.push(currentState)
        },
        delete(state) {
          if (state.releve.length > 1) {
            state.releve.pop();
          }
        },
      }
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
          state.rate = state.rate+rate;
        }
      }
    }
    ,
    user: {
      strict: true,
      namespaced: true,
      state: {
        name: null,
        id:null,
      },
      mutations: {
        set(state, user) {
          state.name = user.name
          state.id = user.id
        }},
      actions:{
        logout({commit}) {
          var auth = osmAuth({
            oauth_secret: '9WfJnwQxDvvYagx1Ut0tZBsOZ0ZCzAvOje3u1TV0',
            oauth_consumer_key: 'WLwXbm6XFMG7WrVnE8enIF6GzyefYIN6oUJSxG65',
            auto: true
          });
          auth.logout();
          commit("set", { name: null, id: null });
        },
    
        login({commit}){
          var auth = osmAuth({
            oauth_secret: '9WfJnwQxDvvYagx1Ut0tZBsOZ0ZCzAvOje3u1TV0',
            oauth_consumer_key: 'WLwXbm6XFMG7WrVnE8enIF6GzyefYIN6oUJSxG65',
            auto: true
          });
          auth.authenticate(
            function() {
              auth.xhr(
                {
                  method: "GET",
                  path: "/api/0.6/user/details"
                },
                (err, res) => {
                  var user = res.getElementsByTagName("user")[0];
                  let userObject = {
                    name: user.getAttribute("display_name"),
                    id: user.getAttribute("id")
                  };
                  commit("set", userObject);
                }
              );
            }.bind(this)
          );
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
