let backup=(field,value)=>{
    axios.post('/api/backup',{field:field,value:value})
}
let restoreSession=(oldState,state)=>{
    delete oldState._id
    delete oldState.__v
    _.forOwn(oldState,(value,key)=>{
        if(value){
            if(!key.includes('_')){ //restoring state/user module
                state.user[key]=value
            } else 
            {
            let [namespace,property]=key.split('_')
                state[namespace][property]=value
            }
        }
    })
}
let backupPlugin = store => {
    store.subscribe((mutation,state)=>{
        let userId=state.user.id
        switch(mutation.type){
            case 'user/addTrophie' :
                backup('trophies',state.user.trophies)
                break
            case 'user/winTrophy' :
                backup('trophies',state.user.trophies)
                break
            case 'user/setCompletion' :
                backup('completion',state.user.completion)
                break
            case 'user/addPoints' :
                backup('score',state.user.score)
                break
            case 'user/pointsActions':
                backup('score',state.user.score)
                backup('journal',state.user.journal)
                break
            case 'user/updateJournal' :
                backup('journal',state.user.journal)
                break
            case 'user/addKnowledgePoints' :
                  backup('knowledgeHistory',state.user.knowledgeHistory)
                  backup('knowledgeScore',state.user.knowledgeScore)
                  break
            case 'user/gamificationMode':
                backup('gamificationMode',state.user.gamificationMode)
                break
            case 'user/add':
                backup('completion',state.user.completion)
                backup('differentSpecie',state.user.differentSpecie)
                backup('differentGenus',state.user.differentGenus)
                break    
            case 'user/modify':
                backup('completion',state.user.completion)
                backup('differentSpecie',state.user.differentSpecie)
                backup('differentGenus',state.user.differentGenus)
                break    
            case 'user/identification':
                backup('completion',state.user.completion)
                break
            case 'user/validate':
                backup('completion',state.user.completion)
                break
            case 'user/clearSets':
                backup('differentSpecie',state.user.differentSpecie)
                backup('differentGenus',state.user.differentGenus)
                break
            case 'user/setMission' :
                backup('mission',state.user.mission)
                break
            case 'user/setIndexActivite' :
                backup('indexActivite',state.user.indexActivite)
                break                
            case 'user/setGoal' :
                backup('goal',state.user.goal)
                break
            case 'user/setActivite':
                backup('activite',state.user.activite)
                break
            case 'user/restore' :
                restoreSession(mutation.payload,state)
                break
            case 'commonData/setVerificationMode' :
                backup('commonData_verification',state.commonData.verification)
                break
            case 'commonData/setIdentificationMode' :
                backup('commonData_identification',state.commonData.identification)
                break

            }   
    })
}

export default backupPlugin