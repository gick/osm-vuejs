<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left">
        <v-ons-back-button>Retour</v-ons-back-button>
      </div>
    </v-ons-toolbar>
    <v-ons-list>
      <v-ons-list-header v-if="!modify">Nouveau relevé</v-ons-list-header>
      <v-ons-list-header v-if="modify">Modifier un relevé</v-ons-list-header>
      <v-ons-list-title         style="margin-top: 10px;
    font-size: 15px;
    font-weight: bolder;"
>Identification</v-ons-list-title>

      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <div class="center">
          <v-select
            v-model="releve.specie"
            @input="updateReleve($event,'specie')"
            ref="species"
            :options="specieVerSource"
            label="espece"
            placeholder="Nom de l'espèce"
            style="width: -webkit-fill-available;"
          ></v-select>
        </div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <div class="center">
          <v-select
            v-model="releve.genus"
            ref="genus"
            :options="genusList"
            @input="setGenus"
            label="name"
            placeholder="Nom du genre"
            style="width: -webkit-fill-available;"
          ></v-select>
        </div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>

        <v-select
          v-model="releve.common"
          @input="updateReleve($event,'common')"
          label="vernaculaire"
          ref="common"
          style="width: -webkit-fill-available;"
          placeholder="Nom vernaculaire"
          :options="specieVerSource"
        ></v-select>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>Degré de confiance
        </div>
        <div class="center">
          <v-ons-select :disabled="noTree" style="margin-left:15px;" v-model="releve.confidence">
            <option
              v-for="(confidence,index) in confidenceValues"
              :value="confidence"
              v-bind:key="index+'confidence'"
            >{{ confidence }}</option>
          </v-ons-select>
        </div>
      </v-ons-list-item>

      <v-ons-list-item v-if="validate">
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>Arbre non présent
        </div>
        <div class="center" style="margin-left:15px;">
          <v-ons-switch @change="releve.noTree=noTree" v-model="noTree"></v-ons-switch>
        </div>
      </v-ons-list-item>

      <v-ons-list-item>
        <picture-input
          ref="pictureInput"
          @change="onChange"
          width="600"
          :crop="false"
          :removable="true"
          height="600"
          margin="16"
          :disabled="noTree"
          accept="image/*"
          capture="camera"
          size="10"
          buttonClass="btn"
          :customStrings="{
          tap: 'Appuyez ici pour prendre une photo', // HTML allowed
        drag: 'Prendre photo'
      }"
        ></picture-input>
      </v-ons-list-item>
    </v-ons-list>
    <section style="margin: 16px">
      <v-ons-button @click="complete" style="margin: 6px 0">Envoyer</v-ons-button>
      <v-ons-button modifier="outline" @click="cancel" style="margin: 6px 0">Annuler</v-ons-button>
    </section>
  </v-ons-page>
</template>
<style>
#app .autocomplete__results {
  position: relative !important;
}
.vs__dropdown-menu {
  z-index: 10005;
}
</style>
<script>
//Lors de la modif d'un champ puis retour arrière sans valider, la page est mise à jour
// Mettre des labels espèces
import PictureInput from "vue-picture-input";
import Identification from "./Identification.vue";
import imageCompression from "browser-image-compression";
import genusList from "../js/genus.js";
import speciesList from "../js/species_ver.js";
export default {
  data() {
    return {
      releve: {},
      specie: "",
      noTree: false,
      selectedHeight: 0,
      selectedConfidence: "Non renseignée",
      selectedCrown: 0,
      specieVerSource: speciesList,
      genusList: genusList,
      modify: false,
      validate: false
    };
  },
  components: {
    PictureInput
  },
  computed: {
    confidenceValues() {
      return this.$store.state.commonData.confidenceValues;
    },
    completed() {
      if (this.genus.length) {
        return true;
      }
      if (this.specieIndex) {
        return true;
      }
    }
  },
  methods: {
    noResult(e) {
      console.log(e);
    },
    setGenus(evt) {
      if (evt == null) this.$refs.genus.value = "";
    },
    updateReleve(evt, src) {
      if (evt && evt.espece && evt.vernaculaire && evt.genus) {
        this.releve.specie = evt.espece;
        this.releve.common = evt.vernaculaire;
        this.releve.genus = evt.genus;
      }
      if (evt == null) {
        switch (src) {
          case "specie":
            this.$refs.species.value = "";
            break;
          case "common":
            this.$refs.common.value = "";
            break;
        }
      }
    },
    onChange() {
      var that = this;
      //this.image = this.$refs.pictureInput.image;
      // console.log(this.image.length)
      var imageFile = this.$refs.pictureInput.file;
      console.log("originalFile instanceof Blob", imageFile instanceof Blob); // true
      console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

      var maxSizeMB = 0.1;
      var maxWidthOrHeight = 600; // compressedFile will scale down by ratio to a point that width or height is smaller than maxWidthOrHeight
      imageCompression(imageFile, maxSizeMB, maxWidthOrHeight) // maxSizeMB, maxWidthOrHeight are optional
        .then(
          function(compressedFile) {
            console.log(
              "compressedFile instanceof Blob",
              compressedFile instanceof Blob
            ); // true
            console.log(
              `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
            ); // smaller than maxSizeMB
            imageCompression.getDataUrlFromFile(compressedFile).then(
              function(compressedDataURI) {
                this.releve.image = compressedDataURI;
              }.bind(this)
            );
            //return uploadToServer(compressedFile); // write your own logic
          }.bind(this)
        )
        .catch(function(error) {
          console.log(error.message);
        });
    },
    complete() {
      let releve = this.releve;
      if (!this.modify) {
        this.releve.coordinates = this.coordinates;
        this.$store.dispatch("releve/setObservation", releve);
        this.$store.commit("navigator/pop");
      } else {
        this.$store.dispatch("releve/modifyObservation", releve);
        this.$store.commit("navigator/pop");
      }
    },
    cancel() {
      this.$store.commit("navigator/pop");
    }
  }
};
</script>
<style>
.inputDiv {
  color: red;
}
</style>