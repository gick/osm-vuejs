import {
  cpus
} from "os";
import missions from "../missions.json"
var osmAuth = require("osm-auth");
export default {
  modules: {
    commonData: {
      strict: true,
      namespaced: true,
      state: {
          identification:false,
          verification:false,
          heights: [
            "Inconnue",
            "Moins de 4m",
            "4 à 8m",
            "8 à 12m",
            "12 à 16m",
            "16 à 20m",
            "20 à 24m",
            "24 à 28m",
            "28 à 32m",
            "Plus de 32m"
          ],
      }
    },
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
          axios.get('/api/osmdata', {
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
        addMultiple(state, releves) {
          for (var releve of releves) {
            if (releve.specie) {
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
        actionsTransActivite: new Map(),
        differentSpecie: new Array(),
        differentGender: new Array(),
        mission: null,
        activite: null,
        indexActivite: 0,
        completion: 0,
        goal: 0,
        chgtActivity: 0,
        score: 0,
        trophies: [],
        identificationMode: false,
        verificationMode: false,
        journal: [],
        notifProfil: 0
      },
      mutations: {
        addNotifProfil(state, nbNotif) {
          if (state.nbNotif == null) {
            state.nbNotif = 0
          }
          state.notifProfil += nbNotif
        },
        clearNotifProfil(state) {
          state.notifProfil = null
        },
        setIdentificationMode(state, mode) {
          state.identificationMode = mode
        },
        setVerificationMode(state, mode) {
          state.verificationMode = mode
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
        addPoints(state, nbPoint) {
          state.score += nbPoint
        },
        add(state, releve) {
          state.releves.push(releve)
          if (releve.image) {
            updateCompletion(state, "add_photo", releve.specie)
          } else {
            updateCompletion(state, "add", releve.specie)
          }
        },
        addFromOutside(state, releve) {
          state.releves.push(releve)
        },

        addActionTransActivite(state, params) {
          state.actionsTransActivite.set(params.split('#')[0], params.split('#')[1])
        },
        addTrophie(state, trophie) {
          state.trophies.unshift(trophie)
          state.notifProfil++
        },
        clearActionsTransActivite(state) {
          state.actionsTransActivite.clear()
        },
        updateJournal(state, line) {
          state.journal.unshift(line)
        },
        removeObservation(state,releve){
          let index = state.releves.findIndex(val => val._id == releve._id)
          if(index!=-1){
            state.releves.splice(index,1)
          }
        },
        setNoTree(state,releve){
          let index = state.releves.findIndex(val => val._id == releve._id)
          if(index!=-1){
            state.releves[index].noTree=releve.noTree
          }
        },
        modify(state, newReleve) {
          let index = state.releves.findIndex(releve => releve._id == newReleve._id)
          if (index != -1) {
            // state.releves[index].test='truc'    
            state.releves.splice(index, 1, newReleve)
            state.releves[index].prev = newReleve.prev
            var indexRelevePrecedent = state.releves[index].prev.length - 1
            if (newReleve.image) {
              updateCompletion(state, "modify/validate_photo", state.releves[index].prev[indexRelevePrecedent].specie)
            } else {
           //   updateCompletion(state, "modify/validate", state.releves[index].prev[indexRelevePrecedent].specie)
            }
          }
        },
        modifyFromOutside(state, newReleve) {
          let index = state.releves.findIndex(releve => releve._id == newReleve._id)
          if (index != -1) {
            // state.releves[index].test='truc'    
            state.releves.splice(index, 1, newReleve)
            state.releves[index].prev = newReleve.prev
          }
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
            state.releves.splice(index, 1, currentReleve)
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
        },
        pointsActions(state, actions) {
          for (let i = 0; i < actions.length; i++) {
            if (state.actionsTransActivite.has(actions[i])) {
              var nbPoint = parseInt(state.actionsTransActivite.get(actions[i]))
              var line = new Object()
              line.action = actions[i]
              line.nbPoint = nbPoint
              state.journal.unshift(line)
              //  this.$toasted.show("Vous avez obtenu " + nbPoint + " points bonus pour " + actions[i], {fullWidth:true, position:"bottom-center",duration: 2000 });
              state.score += nbPoint
            }
          }
        }
      },
      actions: {
        validateObservation({
          commit
        }, releve) {
          axios.defaults.withCredentials = true

          axios.post('/api/validate', {
              releve: releve
            })
            .then(function (response) {
              commit('validate', response.data.observation)
            })

          commit("pointsActions", ["VALIDER"])
        },
        modifyObservation({
          commit
        }, newReleve) {
          axios.defaults.withCredentials = true
          axios.post('/api/modifyObservation', {
              releve: newReleve
            })
            .then(function (response) {
              commit('modify', response.data.observation)
            })
          commit("pointsActions", extractActions(newReleve, false))
        },
        setNoTree({commit},releve){
          axios.defaults.withCredentials = true
          axios.post('/api/noTree', {
            releve: releve
          })
          .then(function(response){
            commit('setNoTree',response.data.observation)
          })
        },
        unsetNoTree({commit},releve){
          axios.defaults.withCredentials = true
          axios.post('/api/unsetNoTree', {
            releve: releve
          })
          .then(function(response){
            commit('setNoTree',response.data.observation)
          })
        },

        remove({commit},releve){
          axios.defaults.withCredentials = true
          axios.post('/api/remove', {
            releve: releve
          })
          .then(function(response){
            commit('removeObservation',releve)
          })

        },
        identification({
          state,
          commit
        }, releve) {
          axios.defaults.withCredentials = true
          axios.post('/api/identification', {
            releve: releve
          })
        },
        setObservation({
          state,
          commit
        }, releve) {

          // commit('add', releve)
          axios.defaults.withCredentials = true
          if (state.identificationMode) {
            releve.identificationMode = true
          }
          axios.post('/api/observation', {
            releve
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
          commit("pointsActions", extractActions(releve, true))
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
        isAnon:false,
        formerName:null,
        formerId:null,
      },
      mutations: {
        set(state, user) {
          state.name = user.name
          state.id = user.id
        },
        changeIdentity(state, user) {
          state.formerName=state.name
          state.formerId=state.id
          state.name = user.name
          state.id = user.id
        },
        restoreIdentity(state){
          state.name=state.formerName
          state.id=state.formerId
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
        setAnonymous({commit,state}){
          state.isAnon=true
          axios.post('/api/anonymous')
          .then(function(response){
            let {username, userId}=response.data
            commit('changeIdentity',{name:username,id:userId})
          })
        },
        restoreSession({state,commit}){
          state.isAnon=false
          axios.post('/api/restoreSession',{id:state.formerId,username:state.formerName})
          .then(function(response){
            commit('restoreIdentity')
          })
        }
        ,
        loadObservation({
          commit
        }) {
          axios.get('/api/observation')
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
              return axios.get('/api/login', {
                params: {
                  id: user.getAttribute('id'),
                  name: user.getAttribute('display_name'),
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
    users: {
      strict: true,
      namespaced: true,
      state: {
        userList: []
      },
      mutations: {
        addUser(state, user) {
          let index = state.userList.findIndex(val => val.id == user.id)
          if (index == -1)
            state.userList.push(user);
        },
        removeUser(state, user) {
          let index = state.userList.findIndex(val => val.id == user.id)
          state.userList.splice(index, 1)
        }
      }

    },
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

  if (specie == null || specie == '') {
    return
  }

  var action = state.activite.typeActivite.action
  if ((action == 'IDENTIFIER' && operation.includes('add')) ||
    (action == 'VERIFIER' && operation.includes('modify/validate')) ||
    (action == 'PHOTOGRAPHIER' && operation.includes('photo'))) {

    if (!state.differentSpecie.includes(specie)) {
      state.differentSpecie.push(specie)
    }

    if (!state.differentGender.includes(specie.split(' ')[0])) {
      state.differentGender.push(specie.split(' ')[0])
    }

    var objet = state.activite.typeActivite.objet

    if (objet == 'ARBRE') {
      state.completion++;
    } else if (objet == 'ESPECE' && state.activite.espece.toUpperCase() == specie.toUpperCase()) {
      state.completion++;
    } else if (objet == 'GENRE' && specie.indexOf(state.activite.genre) == 0) {
      state.completion++;
    } else if (objet == 'ESPECESDIFFERENTES') {
      state.completion = state.differentSpecie.length;
    } else if (objet == 'GENRESDIFFERENTS') {
      state.completion = state.differentGender.length;
    }

    if (state.completion == state.goal) {
      state.chgtActivity++;
    }
  }
}

function extractActions(releve, identification) {
  var actions = []
  if (identification) {
    actions.push("IDENTIFIER")
  }
  if (releve.specie) {
    actions.push("COMPLETER_ESPECE")
  }
  if (releve.genus) {
    actions.push("COMPLETER_GENRE")
  }
  if (releve.common) {
    actions.push("COMPLETER_NOM")
  }
  if (releve.image) {
    actions.push("PHOTOGRAPHIER")
  }
  return actions
}