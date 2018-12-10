<template>
  <v-ons-page>
    <custom-toolbar>Authentification</custom-toolbar>

    <v-ons-carousel fullscreen swipeable auto-scroll overscrollable :index.sync="carouselIndex">
      <v-ons-carousel-item style="backgroundColor: gray">
        <div class="color-tag">
          <h1>Bienvenue dans REVERIES OSM</h1>Vous avez besoin d'un compte Open Street Map pour vous identifiez. Si vous n'avez pas de compte créer le maintenant sinon aller à la page suivante
        </div>
      </v-ons-carousel-item>
      <v-ons-carousel-item class="carousel-item" style="backgroundColor: gray">
        <div class="color-tag">
          <v-ons-button @click="setPage">Authentification</v-ons-button>
        </div>
      </v-ons-carousel-item>
    </v-ons-carousel>

    <div class="dots">
      <span
        v-for="dotIndex in 2"
        :key="dotIndex"
        @click="carouselIndex = dotIndex - 1"
      >{{ carouselIndex === dotIndex - 1 ? '\u25CF' : '\u25CB' }}</span>
    </div>
  </v-ons-page>
</template>

<script>
var osmAuth = require("osm-auth");

export default {
  data() {
    return {
      carouselIndex: 0
    };
  },
  methods: {
    authenticate() {
      var auth = osmAuth({
        oauth_secret: "2Lvox3AgvElch3dKc5UTKEl9o7HS4hNGNvaBqqbb",
        oauth_consumer_key: "H7lPW3FFfxPR6p96beUX4tgXYzQNiWBPvbP2zfGC"
      });
      auth.authenticate();
    },

    setPage() {
      this.$store.commit("navigator/pop");
    }
  }
};
</script>

<style scoped>
.carousel-item {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.color-tag {
  color: #fff;
  font-size: 20px;
  font-weight: bold;
}

.dots {
  text-align: center;
  font-size: 30px;
  color: #fff;
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
}

.dots > span {
  cursor: pointer;
}
</style>
