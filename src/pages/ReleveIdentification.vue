<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left">
        <v-ons-back-button>Retour</v-ons-back-button>
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
          <v-select
            v-model="releve.identificationValue.specie"
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
            v-model="releve.identificationValue.genus"
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
          v-model="releve.identificationValue.common"
          @input="updateReleve($event,'common')"
          label="vernaculaire"
          ref="common"
          style="width: -webkit-fill-available;"
          placeholder="Nom vernaculaire"
          :options="specieVerSource"
        ></v-select>
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
          tap: 'Appuyer pour prendre une photo'
          }"
        ></picture-input>
      </v-ons-list-item>
      <v-ons-list-item v-if="releve.identificationValue.success && releve">
        <img
          v-show="releve.identificationValue.image"
          :src="releve.identificationValue.image"
          style="width: 100%"
        >
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
    </v-ons-list>
    <section style="margin: 16px">
      <v-ons-button
        @click="complete"
        :disabled="releve.identificationValue.success || !hasImage"
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
.vs__dropdown-menu {
  z-index: 10005;
}
</style>
<script>
import PictureInput from "vue-picture-input";
import imageCompression from "browser-image-compression";
import Autocomplete from "vuejs-auto-complete";
import Identification from "./Identification.vue";
import genusList from "../js/genus.js";
import speciesList from "../js/species_ver.js";
export default {
  data() {
    return {
      releve: {},
      genusList: genusList,
      specieVerSource: speciesList
    };
  },
  components: {
    Autocomplete,
    PictureInput
  },
  computed: {
    hasImage() {
      if (this.releve.identificationValue.image) {
        return true;
      }
      return false
    }
  },
  methods: {
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
                this.$set(this.releve.identificationValue,'image', compressedDataURI);
              }.bind(this)
            );
            //return uploadToServer(compressedFile); // write your own logic
          }.bind(this)
        )
        .catch(function(error) {
          console.log(error.message);
        });
    },

    setGenus(evt) {
      if (evt == null) this.$refs.genus.value = "";
    },
    updateReleve(evt, src) {
      if (evt && evt.espece && evt.vernaculaire && evt.genus) {
        this.releve.identificationValue.specie = evt.espece;
        this.releve.identificationValue.common = evt.vernaculaire;
        this.releve.identificationValue.genus = evt.genus;
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