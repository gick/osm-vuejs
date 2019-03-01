<template>
<div>
    <h3>{{identification.label.value}}</h3>
    <v-ons-select style="width:40%">
        <option v-for='item in items' :key="item.value" :value='item.value.value'>
            {{item.value.value}}
        </option>
    </v-ons-select>
</div>
</template>
<script>
export default {
    name:'identification-element',
    props:['identification'],
    data(){
        return {
            propName:'',
            items:[{value:"clef"},{value:"identification"}]}
    },
    created(){
        this.propName=this.identification.prop.value.split('#')[1]
        axios.get('http://localhost:8000/listPropValue/' + this.propName)
        .then(function(res){
            this.items=res.data
        }.bind(this))
    },
}
</script>

