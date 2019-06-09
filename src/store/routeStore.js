import {
  cpus
} from "os";
var osmAuth = require("osm-auth");
var removeTree = require('../js/osmRemoveTree')
var addTree = require('../js/osmPost')

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
        ]
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
        tempMarker:[],
        tempSuppressed:[],
      },
      mutations: {
        setData(state, data) {
          state.data = data
        }
      },
      actions: {
        removeOSMTree({commit},osmTree){
          addTree(osmTree)
        },
        addOSMTree({commit},releve){
          addTree(releve).then(
            function(){
              osmBus.$emit('updateOSM')
            }
          )
        },

        getOSMData({
          commit
        }, boundary) {

          let south = boundary.boundary._southWest.lat
          let west = boundary.boundary._southWest.lng
          let north = boundary.boundary._northEast.lat
          let east = boundary.boundary._northEast.lng
          axios.get('/api/getOsmData', {
            params: {
              south: south,
              west: west,
              north: north,
              east: east
            }
          }).then(function (response) {
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
          console.log(page)
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
            state.releves.splice(index, 1, newReleve)
            state.releves[index].prev = newReleve.prev
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
        validateFromOutside(state, observation) {
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
                releve: response.data.observation,
                operation: "VERIFY"
              }, {
                  root: true
                })
            })

          dispatch("user/extractKnowledgePoints", ["validate"], {
            root: true
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
                releve: state.releves[index],
                operation: "VERIFY"
              }, {
                  root: true
                })
              /*var actions = extractActions(state.releves[index], "verify")
              dispatch("user/extractExplorationPoints", actions.explorationActions, {
                root: true
              })
              dispatch("user/extractKnowledgePoints", actions.knowledgeActions, {
                root: true
              })*/
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
                releve: response.data.observation,
                operation: "VERIFY"
              }, {
                  root: true
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
            releve: releve,
            operation: "IDENTIFY"
          }, {
              root: true
            })
          axios.defaults.withCredentials = true
          axios.post('/api/identification', {
            releve: releve
          })
        },
        importObservation({ state, commit }, observation) {
          axios.defaults.withCredentials = true
          axios.post('/api/importFromOSM', { releve: observation })
            .then(function (response) {
              if (response.data.observation) {
                commit('add', response.data.observation)
              }
            })
        },
        setObservation({
          state,
          commit,
          dispatch,
          rootState
        }, releve) {

          // commit('add', releve)
          axios.defaults.withCredentials = true
          if (state.identificationMode) {
            releve.identificationMode = true
          }
          if (!rootState.user.isAnon){
            axios.post('/api/observation', {
              releve
            }).then(function (response) {
              if (response.data.observation) {
                commit('add', response.data.observation)
                if (!releve.identificationMode) {
                  commit('user/updateProgression', {
                    releve: response.data.observation,
                    operation: "INVENTORY"
                  }, {
                      root: true
                    })
                  if (response.data.observation.specie) {
                    commit('arboretum/add', response.data.observation.specie, {
                      root: true
                    })
                  }
                }
              }
            })
          }
          else {
            axios.post('/api/observationAnon', {
            releve
            })
          }
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
        lostProgression:0,
        id: null,
        isGod:false,
        isAnon: false,
        formerName: null,
        formerId: null,
        disableNotif: false,
        notifProfil: 0,
        trophies: [],
        scores: [],
        gamificationMode: true,
        differentSpecie: new Array(),
        differentGenus: new Array(),
        sessionBackup: {},
        status: [],
        mission: null,
        activite: null,
        indexActivite: 0,
        completion: 0,
        goal: 0,
        time: {
          timer: null,
          startTime: -1,
          timeLeft: -1,
          duration: -1
        },
        activities: []
      },
      mutations: {
        updateStatus(state, status) {
          state.status = status
        },
        lostProgression(state) {
          state.lostProgression = 0
        },
        setActivities(state, activities) {
          state.activities = activities
        },
        setActivityStatus(state, param) {
          state.activities[param.index].statut = param.statut
        },
        setCompletion(state, completion) {
          state.completion = completion;
        },
        restoreBackup(state) {

        },
        startFolia(state) {

        },
        setGoal(state, goal) {
          state.goal = goal;
        },
        setScores(state, scores) {
          state.scores = scores
        },
        displayScore(state, scoreName) {
          for (let i = 0; i <state.scores.length; i++) {
            state.scores[i].display = (state.scores[i].name == scoreName) ? true : false
          }
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
        addPoints(state, score) {
          for (let i = 0; i < state.scores.length; i++) {
            if (state.scores[i].name == score.name) {
              state.scores[i].nbPoint += score.history.points
              state.scores[i].history.unshift(score.history)
            }
          }
        },
        setGamificationMode(state, mode) {
          state.gamificationMode = mode
        },
        addTrophy(state, trophy) {
          for (let i = 0; i < state.trophies.length; i++) {
            if (state.trophies[i].name == trophy.name) return
          }
          state.trophies.push(trophy)
        },
        winTrophy(state, trophyName) {
          for (let i = 0; i < state.trophies.length; i++) {
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
        updateTime(state) {

        },

        resetTime(state) {
          state.time.startTime = -1
          state.time.timeLeft = -1
          state.time.duration = -1
          clearInterval(state.time.timer)
        },
        identification(state, releve) {
          if (updateCompletion(state, "IDENTIFY", releve)) state.completion++
        },
        setBackup(state, sessionBackup) {
          if(sessionBackup.lostProgression==1){
            state.lostProgression=1
          }
          state.sessionBackup = sessionBackup
        }
      },
      actions: {
        setTime({ state, commit }, time) {
          state.time.duration = time.duration
          if (time.duration != -1) {
            state.time.timer = setInterval(() => {
              state.time.duration = state.time.duration - 1000
              commit('updateTime')
              if (state.time.duration <= 0) {
                state.time.duration = 0
                clearInterval(state.time.timer)
              }
            }, 1000);
          }
        },

        extractPoints({
          commit, state
        }, actions) {
          if (state.gamificationMode) {
            console.log(JSON.stringify(state.scores))
            for (var score of state.scores) {
              console.log(JSON.stringify(score))
              for (var rule of score.rules) {
                console.log(JSON.stringify(actions))
                console.log(rule.code)
                console.log(actions.includes(rule.code))
                if (actions.includes(rule.code)) {
                  commit('addPoints', {
                    name: score.name,
                    history: {
                      text: rule.text,
                      points : rule.nbPoint
                    }
                  })
                }
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
        },
        loadObservation({
          commit, state
        }) {
          axios.get('/api/observation')
            .then(function (res) {
              commit('releve/addMultiple', res.data, {
                root: true
              })
              let userObservation = res.data.filter(val => val.osmId == state.id)
              commit('arboretum/addMultiple', userObservation, {
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
              return axios.get('/api/login', {
                params: {
                  id: user.getAttribute('id'),
                  name: user.getAttribute('display_name'),
                }
              }).then(function (response) {
                commit('setBackup', response.data.user)
                commit('set', userObject)

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

  let { specie, genus } = releve

  var type = state.activite.type

  if (type == 'VERIFY' && alreadyVerified(releve, state.id)) return false

  if (type == operation) {

    let { specieAdded, genusAdded } = updateDifferentSet(state, specie, genus)
    switch (state.activite.object) {
      case 'NONE':
        return true;
      case 'SPECIE':
        return (specie != null && state.activite.specie.toUpperCase() == specie.toUpperCase())
      case 'GENUS':
        return (genus != null && state.activite.genus.toUpperCase() == genus.toUpperCase())
      case 'DIFFERENTSPECIE':
        return specieAdded
      case 'DIFFERENTGENUS':
        return genusAdded
      default:
        return false
    }
  }
}

function updateDifferentSet(state, specie, genus) {
  var res = new Object()
  if (specie != null && !state.differentSpecie.includes(specie)) {
    state.differentSpecie.push(specie)
    res.specieAdded = true
  }

  if (genus != null && !state.differentGenus.includes(genus)) {
    state.differentGenus.push(genus)
    res.genusAdded = true
  }
  return res
}

function alreadyVerified(releve, userId) {
  if (releve.osmId == userId) return true

  for (let i = 0; i < releve.prev.length; i++) {
    if (releve.prev[i].osmId == userId) return true
    if (releve.prev[i].modifierId == userId) return true

    for (let j = 0; j < releve.prev[i].validation.length; j++) {
      if (releve.prev[i].validation[j].id == userId) return true
    }
  }
  return false
}
