<template>
  <v-ons-page>
    <custom-toolbar backLabel="Retour"></custom-toolbar>
    <ons-card v-if="releve">
      <div class="title" v-if="!fromOSM">Relevé</div>
      <div class="title" v-if="fromOSM">Relevé importé d'OSM</div>
      <div class="content">
        <ons-list>
          <ons-list-header>Information</ons-list-header>
          <ons-list-item v-show="releve.authorName">Auteur du relevé : {{releve.authorName}}</ons-list-item>
          <ons-list-item v-show="releve.specie">Espèce : {{releve.specie}}</ons-list-item>
          <ons-list-item v-show="releve.genus">Genre : {{releve.genus}}</ons-list-item>
          <ons-list-item v-show="releve.common">Nom commun : {{releve.common}}</ons-list-item>
          <ons-list-item v-show="releve.height">Hauteur : {{releve.height}}</ons-list-item>
          <ons-list-item v-show="releve.crown">Diamètre de la couronne : {{releve.crown}}</ons-list-item>
          <ons-list-item v-show="releve.confidence">Degré de confiance de l'observateur : {{releve.confidence}}</ons-list-item>
          <ons-list-item v-show="releve.noTree.length>0">Utilisateurs déclarant ce relevé douteux (sans arbre) : {{releve.noTree.length}}</ons-list-item>

          <ons-list-item
            v-show="releve.validation.length-1"
          >Nombre de validations : {{releve.validation.length-1}}</ons-list-item>
          <ons-list-item
            v-show="releve.modifierName"
          >Dernière modification par : {{releve.modifierName}}</ons-list-item>
        </ons-list>
        <img v-show="releve.image" :src="releve.image" style="width: 100%">

        <section style="margin: 16px">
          <p class="center">
            Vous pouvez
            <b>modifier</b> le relevé
            <b>ou bien confirmer que les informations sont correctes</b>
          </p>
          <v-ons-button @click="modify" :disabled="noTreeValue" style="margin: 6px 0">Modifier</v-ons-button>
          <v-ons-button :disabled="validated || noTreeValue" @click="validate" style="margin: 6px 0">Confirmer</v-ons-button>
          <v-ons-button v-if="allowImport && !fromOSM" @click="uploadToOSM" style="margin: 6px 0">Envoyer vers OSM</v-ons-button>

          <v-ons-button v-if="visualize" @click="visualizeReleve" style="margin: 6px 0">Voir</v-ons-button>
        </section>
        <section style="margin: 16px">
          <p class="center">
            Si aucun arbre n'est présent,
            <b>vous pouvez tagger ce relevé douteux</b>
          </p>
          <v-ons-switch
            v-model="noTreeValue"
            :disabled="allowNoTree"
            style="margin: 6px 0"
          ></v-ons-switch>
        </section>
        <section v-if="!fromOSM" style="margin: 16px">
          <p class="center">Supprimer le relevé, cette opération est définitive!</p>
          <v-ons-button @click="removeObs" :disabled="(!allowRemove)" style="margin: 6px 0">Supprimer</v-ons-button>
        </section>
        <section v-if="fromOSM" style="margin: 16px">
          <p class="center">Renvoyer le relevé sur OSM</p>
          <v-ons-button @click="uploadAndRemove" style="margin: 6px 0">Renvoyer vers OSM</v-ons-button>
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
import uploadObservationToOSM from "../js/osmPost"
import osmUpdate from "../js/osmUpdate"

// TODO cacher supprimer relevé si l'utilisateur ne peut pas le supprimer
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
    },
    isGod(){
      return this.$store.state.user.isGod
    },
    noTreeValue: {
      get() {
        let el = this.releve.noTree.filter(val => val.osmId == this.userID);
        return el.length ? true : false;
      },
      set(newval) {
        if (newval) {
          this.$store.dispatch("releve/setNoTree", this.releve);
        } else {
          this.$store.dispatch("releve/unsetNoTree", this.releve);
        }
      }
    },
    userID() {
      return this.$store.state.user.id;
    },
    validated() {
      let val = this.releve.validation.find(val => val.id == this.userID);
      return val ? true : false;
    },
    fromOSM(){
      return this.releve.source=="OSM"
    }
    ,
    allowNoTree() {
      if(this.releve.source=="OSM"){
        return false
      }
      return (
        this.releve.osmId == this.userID ||
        this.releve.modifierId == this.userID || this.validated
      );
    },
    allowRemove() {
      if(this.isGod){
        return true
      }
      return this.releve.osmId == this.userID && this.releve.prev.length == 0;
    },
    allowImport(){
      return this.releve.osmId==this.userID
    }
  },
  methods: {
    uploadToOSM(){
      uploadObservationToOSM(this.releve)
      this.$store.commit("navigator/pop");
      this.$store.dispatch("releve/remove", this.releve);
    },
    uploadAndRemove(){
      osmUpdate(this.releve)
      this.$store.dispatch("releve/remove", this.releve);
      this.$store.commit("navigator/pop");
    },

    visualizeReleve() {
      this.$store.commit("navigator/pop");
      this.$store.commit("tabbar/set", 0);
      this.$root.$emit("changeCenter", this.releve.coordinates);
    },
    validate() {
      this.$store.dispatch("releve/validateObservation", this.releve);
      this.$toasted.show("Votre validation à été prise en compte", {
        fullWidth: true,
        position: "bottom-center",
        duration: 2000
      }); // Shows from 0s to 2s
    },
    removeObs() {
      this.$store.dispatch("releve/remove", this.releve);
      this.$store.commit("navigator/pop");
      this.$toasted.show("Votre relevé a été supprimé", {
        fullWidth: true,
        position: "bottom-center",
        duration: 2000
      }); // Shows from 0s to 2s
    },
    modify() {
      this.$store.commit("navigator/push", {
        extends: SimplePage,
        data: function() {
          return {
            releve: this._.clone(this.releve),
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