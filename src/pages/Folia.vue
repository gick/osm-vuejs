<template>
  <v-ons-page>
    <div class="background"></div>
    <div class="content" style>
      <v-ons-card>
        <div class="title">Identifier une feuille</div>
        <div class="content">
          <p>Prenez une photo de feuille puis réaliser un tracé à l'intérieur de la feuille</p>
          <FileUpload @image="setImage"></FileUpload>
          <v-ons-button :disabled="(foliaStarted || !draw)" @click="sendImages">Identifier</v-ons-button>
          <v-ons-button @click="restart" v-if="foliaResult.length">Nouvelle identification</v-ons-button>
        </div>
      </v-ons-card>
      <v-ons-card v-if="foliaStarted">
        <div class="title">Identification via Folia</div>
        <div class="content">
          <div style="position:relative;">
            <p>
              <v-ons-progress-bar :value="currentStep"></v-ons-progress-bar>
            </p>
          </div>
          <v-ons-list v-if="foliaResult.length">
            <v-ons-list-header>Résultats</v-ons-list-header>
            <v-ons-list-item v-for="(specieResult, index) in foliaResult" :key="index">
              <div class="left"></div>
              <div class="center">{{specieResult.species}} {{specieResult.percent}}%</div>
            </v-ons-list-item>
          </v-ons-list>
        </div>
      </v-ons-card>
      <v-ons-modal :visible="modalVisible">
        <div style="position:relative;">
          <img
            ref="image"
            :src="imageData"
            @load="imageLoaded"
            style="max-height: 100vh;max-width: 100vw;"
          >
          <VueSignaturePad
            :options="{dotSize:5,minWidth:15,maxWidth:15,penColor:'rgb(0,125,0)',onBegin}"
            :width="width"
            :height="height"
            ref="signaturePad"
            style="position:absolute;top:0;left: 0;right: 0;margin: auto;"
          ></VueSignaturePad>
        </div>
        <p>Réalisez un tracé à l'intérieur de la feuille puis valider</p>
        <v-ons-button
          style="position: absolute;left: 0;right: 0;bottom: 1px"
          @click="sendImages"
        >Valider</v-ons-button>
      </v-ons-modal>

      <div style="position:relative"></div>
    </div>
  </v-ons-page>
</template>

<script>
import { SSE } from "../js/sse.js";
import imageCompression from "browser-image-compression";
import VueSignaturePad from "vue-signature-pad";
import FileUpload from "../FileUpload.vue";
import { Promise } from "q";
export default {
  data() {
    return {
      imageData: "",
      width: "0",
      height: "0",
      currentStep: 0,
      foliaStarted: false,
      foliaResult: [],
      draw: false,
      modalVisible: false
    };
  },
  components: {
    VueSignaturePad,
    FileUpload
  },
  methods: {
    onBegin() {
      this.draw = true;
    },
    restart() {
      this.imageData = "";
      this.$refs.signaturePad.clearSignature();
      this.width = "0";
      this.height = "0";
      this.foliaStarted = false;
      this.foliaResult = [];
      this.currentStep = 0;
      this.draw = false;
    },
    imageLoaded() {
      this.modalVisible = true;
      this.$refs.signaturePad.resizeCanvas();
      this.$nextTick(() => {
        this.width = this.$refs.image.clientWidth + "px";
        this.height = this.$refs.image.clientHeight + "px";
        this.$nextTick(() => {
          this.$refs.signaturePad.resizeCanvas();
        });
      });
      console.log("imageLoaded");
    },
    resizedataURL(datas, wantedWidth, wantedHeight, type) {
      return new Promise(function(resolve, reject) {
        // We create an image to receive the Data URI
        var img = document.createElement("img");

        // When the event "onload" is triggered we can resize the image.
        img.onload = function() {
          // We create a canvas and get its context.
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");

          // We set the dimensions at the wanted size.
          canvas.width = wantedWidth;
          canvas.height = wantedHeight;

          // We resize the image with the canvas method drawImage();
          ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);

          var dataURI = canvas.toDataURL(type);
          resolve(dataURI);
          /////////////////////////////////////////
          // Use and treat your Data URI here !! //
          /////////////////////////////////////////
        };

        // We put the Data URI in the image's src attribute
        img.src = datas;
      });
    },
    parseResult(res) {
      for (let item of res) {
        let species = _.startCase(item.split(",")[0]);
        let percent = parseInt(item.split(",")[1]);
        this.foliaResult.push({ species: species, percent: percent });
      }
    },
    handleError() {
      this.$toasted.show(
        "Erreur lors de la reconnaissance. Essayez avec une autre photo.",
        {
          fullWidth: true,
          position: "bottom-center",
          duration: 4000
        }
      ); // Shows from 0s to 2s
      this.restart()
    },

    sendImages() {
      this.$store.commit('user/startFolia')
      this.modalVisible = false;
      let { status, data } = this.$refs.signaturePad.saveSignature();
      this.foliaStarted = true;
      this.resizedataURL(
        data,
        Number(this.width.replace("px", "")),
        Number(this.height.replace("px", "")),
        "image/png"
      ).then(dataURI => {
        this.resizedataURL(
          this.imageData,
          Number(this.width.replace("px", "")),
          Number(this.height.replace("px", "")),
          "image/jpeg"
        ).then(imageData => {
          let data = new FormData();
          data.append("trace", dataURI);
          data.append("leaf", imageData);

          var source = new SSE("http://localhost:8081/api/setupImages", {
            headers: { "Content-Type": "application/json;charset=UTF-8" },
            payload: JSON.stringify({ trace: dataURI, leaf: imageData })
          });
          source.addEventListener("readystatechange", function(e) {
            console.log(e);
          });
          source.addEventListener("error", function(e) {
           // this.handleError();
            source.close();
          }.bind(this));

          source.addEventListener(
            "message",
            function(e) {
              // Assuming we receive JSON-encoded data payloads:
              var payload = JSON.parse(e.data);
              console.log(payload);
              this.currentStep = this.currentStep + 3;
              if (payload.error) {
                this.handleError();
                source.close();
              }
              if (payload.data) {
                this.parseResult(payload.data);
                source.close();
              }
            }.bind(this)
          );
          source.stream();
        });
      });
    },
    setImage(imageData) {
      this.imageData = imageData;
    },
  }
};
</script>
