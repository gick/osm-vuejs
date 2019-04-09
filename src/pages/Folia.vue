<template>
  <v-ons-page>
    <div class="background"></div>
    <div class="content" style>
      <v-ons-card>
        <div class="title">Identification de feuilles</div>
        <div class="content">
          <p>Prenez une photo de feuille puis réaliser un tracé à l'intérieur de la feuille</p>
          <FileUpload @image="setImage"></FileUpload>
          <v-ons-button @click="sendImages">Identifier</v-ons-button>
        </div>
      </v-ons-card>

      <div style="position:relative">
        <img ref="image" :src="imageData" @load="imageLoaded" style="width:100%">
        <VueSignaturePad
          :options="{dotSize:5,minWidth:15,maxWidth:15,penColor:'rgb(0,125,0)'}"
          :width="width"
          :height="height"
          ref="signaturePad"
          style="position:absolute;top:0;"
        ></VueSignaturePad>
      </div>
    </div>
  </v-ons-page>
</template>

<script>
import imageCompression from "browser-image-compression";
import canvas from "../js/canvas.directive.js";

import VueSignaturePad from "vue-signature-pad";
import FileUpload from "../FileUpload.vue";
export default {
  data() {
    return { imageData: "", width: "0", height: "0" };
  },
  directives: {
    canvas
  },
  components: {
    VueSignaturePad,
    FileUpload
  },
  methods: {
    imageLoaded() {
      this.width = this.$refs.image.clientWidth + "px";
      this.height = this.$refs.image.clientHeight + "px";
      this.$refs.signaturePad.resizeCanvas();
      this.$nextTick(() => {
        this.$refs.signaturePad.resizeCanvas();
      });
      console.log("imageLoaded");
    },
    sendImages(){
     let {status,data}=this.$refs.signaturePad.saveSignature()
     axios.post('http://localhost:8081/setupImages',{trace:data})
    },
    setImage(imageData) {
      this.imageData = imageData;
    },
    transition(releve) {
      this.$store.commit("navigator/push", {
        extends: Releve,
        data() {
          return {
            releve: releve,
            visualize: true
          };
        }
      });
    }
  }
};
</script>
