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
