import {
  cpus
} from "os";
import missions from "../missions.json"
import LogRocket from 'logrocket';
var osmAuth = require("osm-auth");
export default {
  modules: {
    commonData: {
      strict: true,
      namespaced: true,
      state: {
        identification: false,
        verification: false,
        confidenceValues: [
          'Non renseigné',
          'Peu confiant',
          'Confiant',
        ],
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
      },
      mutations: {
        setVerificationMode(state, mode) {
          state.verification = mode
        },
        setIdentificationMode(state, mode) {
          state.identification = mode
        }
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
        identificationMode: false,
        verificationMode: false
      },
      mutations: {
        setIdentificationMode(state, mode) {
          state.identificationMode = mode
        },
        setVerificationMode(state, mode) {
          state.verificationMode = mode
        },
        add(state, releve) {
          state.releves.push(releve)     
        },
        addFromOutside(state, releve) {
          state.releves.push(releve)
        },
        removeObservation(state, releve) {
          let index = state.releves.findIndex(val => val._id == releve._id)
          if (index != -1) {
            state.releves.splice(index, 1)
          }
        },
        setNoTree(state, releve) {
          let index = state.releves.findIndex(val => val._id == releve._id)
          if (index != -1) {
            state.releves[index].noTree = releve.noTree
          }
        },
        modify(state, newReleve) {
          let index = state.releves.findIndex(releve => releve._id == newReleve._id)
          if (index != -1) {
           // state.releves[index].test='truc'    
            state.releves.splice(index,1,newReleve)
            state.releves[index].prev=newReleve.prev
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
          let index = state.releves.findIndex(releve => releve._id == currentReleve._id)
          if (index != -1) {
            state.releves.splice(index, 1, currentReleve)
          }
        },
        validateFromOutside(state,observation){
          let index = state.releves.findIndex(releve => releve._id == observation._id)
          if (index != -1) {
            state.releves.splice(index, 1, observation)
          }
        },
        delete(state) {
          if (state.releve.length > 1) {
            state.releve.pop();
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
              commit('user/validate', response.data.observation, {
                root : true
              })
            })

          commit("user/pointsActions", ["VALIDATE"], {
            root : true
          })
        },
        modifyObservation({
          commit,
          state
        }, newReleve) {
          axios.defaults.withCredentials = true
          axios.post('/api/modifyObservation', {
              releve: newReleve
            })
            .then(function (response) {
              commit('modify', response.data.observation)
              let index = state.releves.findIndex(releve => releve._id == response.data.observation._id)
              commit('user/modify', state.releves[index], {
                root : true
              })
            })
          commit("user/pointsActions", extractActions(newReleve, false), {
            root : true
          })
        },
        setNoTree({
          commit
        }, releve) {
          axios.defaults.withCredentials = true
          axios.post('/api/noTree', {
              releve: releve
            })
            .then(function (response) {
              commit('setNoTree', response.data.observation)
            })
        },
        unsetNoTree({
          commit
        }, releve) {
          axios.defaults.withCredentials = true
          axios.post('/api/unsetNoTree', {
              releve: releve
            })
            .then(function (response) {
              commit('setNoTree', response.data.observation)
            })
        },

        remove({
          commit
        }, releve) {
          axios.defaults.withCredentials = true
          axios.post('/api/remove', {
              releve: releve
            })
            .then(function (response) {
              commit('removeObservation', releve)
            })

        },
        identification({
          state,
          commit
        }, releve) {
          commit("user/identification", releve, {
            root : true
          })
          axios.defaults.withCredentials = true
          axios.post('/api/identification', {
            releve: releve
          })
        },
        setObservation({
          state,
          commit,
          dispatch
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
              commit('user/add', response.data.observation, {
                root : true
              })
              if (response.data.observation.specie) {
                commit('arboretum/add', response.data.observation.specie, {
                  root: true
                })
              }
            }
          })
          commit('user/pointsActions', extractActions(releve, true), {
            root : true
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
        isAnon: false,
        formerName: null,
        formerId: null,
        notifProfil: 0,
        trophies: [],
        journal: [],
        score: 0,
        actionsTransActivite: new Map(),
        gamificationMode: true,
        differentSpecie: new Array(),
        differentGender: new Array(),
        mission: null,
        activite: null,
        indexActivite: 0,
        completion: 0,
        goal: 0
      },
      mutations: {
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
        clearSets(state) {
          state.differentSpecie.length = 0
          state.differentGender.length = 0
        },
        setGamificationMode(state, mode) {
          state.gamificationMode = mode
        },
        addActionTransActivite(state, param){
          state.actionsTransActivite.set(param.action, param.nbPoint)
        },
        clearActionsTransActivite(state) {
          state.actionsTransActivite.clear()
        },
        addPoints(state, nbPoint) {
          if (state.gamificationMode) {
            state.score += nbPoint
          }
        },
        pointsActions(state, actions) {
          if (state.gamificationMode) {
            for (let i = 0; i < actions.length; i++) {
              if (state.actionsTransActivite.has(actions[i])) {
                var nbPoint = parseInt(state.actionsTransActivite.get(actions[i]))
                var line = new Object()
                line.action = actions[i]
                line.nbPoint = nbPoint
                state.journal.unshift(line)
                state.score += nbPoint
              }
            }
          } 
        },
        updateJournal(state, line) {
          state.journal.unshift(line)
        },
        addTrophie(state, trophie) {
          for (let i = 0 ; i < state.trophies.length; i++) {
            if (state.trophies[i].name == trophie.name) return
          }
          state.trophies.push(trophie)
        },
        winTrophy(state, trophyName) {
          for (let i = 0; i<state.trophies.length; i++) {
            if (state.trophies[i].name == trophyName && state.trophies[i].obtenu == false) {
              state.trophies[i].obtenu = true
              state.notifProfil++
            }
          }  
        },
        addNotifProfil(state, nbNotif) {
          if (state.nbNotif == null) {
            state.nbNotif = 0
          }
          state.notifProfil += nbNotif
        },
        clearNotifProfil(state) {
          state.notifProfil = null
        },
        set(state, user) {
          LogRocket.identify(user.id,{name:user.name})
          state.name = user.name
          state.id = user.id
        },
        changeIdentity(state, user) {
          state.formerName = state.name
          state.formerId = state.id
          state.name = user.name
          state.id = user.id
        },
        restoreIdentity(state) {
          state.name = state.formerName
          state.id = state.formerId
        },
        add(state, releve) {
          if (releve.image) {
            updateCompletion(state, "add_photo", releve)
          } else {
             updateCompletion(state, "add", releve)
          } 
        },
        modify(state, releve) {
          if (releve.image) {
            updateCompletion(state, "modify/validate_photo", releve)
          } else {
            updateCompletion(state, "modify/validate", releve)
          }
        },
        validate(state, releve) {
           updateCompletion(state, "modify/validate", releve)
        },
        identification(state, releve) {
           updateCompletion(state, "identification", releve)
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
        setAnonymous({
          commit,
          state
        }) {
          state.isAnon = true
          axios.post('/api/anonymous')
            .then(function (response) {
              let {
                username,
                userId
              } = response.data
              commit('changeIdentity', {
                name: username,
                id: userId
              })
            })
        },
        restoreSession({
          state,
          commit
        }) {
          state.isAnon = false
          axios.post('/api/restoreSession', {
              id: state.formerId,
              username: state.formerName
            })
            .then(function (response) {
              commit('restoreIdentity')
            })
        },
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


function updateCompletion(state, operation, releve) {

  var mode = state.activite.mode

  let {specie, genus} = releve

  var differentID = !(releve.osmId == releve.modifierId)

  if (mode == 'verification' && differentID) {
    if (operation.includes('modify/validate')) state.completion++
  } else if (mode == 'identification') {
    if (operation == 'identification') state.completion++
  } else if (mode == 'classic') {

    var action = state.activite.activityType.action

    if (action == 'LOCATE' && operation.includes('add')) {
      state.completion++
    }
      
    else if ((action == 'IDENTIFY' && operation.includes('add')) ||
          (action == 'VERIFY' && operation.includes('modify/validate')) ||
          (action == 'PHOTOGRAPH' && operation.includes('photo'))) {

        if (specie != null && !state.differentSpecie.includes(specie)) {
          state.differentSpecie.push(specie)
        }

        if (genus != null && !state.differentGender.includes(genus)) {
          state.differentGender.push(genus)
        }
            
        var object = state.activite.activityType.object

        if (object == 'TREE'){
          state.completion++;
        } else if (object == 'SPECIE' && specie != null && state.activite.activityType.specie.toUpperCase() == specie.toUpperCase()){
          state.completion++;
        } else if (object == 'GENUS' && genus != null && state.activite.activityType.genus.toUpperCase() == genus.toUpperCase()){
          state.completion++;
        } else if (object == 'DIFFERENTSPECIE'){
          state.completion = state.differentSpecie.length;
        } else if (object == 'DIFFERENTGENUS'){
          state.completion = state.differentGender.length;
        } 
    }
  }
    
}

function extractActions(releve, identification) {
  var actions = []
  if (identification) {
    actions.push("IDENTIFY")
  }
  if (releve.specie) {
    actions.push("COMPLETE_SPECIE")
  }
  if (releve.genus) {
    actions.push("COMPLETE_GENUS")
  }
  if (releve.common) {
    actions.push("COMPLETE_COMMON")
  }
  if (releve.image) {
    actions.push("PHOTOGRAPH")
  }
  return actions
}
