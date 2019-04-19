<template>
  <v-ons-page>
    <custom-toolbar backLabel="Retour"></custom-toolbar>
    <ons-card>
      <img v-show="releve.image" :src="releve.image" style="width: 100%">
      <div class="title">Relevé</div>
      <div class="content">
        <ons-list>
          <ons-list-header>Information</ons-list-header>
          <ons-list-item v-show="releve.specie">Espèce : {{releve.specie}}</ons-list-item>
          <ons-list-item v-show="releve.validation.length-1">Nombre de validations : {{releve.validation.length-1}}</ons-list-item>

        </ons-list>
        <section style="margin: 16px">
          <v-ons-button @click="modify" style="margin: 6px 0">Modifier</v-ons-button>
          <v-ons-button :disabled="releve.validated" @click="validate" style="margin: 6px 0">Valider</v-ons-button>
          <v-ons-button v-if="visualize" @click="visualizeReleve" style="margin: 6px 0">Voir</v-ons-button>
        </section>
        <v-ons-button @click="mutate">Mutate</v-ons-button>
      </div>
    </ons-card>
  </v-ons-page>
</template>
<script>
import SimplePage from "./SimplePage.vue";

export default {
  data(){
    return {id:''}
  },
  computed:{
    releve(){
      return this.$store.state.releve.releves.find(rel=>rel._id==this.id)
    }
  }
  ,
  methods: {
    visualizeReleve(){
      this.$store.commit('navigator/pop')
      this.$store.commit('tabbar/set',0)
      this.$root.$emit('changeCenter', this.releve.coordinates);
    },
    validate(){
      this.$store.commit('releve/validate',this.releve)
      this.$store.commit('navigator/pop')
    },
    mutate(){
      this.releve.prev.push({test:'d'})
    }
    ,
    modify() {
      this.$store.commit("navigator/push", {
        extends: SimplePage,
         data:function() {
          return {
            releve:this.releve,
            modify: true,
            toolbarInfo: {
              backLabel: "Home",
              title: "key"
            }
          };
        }.bind(this)
      });
    }
  }
};
</script>