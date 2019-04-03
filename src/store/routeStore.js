import {
  cpus
} from "os";
var osmAuth = require("osm-auth");
export default {
  modules: {
    osmData:{
      strict:true,
      namespaced:true,
      state:{
        data:[],
      },
      mutations:{
        setData(state,data){
          state.data=data
        }
      },
      actions:{
        getOSMData({commit},boundary){
          
          let south=boundary.boundary._southWest.lat
          let west=boundary.boundary._southWest.lng
          let north=boundary.boundary._northEast.lat
          let east=boundary.boundary._northEast.lng
          axios.get('/osmdata',{params:{south:south,west:west,north:north,east:east}}).then(function(response){
          console.log(response.data)  
          commit('setData',response.data)
          })
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
        differentReleve:new Set(),
        mission:'B',
        modifyValidate:0,
        completionA:0,
      },
      mutations: {
        add(state, releve) {
          state.releves.push(releve)
          state.completionA=state.completionA+1
          if(state.completionA==2){
            state.mission='B'
          }
          if(state.mission=='B'){
            state.differentReleve.add(releve.specie)
            if(state.differentReleve.size==2)
              {
                state.mission='C'
              }
          }
        },
        modify(state,newReleve){
          if(state.mission=='C'){
            state.modifyValidate++
            if(state.modifyValidate==5){
              state.mission='D'
            }
          }
          let index=state.releves.findIndex(releve=>releve._id==newReleve.id)
          if(index!=-1){
            state.releves[index].specie=newReleve.specie
            state.releves[index].genus=newReleve.genus
          }
          axios.post('/modifyObservation',state.releves[index])
        },
        addMultiple(state,observations){
          for(var observation of observations){
            state.releves.push(observation)
          }
        },
        validate(state,currentReleve){
          if(state.mission=='C'){
            state.modifyValidate++
            if(state.modifyValidate==5){
              state.mission='D'
            }
          }

          let index = state.releves.findIndex(releve=>releve._id==currentReleve._id)
          if(index!=-1){
            state.releves[index].validated=true
          }
        }
        ,
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
                    axios.post('/observation',
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
    completion2:{
      strict:true,
      namespaced:true,
      state:{rate:0},
      mutations:{
        set(state,rate){
          state.rate=state.rate+rate
          }
      }
    },
    completion: {
      strict: true,
      namespaced: true,
      state: {
        rate: 0,
        mission:'A',
        firstMissionEnd:false,
      },
      mutations: {
        closeFirstMission(state){
          state.firstMissionEnd=false
        },
        set(state, rate) {
          state.rate = state.rate + rate;
          if(state.rate>=20){
            state.firstMissionEnd=true
          }
          if(state.rate==10){
            state.mission='B'
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
          axios.get('/observation')
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
              path: '/api/0.6/permissions'
  }, function(err, details) {
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
             return axios.get('/login',{params: {
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