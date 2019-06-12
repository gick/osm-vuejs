let getStatus=function(userScores,statusRules){
    return statusRules.filter(function(item){
        for (let userScore of userScores) {
            for (let score of item.MRequiredScoreList) {
                if (score.name == userScore.name && score.nbPoint > userScore.nbPoint) {
                    return false
                }  
            }
        }    
        return true
    })
}

let statusPlugin = store => {
    store.subscribe((mutation,state)=>{
        switch(mutation.type){
            case 'user/addPoints' :
                let statusRules = null
                for (let mechanic of state.user.mission.MMechanicList) {
                    if (Object.keys(mechanic).includes("MStatusList")) {
                        statusRules = mechanic.MStatusList
                    }
                }
                let currentStatus=state.user.status
                let userScores = state.user.scores
                let newStatus=getStatus(userScores, statusRules)
                if(newStatus.length>currentStatus.length)
                    store.commit('user/updateStatus',newStatus)
                break
        }   
    })
}

export default statusPlugin