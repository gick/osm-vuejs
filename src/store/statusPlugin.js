let getStatus=function(kScore,oScore,statusRules){
    return statusRules.filter(function(item){
        return oScore>=item.explorationPoints && kScore>=item.knowledgePoints})
}


let statusPlugin = store => {
    store.subscribe((mutation,state)=>{
        switch(mutation.type){
            case 'user/addExplorationPoints' :
            case 'user/addKnowledgePoints' :
                let statusRules=state.user.mission.mechanics.filter(v=>v.name=="status")[0].statusList
                let currentStatus=state.user.status
    
                let kScore=state.user.knowledgeScore
                let oScore=state.user.explorationScore
                let newStatus=getStatus(kScore,oScore,statusRules)
                if(newStatus.length>currentStatus.length)
                    store.commit('user/updateStatus',newStatus)
                break
            }   
    })
}

export default statusPlugin