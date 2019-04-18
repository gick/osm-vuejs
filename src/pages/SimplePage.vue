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
            :source="source"
            inputClass="inputClass"
            results-display="name"
            placeholder="Nom de l'espèce"
            v-model="currentSpecie"
            :initial-display="specie"
            @selected="specieSelected"
          ></autocomplete>
        </div>
      </v-ons-list-item>


      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <v-ons-input placeholder="Nom commun" float v-model="common"></v-ons-input>
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
      <v-ons-button  @click="complete" style="margin: 6px 0">Envoyer</v-ons-button>
      <v-ons-button modifier="outline" @click="cancel" style="margin: 6px 0">Annuler</v-ons-button>
    </section>
  </v-ons-page>
</template>
<style>
#app .autocomplete__results{
 position:relative!important;
}
</style>
<script>
import PictureInput from "vue-picture-input";
import Autocomplete from "vuejs-auto-complete";
import Identification from "./Identification.vue";
import imageCompression from "browser-image-compression";
import genusList from "../js/genus.js";
import speciesList from "../js/species.js";

export default {
  data() {
    return {
      image: null,
      common: "",
      source: speciesList,
      genus: "",
      specie:'',
      currentSpecie:0,
      modify:false
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
    specieSelected(specie){
      this.specie=specie.display
    },
    identify() {
      this.$store.commit("navigator/push", {
        extends: Identification,
        data() {
          return {
            toolbarInfo: {
              backLabel: "Home",
              title: "key"
            }
          };
        }
      });
    },
    onChange() {
      this.imageHasChange = true;
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
                this.image = compressedDataURI;
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
      if (!this.modify) {
        this.$store.dispatch("releve/setObservation", {
          coordinates: this.coordinates,
          image: this.image,
          specie: this.specie
        });
        this.$store.commit("navigator/pop");
        if (this.image != null) {
          this.$store.commit("releve/photoAjoutee", this.specie)
        }
      } else {
        this.$store.commit("releve/modify", {
          id: this.releveId,
          genus: this.genus,
          image: this.image,
          specie: this.specie
        });
        this.$store.commit("navigator/pop");
        if (this.image != null && this.imageHasChange) {
          this.$store.commit("releve/photoAjoutee", this.specie)
        }
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