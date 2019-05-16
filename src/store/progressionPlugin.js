let progressionPlugin=store=>{
    store.subscribe((mutation,state) =>{
        switch (mutation.type){
            case 'releve/add' :
                console.log('Nouveau releve')
                break;
        }
    })
}

export default progressionPlugin