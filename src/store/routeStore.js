import {
  cpus
} from "os";
import missions from "../missions.json"
var osmAuth = require("osm-auth");
export default {
  modules: {
    osmData: {
      strict: true,
      namespaced: true,
      state: {
        data: [],
      },
      mutations: {
        setData(state, data) {
          state.data = data
        }
      },
      actions: {
        getOSMData({
          commit
        }, boundary) {

          let south = boundary.boundary._southWest.lat
          let west = boundary.boundary._southWest.lng
          let north = boundary.boundary._northEast.lat
          let east = boundary.boundary._northEast.lng
          axios.get('/osmdata', {
            params: {
              south: south,
              west: west,
              north: north,
              east: east
            }
          }).then(function (response) {
            console.log(response.data)
            commit('setData', response.data)
          })
        }
      }
    },
    arboretum: {
      strict: true,
      namespaced: true,
      state: {
        species: []
      },
      mutations: {
        add(state, specie) {
          state.species.push(specie)
        },
        addMultiple(state,releves){
          for(var releve of releves){
            if(releve.specie){
              state.species.push(releve.specie)
            }
          }
        }
      }
    },
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
        differentSpecie: new Array(),
        differentGender: new Array(),
        mission: null,
        activite: null,
        indexActivite : 0,
        completion: 0,
        goal: 0,
        activiteEnCours : 0
      },
      mutations: {
        photoAjoutee(state, specie) {
          updateCompletion(state, "photo", specie)
        },
        setCompletion(state, completion) {
          state.completion = completion;
        },
        setGoal(state, goal) {
          state.goal = goal;
        },
        setIndexActivite(state, index) {
          state.indexActivite = index
        },
        setActivite(state, activite) {
          state.activite = activite
        },
        setMission(state, mission) {
          state.mission = mission
        },
        add(state, releve) {
          state.releves.push(releve)
          updateCompletion(state, "add", releve.specie)            
        },
        modify(state, newReleve) {
          let index = state.releves.findIndex(releve => releve._id == newReleve.id)
          if (index != -1) {
            updateCompletion(state, "modify/validate", state.releves[index].specie)
            state.releves[index].specie = newReleve.specie
            state.releves[index].genus = newReleve.genus
          }    

          axios.post('/modifyObservation', state.releves[index])
        },
        addMultiple(state, observations) {
          for (var observation of observations) {
            state.releves.push(observation)
          }
        },
        validate(state, currentReleve) {

          updateCompletion(state, "modify/validate", currentReleve.specie)

          let index = state.releves.findIndex(releve => releve._id == currentReleve._id)
          if (index != -1) {
            state.releves[index].validated = true
          }
        },
        delete(state) {
          if (state.releve.length > 1) {
            state.releve.pop();
          }
        },
        clearSets(state) {
          state.differentSpecie.length = 0
          state.differentGender.length = 0
        }
      },
      actions: {
        setObservation({
          commit
        }, releve) {
          commit('add', releve)
          axios.defaults.withCredentials = true
          axios.post('/observation', {
            releve: releve
          }).then(function (response) {
            if (response.data.observation) {
              commit('add', response.data.observation)
              if (response.data.observation.specie) {
                commit('arboretum/add', response.data.observation.specie, {
                  root: true
                })
              }
            }
          })
        }
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
            oauth_consumer_key: 'WLwXbm6XFMG7WrVnE8enIF6GzyefYIN6oUJSxG65'
          });
          auth.logout();
          commit("set", {
            name: null,
            id: null
          });
        },
        loadObservation({
          commit
        }) {
          axios.get('/observation')
            .then(function (res) {
              commit('releve/addMultiple', res.data, {
                root: true
              })
              commit('arboretum/addMultiple', res.data, {
                root: true
              })
            })
        },
        login({
          dispatch,
          commit
        }) {
          var auth = osmAuth({
            oauth_secret: 'ycJOK6xrlW0tPXb280k1VLkH4zGlsaGyTPm4vGvr',
            oauth_consumer_key: '1zPARMhKbBJfy6lZa9Jt3SvXOM4D3bxr1s3pMly0'
          });
          auth.authenticate(function () {
            auth.xhr({
              method: 'GET',
              path: '/api/0.6/permissions'
            }, function (err, details) {
              console.log(err);
              console.log(details);
            });

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
              return axios.get('/login', {
                params: {
                  id: user.getAttribute('id')
                }
              }).then(function () {
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


function updateCompletion(state, operation, specie) {
  if (specie == '') return
  var typeAction = state.activite.typeActivite.split('')[0]
  if ((typeAction == 'A' && operation == 'add') ||
      (typeAction == 'B' && operation == 'modify/validate') ||
      (typeAction == 'C' && operation == 'photo' )) {

    if (!state.differentSpecie.includes(specie)) {
      state.differentSpecie.push(specie)
    }
          
    if (!state.differentGender.includes(specie.split(' ')[0])) {
      state.differentGender.push(specie.split(' ')[0])
    }
        
    var numAction = state.activite.typeActivite.split('')[1]

    if (numAction == '1'){
      state.completion++;
    } else if (numAction == '2' && state.activite.espece == specie){
        state.completion++;
    } else if (numAction == '3' && specie.indexOf(state.activite.genre) == 0){
      state.completion++;
    } else if (numAction == '4'){
      state.completion = state.differentSpecie.length;
    } else if (numAction == '5'){
      state.completion = state.differentGender.length;
    } 

    if (state.completion == state.goal) {          
      state.activiteEnCours++;
    }
  }  
}


