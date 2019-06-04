let getStatus=function(userScores,statusRules){
    return statusRules.filter(function(item){
        for (let userScore of userScores) {
            let scoreName = userScore.name
            for (let j = 1; j < Object.keys(item).length; j++) {  
                if (item[scoreName] != null) {
                    if (item[scoreName] > userScore.nbPoint) {
                        return false
                    }
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
                let statusRules=state.user.mission.mechanics.filter(v=>v.name=="status")[0].statusList
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