<template>
        <div class="right">
          <b-badge pill v-if="newValidation" variant="info">Confirmé</b-badge>
          <b-badge pill v-if="modification" variant="info">Modifié</b-badge>
        </div>

</template>
<script>

export default {
    data(){
        return {
        newValidation:false,
        modification:false}
    },
    props:['releve'],
    watch:{
        'releve.validation':function(newValid){
            if(this.releve.validation.length>1)
                this.newValidation=true;
        },
        'releve.modifierId':function(newRel){
            this.modification=true;
        }

    },
    methods:{
        reset(){
            this.modification=false
            this.newValidation=false
        }
    }

}
</script>

<style>

</style>
