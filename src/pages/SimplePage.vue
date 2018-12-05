<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left">
        <v-ons-back-button>Back</v-ons-back-button>
      </div>
    </v-ons-toolbar>
    <v-ons-list>
      <v-ons-list-header>Nouveau relevé</v-ons-list-header>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <div class="center">
          <autocomplete
            :source="source"
            inputClass="inputClass"
            results-display="name"
            placeholder="Nom de l'espece"
            v-model="specieIndex"
          ></autocomplete>
        </div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <v-ons-input placeholder="Nom du genre" float v-model="genus"></v-ons-input>
      </v-ons-list-item>
    </v-ons-list>
    <section style="margin: 16px">
      <v-ons-button :disabled="!completed" @click="complete" style="margin: 6px 0">Envoyer</v-ons-button>
      <v-ons-button modifier="outline" style="margin: 6px 0">Annuler</v-ons-button>
    </section>
  </v-ons-page>
</template>
<script>
import Autocomplete from "vuejs-auto-complete";
import genusList from '../js/genus.js'
export default {
  data() {
    return { source:genusList,genus: "", specieIndex: 0 };
  },
  components: {
    Autocomplete
  },
  computed: {
    completed() {
      if(this.genus.length){
        return true
      }
      if(this.specieIndex){
        return true
      }
    }
  },
  methods: {
    complete() {
      this.$store.commit("releve/setGenusSpecie", {
        genus: this.genre,
        specie: this.source[this.specieIndex-1]
      });
      this.$store.commit("completion/set", 10);
      this.$store.commit("navigator/pop");
    }
  }
};
</script>
<style>
.inputDiv{
  color:red
}
</style>