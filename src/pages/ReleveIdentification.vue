<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left">
        <v-ons-back-button>Back</v-ons-back-button>
      </div>
    </v-ons-toolbar>
    <v-ons-card>
      <div class="title">Exercice d'identification</div>
      <div class="content">
        Vous devez identifier cet arbre
        précédemment identifié par un expert. Prenez au moins une photo du relevé et remplissez les champs le mieux possible. Vous aurez la bonne réponse
        après avoir soumis votre identification
      </div>
    </v-ons-card>
    <v-ons-list>
      <v-ons-list-header>Identifier un arbre</v-ons-list-header>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <div class="center">
          <autocomplete
            ref="species"
            :disable-input="releve.identificationValue.success"
            :source="specieSource"
            inputClass="inputClass"
            results-display="Species"
            results-value="Numbers"
            placeholder="Nom de l'espèce"
            :initial-display="releve.identificationValue.specie"
            @selected="specieSelected"
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
            :disable-input="releve.identificationValue.success"
            :source="genusList"
            inputClass="inputClass"
            results-display="name"
            placeholder="Nom du genre"
            :initial-display="releve.identificationValue.genus"
            @selected="genusSelected"
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
            :disable-input="releve.identificationValue.success"
            :source="specieSource"
            inputClass="inputClass"
            results-display="verna1"
            placeholder="Nom commun"
            results-value="Numbers"
            :initial-display="releve.identificationValue.common"
            @selected="commonSelected"
          ></autocomplete>
        </div>
      </v-ons-list-item>
            <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>Hauteur
        </div>
        <div class="center">
          <v-ons-select @change="releve.identificationValue.height=selectedHeight" style="margin-left:15px;" v-model="selectedHeight">
            <option v-for="heigh in heights" :value="heigh">{{ heigh }}</option>
          </v-ons-select>
        </div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>Diamètre de la couronne
        </div>
        <div class="center">
          <v-ons-select  @change="releve.identificationValue.crown=selectedCrown" style="margin-left:15px;" v-model="selectedCrown">
            <option v-for="heigh in heights" :value="heigh">{{ heigh }}</option>
          </v-ons-select>
        </div>
      </v-ons-list-item>

      <v-ons-list-item v-if="!releve.identificationValue.success">
        <picture-input
          ref="pictureInput"
          @change="onChange"
          width="600"
          :crop="false"
          :removable="true"
          height="600"
          margin="16"
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
      <v-ons-list-item v-if="releve.identificationValue.success && releve">
        <img v-show="releve.identificationValue.image" :src="releve.identificationValue.image" style="width: 100%">
      </v-ons-list-item>
    </v-ons-list>

    <v-ons-list v-show="releve.identificationValue.success">
      <v-ons-list-item>
        <div class="center">Espèce identifiée par l'expert : {{releve.specie}}</div>
        <div v-if="releve.specie==releve.identificationValue.specie" class="right">Bravo!</div>
        <div v-else class="right">Raté!</div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="center">Genre identifié par l'expert : {{releve.genus}}</div>
        <div v-if="releve.genus==releve.identificationValue.genus" class="right">Bravo!</div>
        <div v-else class="right">Raté!</div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="center">Nom vernaculaire identifiée par l'expert : {{releve.common}}</div>
        <div v-if="releve.common==releve.identificationValue.common" class="right">Bravo!</div>
        <div v-else class="right">Raté!</div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="center">Hauteur identifié par l'expert : {{releve.height}}</div>
        <div v-if="releve.height==releve.identificationValue.height" class="right">Bravo!</div>
        <div v-else class="right">Raté!</div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="center">Diamètre de la couronne identifié : {{releve.crown}}</div>
        <div v-if="releve.crown==releve.identificationValue.crown" class="right">Bravo!</div>
        <div v-else class="right">Raté!</div>
      </v-ons-list-item>
    </v-ons-list>
    <section style="margin: 16px">
      <v-ons-button
        @click="complete"
        :disabled="releve.identificationValue.success"
        style="margin: 6px 0"
      >Valider</v-ons-button>
      <v-ons-button modifier="outline" @click="cancel" style="margin: 6px 0">Retour</v-ons-button>
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
import imageCompression from "browser-image-compression";
import Autocomplete from "vuejs-auto-complete";
import Identification from "./Identification.vue";
import genusList from "../js/genus.js";
import speciesList from "../js/species.js";
import specieVernac from "../js/species_vernac.js";
export default {
  data() {
    return {
      releve: {},
      selectedHeight:0,
      selectedCrown:0, 
      genusList: genusList,
      specieSource: specieVernac
    };
  },
  components: {
    Autocomplete,
    PictureInput
  },
  computed: {
    heights(){
      return this.$store.state.commonData.heights
    },
    completed() {
      if (this.releve.identificationValue.image) {
        return true;
      }
    }
  },
  methods: {
    changeHeight(e){
      console.log(e)
      console.log(this.selectedHeight)
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
                this.releve.identificationValue.image = compressedDataURI;
              }.bind(this)
            );
            //return uploadToServer(compressedFile); // write your own logic
          }.bind(this)
        )
        .catch(function(error) {
          console.log(error.message);
        });
    },

    commonSelected(common) {
      this.releve.identificationValue.common = common.display;
      this.releve.identificationValue.specie = common.selectedObject.Species;
      this.releve.identificationValue.genus = common.selectedObject.genus;
      this.$refs.species._data.display = this.newReleve.specie;
      this.$refs.genus._data.display = this.newReleve.genus;
    },
    specieSelected(specie) {
      this.releve.identificationValue.specie = specie.display;
      this.releve.identificationValue.common = specie.selectedObject.verna1;
      this.releve.identificationValue.genus = specie.selectedObject.genus;
      this.$refs.common._data.display = this.releve.identificationValue.common;
      this.$refs.genus._data.display = this.releve.identificationValue.genus;
    },
    genusSelected(genus) {
      this.releve.identificationValue.genus = genus.display;
    },
    complete() {
      this.$store.dispatch("releve/identification", this.releve);
      this.releve.identificationValue.success = true;
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