<template>
  <v-ons-page>
    <custom-toolbar backLabel="Retour"></custom-toolbar>
    <ons-card>
      <div class="title">Relevé</div>
      <div class="content">
        <ons-list>
          <ons-list-header>Information</ons-list-header>
          <ons-list-item v-show="releve.authorName">Auteur du relevé : {{releve.authorName}}</ons-list-item>
          <ons-list-item v-show="releve.specie">Espèce : {{releve.specie}}</ons-list-item>
          <ons-list-item v-show="releve.genus">Genre : {{releve.genus}}</ons-list-item>
          
          <ons-list-item v-show="releve.common">Nom commun : {{releve.common}}</ons-list-item>
          <ons-list-item
            v-show="releve.modifierName"
          >Dernière modification par : {{releve.modifierName}}</ons-list-item>
        </ons-list>
        <img v-show="releve.image" :src="releve.image" style="width: 100%">

        <section style="margin: 16px">
          <v-ons-button :disabled="importDone" @click="importObservation" style="margin: 6px 0">Importer dans Albiziapp</v-ons-button>
          <v-ons-button  @click="remove" style="margin: 6px 0">Supprimer l'arbre d'OSM</v-ons-button>
        </section>
      </div>
    </ons-card>
  </v-ons-page>
</template>
<script>
import SimplePage from "./SimplePage.vue";
import removeTree from "../js/osmRemoveTree"
import EventBus from "../js/osmBus"
export default {
  data() {
    return { 
      importDone:false,
      releve:{} };
  },
  computed: {
  },
  methods: {
    remove(){
      removeTree(this.releve)
      this.$store.commit("navigator/pop");
    },
    visualizeReleve() {
      this.$store.commit("navigator/pop");
      this.$store.commit("tabbar/set", 0);
      this.$root.$emit("changeCenter", this.releve.coordinates);
    },
    validate() {
      this.$store.dispatch("releve/validateObservation", this.releve);
      this.$store.commit("navigator/pop");
    },
    importObservation() {
      this.importDone=true
      this.$store.dispatch("releve/importObservation",this.releve)
      this.$toasted.show("Le relevé a été importé dans Albiziapp", {
        fullWidth: true,
        position: "bottom-center",
        duration: 2000
      }); // Shows from 0s to 2s
      this.$store.commit("navigator/pop");
    },
  }
};
</script>