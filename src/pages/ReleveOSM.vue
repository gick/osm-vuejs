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
          <v-ons-button disabled @click="modify" style="margin: 6px 0">Modifier</v-ons-button>
          <v-ons-button disabled @click="validate" style="margin: 6px 0">Valider</v-ons-button>
          <v-ons-button v-if="visualize" @click="visualizeReleve" style="margin: 6px 0">Voir</v-ons-button>
        </section>
      </div>
    </ons-card>
  </v-ons-page>
</template>
<script>
import SimplePage from "./SimplePage.vue";

export default {
  data() {
    return { releve:{} };
  },
  computed: {
  },
  methods: {
    visualizeReleve() {
      this.$store.commit("navigator/pop");
      this.$store.commit("tabbar/set", 0);
      this.$root.$emit("changeCenter", this.releve.coordinates);
    },
    validate() {
      this.$store.dispatch("releve/validateObservation", this.releve);
      this.$store.commit("navigator/pop");
    },
    mutate() {
      this.releve.prev.push({ test: "d" });
    },
    modify() {
      this.$store.commit("navigator/push", {
        extends: SimplePage,
        data: function() {
          return {
            releve: this.releve,
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