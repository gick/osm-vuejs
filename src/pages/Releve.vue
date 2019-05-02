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

          <ons-list-item
            v-show="releve.validation.length-1"
          >Nombre de validations : {{releve.validation.length-1}}</ons-list-item>
          <ons-list-item v-show="releve.common">Nom commun : {{releve.common}}</ons-list-item>
          <ons-list-item
            v-show="releve.modifierName"
          >Dernière modification par : {{releve.modifierName}}</ons-list-item>
        </ons-list>
        <img v-show="releve.image" :src="releve.image" style="width: 100%">

        <section style="margin: 16px">
          <p class="center">
            Vous pouvez
            <b>modifier</b> le relevé ou bien
            <b>confirmer que les informations sont correctes</b>
          </p>
          <v-ons-button
            @click="modify"
            style="margin: 6px 0"
          >Modifier</v-ons-button>
          <v-ons-button
            :disabled="releve.validated"
            @click="validate"
            style="margin: 6px 0"
          >Information correctes</v-ons-button>
          <v-ons-button v-if="visualize" @click="visualizeReleve" style="margin: 6px 0">Voir</v-ons-button>
        </section>
        <section v-if="releve.prev.length>0" style="margin: 16px">
          <v-ons-list>
            <v-ons-list-item expandable>
              Historique
              <div class="expandable-content">
                <ons-list-header>Historique du relevé</ons-list-header>

                <ons-list v-for="(oldreleve,index) in releve.prev" :key="index">
                  <v-ons-list-title>Version {{index}}</v-ons-list-title>
                  <ons-list-item
                    v-show="oldreleve.authorName"
                  >Auteur du relevé : {{oldreleve.authorName}}</ons-list-item>
                  <ons-list-item v-show="oldreleve.specie">Espèce : {{oldreleve.specie}}</ons-list-item>
                  <ons-list-item v-show="oldreleve.common">Nom commun : {{oldreleve.common}}</ons-list-item>

                  <ons-list-item
                    v-show="oldreleve.validation.length-1"
                  >Nombre de validations : {{oldreleve.validation.length-1}}</ons-list-item>
                  <ons-list-item
                    v-show="oldreleve.modifierName"
                  >Modification par : {{oldreleve.modifierName}}</ons-list-item>
                  <v-ons-list-item v-if="oldreleve.image">
                    <img :src="oldreleve.image" style="width: 100%">
                  </v-ons-list-item>
                </ons-list>
              </div>
            </v-ons-list-item>
          </v-ons-list>
        </section>
      </div>
    </ons-card>
  </v-ons-page>
</template>
<script>
import SimplePage from "./SimplePage.vue";

export default {
  data() {
    return {
      id: "",
      showHistory: false,
      visualize: false,
      toastVisible: false
    };
  },
  computed: {
    releve() {
      return this.$store.state.releve.releves.find(rel => rel._id == this.id);
    }
  },
  methods: {
    visualizeReleve() {
      this.$store.commit("navigator/pop");
      this.$store.commit("tabbar/set", 0);
      this.$root.$emit("changeCenter", this.releve.coordinates);
    },
    validate() {
      this.$store.dispatch("releve/validateObservation", this.releve);
      this.$toasted.show("Votre validation à été prise en compte", {fullWidth:true, position:"bottom-center",duration: 2000 }); // Shows from 0s to 2s
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