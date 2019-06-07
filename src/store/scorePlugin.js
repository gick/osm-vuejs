let compareObservation = (obs1, obs2) => {
    let {
        genus: genus1,
        specie: specie1,
        common: common1
    } = obs1
    let {
        genus: genus2,
        specie: specie2,
        common: common2
    } = obs2
    let sameGenus = genus1 && genus1 == genus2
    let sameSpecies = specie1 && specie1 == specie2
    let sameCommon = common1 && common1 == common2
    return {
        genus: sameGenus,
        specie: sameSpecies,
        common: sameCommon
    }
}
let getLastModif=(history,uid)=>{
    let index=_.findLastIndex(history,(item)=>{
        let result=false
        result=result || item.modifierId==uid
        result=result || _.some(result.validation,(item)=>item.id==uid)
        return result
    })
    if(index==-1){
        let testFirst=history[0].osmId==uid
        if(testFirst){
            return 0
        }
        return -1
    }
    return index
}
let testValidation = (obs, uid) => {
    var actions = []
    let toTest = _.cloneDeep(obs)
    let history = toTest.prev
    delete toTest.prev
    history.push(toTest)
    let index = getLastModif(history, uid)
    if (index != -1) {
        let result = compareObservation(toTest, history[index])
        if (result.genus) actions.push("sameGenusPropagation")
        if (result.specie) actions.push("sameSpeciePropagation")
        if (result.common) actions.push("sameCommonPropagation")
        return {actions:actions,context:{activity:'extConfirmation',details:{obs:toTest,result:result}}}
    }
    return {actions:[],context:{activity:'extConfirmation',details:{}}}

}
let testModification = (obs, uid) => {
    var actions = []
    let toTest = _.cloneDeep(obs)
    let history = toTest.prev
    let index = getLastModif(history, uid)
    if (index != -1) {
        let result = compareObservation(toTest, history[index])
        if (result.genus) actions.push("sameGenusPropagation")
        if (result.specie) actions.push("sameSpeciePropagation")
        if (result.common) actions.push("sameCommonPropagation")
        return {actions:actions,context:{activity:'extConfirmation',details:{obs:toTest,result:result}}}
    }
    return {actions:[],context:{activity:'extConfirmation',details:{}}}
}

let scorePlugin = store => {
    store.subscribe((mutation, state) => {
        switch (mutation.type) {

            case 'user/startFolia':
                store.dispatch('user/extractPoints', ["useFolia"])
                break;

            case 'releve/validateFromOutside':
                var result = testValidation(mutation.payload, userId)
                if (result.actions.length != 0) {
                    store.dispatch('user/extractPoints', result.actions)
                }
                break;

            case 'releve/modifyFromOutside':                
                var userId = store.state.user.id
                var result = testModification(mutation.payload, userId)
                if (result.actions.length != 0) {
                    store.dispatch('user/extractPoints', result.actions)
                }
                break;

            case 'releve/add':
                var actions = extractActions(mutation.payload, "inventory")
                store.dispatch('user/extractPoints', actions, {
                    root: true
                })
                break;

            case 'releve/modify':
                let index = store.state.releve.releves.findIndex(releve => releve._id == mutation.payload._id)
                var actions = extractActions(store.state.releve.releves[index], "verify")
                store.dispatch("user/extractPoints", actions, {
                    root: true
                })
                break;
        }
    })
    store.subscribeAction((action, state) => {
        switch (action.type) {
            case 'releve/identification':
                let actions = []
                let result = compareObservation(action.payload, action.payload.identificationValue)
                if (result.genus) actions.push("identifiedGenus")
                if (result.specie) actions.push("identifiedSpecie")
                if (result.common) actions.push("identifiedCommon")
                if (actions.length != 0) {
                    store.dispatch('user/extractPoints', actions)
                }
                break

            case 'releve/setNoTree':
                store.dispatch('user/extractPoints', ["question"])
                break
        }
    })

}

function extractActions(releve, operation) {
  var actions = []
  switch (operation) {
    case "inventory":
      actions.push("gps")
      if (releve.specie) actions.push("completeSpecie")
      if (releve.genus) actions.push("completeGenus")
      if (releve.common) actions.push("completeCommon")
      if (releve.image) actions.push("photograph")
      break
    case "verify":
      var prev = releve.prev.splice(-1)[0]
      if (releve.specie != prev.specie) 
        actions.push( prev.specie ? "modifySpecie" : "completeSpecie")
      if (releve.genus != prev.genus) 
        actions.push( prev.genus ? "modifyGenus" : "completeGenus")
      if (releve.common != prev.common) 
        actions.push( prev.specie ? "modifyCommon" : "completeCommon")
      if (releve.image != prev.image)
        actions.push("photograph")
  }
  return actions
}

export default scorePlugin