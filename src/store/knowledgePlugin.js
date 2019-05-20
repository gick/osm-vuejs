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
    let points = 0
    let toTest = _.cloneDeep(obs)
    let history = toTest.prev
    delete toTest.prev
    history.push(toTest)
    let index = getLastModif(history, uid)
    if (index != -1) {
        let result = compareObservation(toTest, history[index])
        points += result.genus ? 2 : 0
        points += result.specie ? 4 : 0
        points += result.common ? 4 : 0
        return {points:points,context:{activity:'extConfirmation',details:{obs:toTest,result:result}}}
    }
    return {points:0,context:{activity:'extConfirmation',details:{}}}

}
let testModification = (obs, uid) => {
    let points = 0
    let toTest = _.cloneDeep(obs)
    let history = toTest.prev
    let index = getLastModif(history, uid)
    if (index != -1) {
        let result = compareObservation(toTest, history[index])
        points += result.genus ? 2 : 0
        points += result.specie ? 4 : 0
        points += result.common ? 4 : 0
        return {points:points,context:{activity:'extConfirmation',details:{obs:toTest,result:result}}}
    }
    return {points:0,context:{activity:'extConfirmation',details:{}}}
}

let knowledgePlugin = store => {
    store.subscribe((mutation, state) => {
        switch (mutation.type) {
            case 'user/startFolia':
                store.commit('user/addKnowledgePoints', {
                    points: 2,
                    context: {
                        activity: 'folia'
                    }
                })
                break;
            case 'releve/validateFromOutside':
                var result = testValidation(mutation.payload, userId)
                if (result.points) {
                    store.commit('user/addKnowledgePoints', result)
                }
                break;
            case 'releve/modifyFromOutside':                
                var userId = store.state.user.id
                var result = testModification(mutation.payload, userId)
              if (result.points) {
                 store.commit('user/addKnowledgePoints', result)
              }
              break;

        }
    })
    store.subscribeAction((action, state) => {
        switch (action.type) {
            case 'releve/identification':
                let score = 0
                let result = compareObservation(action.payload, action.payload.identificationValue)
                score += result.genus ? 10 : 0
                score += result.specie ? 15 : 0
                score += result.common ? 15 : 0
                if (score) {
                    store.commit('user/addKnowledgePoints', {
                        points: score,
                        context: {
                            activity: 'identification',
                            details: result
                        }
                    })
                }
                break

            case 'releve/setNoTree':
                store.commit('user/addKnowledgePoints', {
                    points: 1,
                    context: {
                        activity: 'noTree'
                    }
                })
                break
        }
    })

}

export default knowledgePlugin