<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left">
        <v-ons-back-button>Back</v-ons-back-button>
      </div>
    </v-ons-toolbar>
    <v-ons-list>
      <v-ons-list-header v-if="!modify">Nouveau relevé</v-ons-list-header>
      <v-ons-list-header v-if="modify">Modifier un relevé</v-ons-list-header>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <div class="center">
          <autocomplete
            ref="species"
            :disable-input="noTree"
            :source="specieSource"
            inputClass="inputClass"
            results-display="Species"
            results-value="Numbers"
            placeholder="Nom de l'espèce"
            :initial-display="releve.specie"
            @selected="specieSelected"
            @nothingSelected="releve.specie=''"
            @clear="releve.specie=''"
          ></autocomplete>
        </div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <div class="center">
          <autocomplete
            ref="genus"
            :source="genusList"
            inputClass="inputClass"
            results-display="name"
            placeholder="Nom du genre"
            :disable-input="noTree"
            :initial-display="releve.genus"
            @selected="genusSelected"
            @nothingSelected="releve.genus=''"
            @clear="releve.genus=''"
          ></autocomplete>
        </div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <div class="center">
          <autocomplete
            ref="common"
            :disable-input="noTree"
            :source="specieSource"
            inputClass="inputClass"
            results-display="verna1"
            placeholder="Nom commun"
            results-value="Numbers"
            :initial-display="releve.common"
            @selected="commonSelected"
            @nothingSelected="releve.common=''"
            @clear="releve.common=''"
          ></autocomplete>
        </div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>Hauteur
        </div>
        <div class="center">
          <v-ons-select :disabled="noTree" style="margin-left:15px;" v-model="selectedHeigh">
            <option v-for="heigh in heights" :value="heigh">{{ heigh }}</option>
          </v-ons-select>
        </div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>Diamètre de la couronne  
        </div>
        <div class="center">
          <v-ons-select :disabled="noTree" style="margin-left:15px;" v-model="selectedCrown">
            <option v-for="heigh in heights" :value="heigh">{{ heigh }}</option>
          </v-ons-select>
        </div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>Arbre non présent  
        </div>
        <div class="center">
          <v-ons-switch
            v-model="noTree">
          </v-ons-switch>
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
        upload: '<h1>Bummer!</h1>',
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
</style>
<script>
import PictureInput from "vue-picture-input";
import Autocomplete from "vuejs-auto-complete";
import Identification from "./Identification.vue";
import imageCompression from "browser-image-compression";
import genusList from "../js/genus.js";
import speciesList from "../js/species.js";
import specieVernac from "../js/species_vernac.js";
export default {
  data() {
    return {
      releve: {},
      noTree:false,
      selectedHeight:0,
      selectedCrown:0,
      heights: [
        "Inconnue",
        "Moins de 4m",
        "4 à 8m",
        "8 à 12m",
        "12 à 16m",
        "16 à 20m",
        "20 à 24m",
        "24 à 28m",
        "28 à 32m",
        "Plus de 32m"
      ],
      source: speciesList,
      genusList: genusList,
      specieSource: specieVernac,
      modify: false,
      validate: false
    };
  },
  components: {
    Autocomplete,
    PictureInput
  },
  computed: {
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
    commonSelected(common) {
      this.releve.common = common.display;
      this.releve.specie = common.selectedObject.Species;
      this.releve.genus = common.selectedObject.genus;
      this.$refs.species._data.display = this.releve.specie;
      this.$refs.genus._data.display = this.releve.genus;
    },
    specieSelected(specie) {
      this.releve.specie = specie.display;
      this.releve.common = specie.selectedObject.verna1;
      this.releve.genus = specie.selectedObject.genus;
      this.$refs.common._data.display = this.releve.common;
      this.$refs.genus._data.display = this.releve.genus;
    },
    genusSelected(genus) {
      this.releve.genus = genus.display;
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