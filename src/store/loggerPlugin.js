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
                logEntry('observationScore',state.user.score,activity)
                break
            case 'user/startFolia' :
                logEntry('startFolia',{},activity)
            break
            case 'user/pointsActions':
                logEntry('observationScore',state.user.score,activity)
                break
            case 'user/addKnowledgePoints' :
                logEntry('knowledgeScore',state.user.score,activity)
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
                logEntry('startActivity',{},activity)
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
                logEntry('questionTree',question.payload,activity)
                break  
            case 'releve/identification' :
                logEntry('identification',question.payload,activity)
                break  
                             

        }
    })
}

export default loggerPlugin