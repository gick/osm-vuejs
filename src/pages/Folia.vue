<template>
  <v-ons-page>
    <div class="background"></div>
    <div class="content" style>
      <FileUpload @image="setImage"></FileUpload>
      <div style="position:relative">
        <img style="width:300px;" ref="image" @load="imageLoaded" :src="imageData">

        <VueSignaturePad style="position:absolute;top:0px;" width="300px" ref="signaturePad"/>
      </div>
    </div>
  </v-ons-page>
</template>

<script>
import VueSignaturePad from "vue-signature-pad";
import FileUpload from "../FileUpload.vue";
export default {
  data() {
    return { imageData: "" };
  },
  components: {
    VueSignaturePad,
    FileUpload
  },
  computed: {
    releves() {
      return this.$store.state.releve.releves;
    }
  },
  methods: {
    imageLoaded() {
      console.log("image loaded");
      console.log(this.$refs.image.clientHeight);
      this.$refs.signaturePad.resizeCanvas()
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
