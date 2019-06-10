let backup=(field,value)=>{
    axios.post('/api/backup',{field:field,value:value})
}
let restoreSession=(oldState,state)=>{
    delete oldState._id
    delete oldState.__v
    _.forOwn(oldState,(value,key)=>{
        if(value){
            if(!key.includes('_')){ //restoring state/user module
                if(key=='actionsTransActivite'){
                    _.forOwn(value,(mapVal,mapKey)=>{
                        state.user.actionsTransActivite.set(mapKey,mapVal)
                    })
                }
                else{
                state.user[key]=value}
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
            case 'user/addTrophy' :
                backup('trophies',state.user.trophies)
                break
            case 'user/winTrophy' :
                backup('trophies',state.user.trophies)
                break
            case 'user/addActionTransActivite':
                backup('actionsTransActivite',state.user.actionsTransActivite)
                 break
            case 'user/updateStatus':
                backup('status',state.user.status)
                break
            case 'user/lostProgression':
                backup('lostProgression',state.user.lostProgression)
                break
            case 'user/setCompletion' :
                backup('completion',state.user.completion)
                break
            case 'user/addPoints' :
                backup('scores',state.user.scores)
                break
            case 'user/setActivities' :
                backup('activities',state.user.activities)
                console.log(state.user.activities)
                break
            case 'user/setActivityStatus' :
                backup('activities',state.user.activities)
                break
            case 'user/gamificationMode':
                backup('gamificationMode',state.user.gamificationMode)
                break
            case 'user/updateProgression':
                backup('completion',state.user.completion)
                backup('differentSpecie',state.user.differentSpecie)
                backup('differentGenus',state.user.differentGenus)
                break    
            case 'user/identification':
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
            case 'user/updateTime':
                backup('time',state.user.time)
                break                
            case 'user/setGoal' :
                backup('goal',state.user.goal)
                break
            case 'user/setActivite':
                backup('activite',state.user.activite)
                break
            case 'user/restoreBackup' :
                restoreSession(state.user.sessionBackup,state)
                break
            case 'commonData/setVerificationMode' :
                backup('commonData_verification',state.commonData.verification)
                break
            case 'commonData/setIdentificationMode' :
                backup('commonData_identification',state.commonData.identification)
                break
            case 'user/setScores' :
                backup('scores',state.user.scores)
                break
            case 'user/displayScore' :
                backup('scores',state.user.scores)
                break

            }   
    })
}

export default backupPlugin