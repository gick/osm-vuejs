export default {
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
  };
  