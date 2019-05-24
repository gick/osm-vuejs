import {
  cpus
} from "os";
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
        knowledgeRules:[],
        explorationRules:[]
      },
      mutations: {
        setVerificationMode(state, mode) {
          state.verification = mode
        },
        setIdentificationMode(state, mode) {
          state.identification = mode
        },
        addKnowledgeRule(state, rule) {
          state.knowledgeRules.push(rule)
        },
        addExplorationRule(state, rule) {
          state.explorationRules.push(rule)
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
          commit,
          dispatch
        }, releve) {
          axios.defaults.withCredentials = true

          axios.post('/api/validate', {
              releve: releve
            })
            .then(function (response) {
              commit('validate', response.data.observation)
              commit('user/updateProgression', {
                releve : response.data.observation,
                operation : "VERIFY"
              }, {
                root : true
              })
            })

          dispatch("user/extractKnowledgePoints", ["validate"], {
            root : true
          })
        },
        modifyObservation({
          commit,
          state,
          dispatch
        }, newReleve) {
          axios.defaults.withCredentials = true
          axios.post('/api/modifyObservation', {
              releve: newReleve
            })
            .then(function (response) {
              commit('modify', response.data.observation)
              let index = state.releves.findIndex(releve => releve._id == response.data.observation._id)
              commit('user/updateProgression', {
                releve : state.releves[index],
                operation : "VERIFY"
              }, {
                root : true
              })
              var actions = extractActions(state.releves[index], "verify")
              dispatch("user/extractExplorationPoints", actions.explorationActions, {
                root : true
              })
              dispatch("user/extractKnowledgePoints", actions.knowledgeActions, {
                root : true
              })
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
              commit('user/updateProgression', {
                releve : response.data.observation,
                operation : "VERIFY"
              }, {
                root : true
              })
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
          commit("user/updateProgression", {
            releve : releve,
            operation : "IDENTIFY"
          }, {
            root : true
          })
          axios.defaults.withCredentials = true
          axios.post('/api/identification', {
            releve: releve
          })
        },
        importObservation({state,commit},observation){
          axios.defaults.withCredentials = true
          axios.post('/api/importFromOSM',{releve:observation})
          .then(function(response){
            if(response.data.observation){
              commit('add',response.data.observation)
            }
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
              commit('user/updateProgression', {
                releve : response.data.observation,
                operation : "INVENTORY"
              }, {
                root : true
              })
              if (response.data.observation.specie) {
                commit('arboretum/add', response.data.observation.specie, {
                  root: true
                })
              }
            }
          })
          var actions = extractActions(releve, "inventory")
          dispatch('user/extractExplorationPoints', actions.explorationActions, {
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
        explorationHistory: [],
        explorationScore: 0,
        knowledgeScore:0,
        knowledgeHistory:[],
        actionsTransActivite: new Map(),
        gamificationMode: true,
        differentSpecie: new Array(),
        differentGenus: new Array(),
        mission: null,
        activite: null,
        indexActivite: 0,
        completion: 0,
        goal: 0,
        time: {
          timer : null,
          startTime : -1,
          timeLeft : -1
        },
        activities: []
      },
      mutations: {
        setActivities(state, activities) {
          state.activities = activities
        },
        setActivityStatus(state, param) {
          state.activities[param.index].statut = param.statut
        },
        setCompletion(state, completion) {
          state.completion = completion;
        },
        startFolia(state){

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
          state.differentGenus.length = 0
        },
        addKnowledgePoints(state,knowledgeResult){
          state.knowledgeScore += knowledgeResult.points
          state.knowledgeHistory.unshift(knowledgeResult)
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
        addExplorationPoints(state, explorationResult) {
          if (state.gamificationMode) {
            state.explorationHistory.unshift(explorationResult)
            state.explorationScore += explorationResult.points
          }     
        },
        addTrophy(state, trophie) {
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
        updateProgression(state, param) {
          if (updateCompletion(state, param.operation, param.releve)) state.completion++
        },
        setTime(state, time) {
          state.time.startTime = time.startTime
          state.time.timeLeft = time.duration
          if (time.duration!=-1) {
            state.time.timer = setInterval( () => {
            var timestamp = (new Date()).getTime()
            state.time.timeLeft = time.duration - (timestamp - time.startTime)
            if (state.time.timeLeft <= 0) {
              state.time.timeLeft = 0
              clearInterval(state.time.timer)
            }
            }, 1000); 
          }    
        },

        resetTime(state) {
          state.time.startTime = -1
          state.time.timeLeft = -1
          clearInterval(state.time.timer)
        },
        identification(state, releve) {
          if (updateCompletion(state, "IDENTIFY", releve)) state.completion++
        },
        restore(state,user){

        }
      },
      actions: {
        extractExplorationPoints({
          commit, state
        }, actions) {
          if (state.gamificationMode) {
            for (let i = 0; i < actions.length; i++) {
              if (state.actionsTransActivite.has(actions[i])) {
                var points = parseInt(state.actionsTransActivite.get(actions[i]))
                commit('addExplorationPoints', {
                  points:points,
                  action:actions[i]
                })
              }
            }
          } 
        },
        extractKnowledgePoints({
          commit, state
        }, actions) {
          if (state.gamificationMode) {
            for (let i = 0; i < actions.length; i++) {
              if (state.actionsTransActivite.has(actions[i])) {
                var points = parseInt(state.actionsTransActivite.get(actions[i]))
                commit('addKnowledgePoints', {
                  points:points,
                  action:actions[i]
                })
              }
            }
          } 
        },
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
              }).then(function (response) {
                commit('restore',response.data.user)
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

  let {specie, genus} = releve

  var differentID = !(releve.osmId == releve.modifierId)

  var type = state.activite.type

  if (type == 'VERIFY' && alreadyVerified(releve, state.id)) return false
      
  if (type == operation) {

    let {specieAdded, genusAdded} = updateDifferentSet(state, specie, genus)            
    switch (state.activite.object) {
      case 'NONE' :
        return true;
      case 'SPECIE' :
        return (specie != null && state.activite.specie.toUpperCase() == specie.toUpperCase())
      case 'GENUS' :
        return (genus != null && state.activite.genus.toUpperCase() == genus.toUpperCase())
      case 'DIFFERENTSPECIE' :
        return specieAdded
      case 'DIFFERENTGENUS' :
        return genusAdded
      default :
        return false
      }
    }
}

function extractActions(releve, operation) {
  var actions = {
    explorationActions : [],
    knowledgeActions : []
  }
  switch(operation) {
    case "inventory" : 
      actions.explorationActions.push("gps")
      if (releve.specie) actions.explorationActions.push("completeSpecie")
      if (releve.genus) actions.explorationActions.push("completeGenus")
      if (releve.common) actions.explorationActions.push("completeCommon")
      if (releve.image) actions.explorationActions.push("photograph")
      break
    case "verify" :
      var prev = releve.prev.splice(-1)[0]
      if (releve.specie != prev.specie && prev.specie) actions.knowledgeActions.push("modifySpecie")
        else if (releve.specie && !prev.specie) actions.explorationActions.push("completeSpecie")
      if (releve.genus != prev.genus && prev.genus) actions.knowledgeActions.push("modifyGenus")
        else if (releve.genus && !prev.genus) actions.explorationActions.push("completeGenus")
      if (releve.common != prev.common && prev.common) actions.knowledgeActions.push("modifyCommon")
        else if (releve.common && !prev.common) actions.explorationActions.push("completeCommon")
      if (releve.image != prev.image) actions.explorationActions.push("photograph")
      break
  } 
  return actions
}

function updateDifferentSet(state, specie, genus) {
  var res = new Object()
  if (specie != null && !state.differentSpecie.includes(specie)) {
    state.differentSpecie.push(specie)
    res.specieAdded=true
  }

  if (genus != null && !state.differentGenus.includes(genus)) {
    state.differentGenus.push(genus) 
    res.genusAdded=true
  } 
  return res
} 

function alreadyVerified(releve, userId) {
  console.log(JSON.stringify(releve))
  if (releve.osmId == userId) return true
 
  for (let i = 0; i < releve.prev.length; i++) {
    if (releve.prev[i].osmId == userId) return true
    if (releve.prev[i].modifierId == userId) return true
     
    for (let j = 0; j < releve.prev[i].validation.length; j++) {
      if(releve.prev[i].validation[j].id == userId) return true
    }
  }
  return false
}
