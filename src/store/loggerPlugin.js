import { ready } from "onsenui";

let logEntry=(event,payload,activity)=>{
    axios.post('/api/logger',{event:event,payload:payload,activity:activity})
}
let loggerPlugin = store => {
    store.subscribe((mutation,state)=>{
        let activity={}
        if(state.user.activite)
        {    
            activity={index:state.user.indexActivite,name:state.user.activite.instruction.long}
        }
        switch(mutation.type){
            case 'user/addPoints' :
                logEntry('updateScore',state.user.scores,activity)
                break
            case 'user/startFolia' :
                logEntry('startFolia',{},activity)
            break
            case 'releve/add':
                 logEntry('newObservation',mutation.payload,activity)
            break    
            case 'releve/modify':
                logEntry('modifyObservation',mutation.payload,activity)
                break    
            case 'releve/validate':
                logEntry('validateObservation',mutation.payload,activity)
                break
            case 'user/setIndexActivite' :
                logEntry('startActivity',state.user.activities,activity)
                break 
            case 'user/setActivityStatus':
                logEntry('endActivity',state.user.activities,activity)
                break
            case 'user/winTrophy':
                logEntry('newTrophy',state.user.trophies,activity)
                break
            case 'user/updateStatus':
                logEntry('newStatus',state.user.status,activity)
                break
        
            }   
    })
    store.subscribeAction((action,state)=>{
        let activity={}
        if(state.user.activite)
        {    
            activity={index:state.user.indexActivite,name:state.user.activite.instruction.long}
        }
        switch(action.type){
            case 'releve/setNoTree' :
                logEntry('questionTree',action.payload,activity)
                break  
            case 'releve/identification' :
                logEntry('identification',action.payload,activity)
                break  
                             

        }
    })
}

export default loggerPlugin