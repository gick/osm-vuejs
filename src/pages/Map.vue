<template>
  <v-ons-page>
    <div>
      <l-map
        ref="map"
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        style="height: 30em"
        @update:center="centerUpdate"
        @click="onMapClick"
        @update:zoom="zoomUpdate"
      >
        <l-tile-layer :url="url" :attribution="attribution"/>
      </l-map>
    </div>
    <v-ons-button @click="fetchOSM">Charger les données OSM</v-ons-button>
  </v-ons-page>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from "vue2-leaflet";
import SimplePage from "./SimplePage.vue";

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip
  },
  data() {
    return {
      map: null,
      circleClicked: false,
      zoom: 18,
      center: L.latLng(47.41322, -1.219482),
      url: "//proxy-ign.openstreetmap.fr/94GjiyqD/bdortho/{z}/{x}/{y}.jpg",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: L.latLng(47.41322, -1.219482),
      withTooltip: L.latLng(47.41422, -1.250482),
      currentZoom: 11.5,
      currentCenter: L.latLng(47.41322, -1.219482),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5
      }
    };
  },
  created() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject; // work as expected
    });
  },
  methods: {
    fetchOSM(){
      console.log(axios)
      axios.get('http://localhost:8000/trees')
        .then(result=>{console.log(result)})
    },
    circleClick(evt) {
      this.circleClicked = true;
      this.$ons.notification
        .confirm("Voulez vous supprimer votre relevé?")
        .then(response => {
          if (response) {
            this.map.removeLayer(evt.target);
          }
          this.$nextTick(() => {
            this.circleClicked = false;
          });
        });
    },
    onMapClick(evt) {
      if (this.circleClicked) {
        return;
      }
      console.log("clicked on map");
      var circle = L.circle([evt.latlng.lat, evt.latlng.lng], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 10
      })
        .addTo(this.map)
        .on("click", this.circleClick);

      this.$ons.notification
        .confirm("Voulez vous réaliser un nouveau relevé?")
        .then(response => {
          if (response) {
            this.$store.commit("navigator/push", {
              extends: SimplePage,
              data() {
                return {
                  toolbarInfo: {
                    backLabel: "Home",
                    title: "key"
                  }
                };
              }
            });
          } else {
            this.map.removeLayer(circle);
          }
        });
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    showLongText() {
      this.showParagraph = !this.showParagraph;
    },
    innerClick() {
      alert("Click!");
    }
  }
};
</script>

<style scoped>
@import "../../node_modules/leaflet/dist/leaflet.css";
</style>
