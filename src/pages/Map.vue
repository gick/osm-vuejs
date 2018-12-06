<template>
  <v-ons-page>
    <div>
      <l-map
        ref="map"
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        style="height: 60vh"
        @update:center="centerUpdate"
        @click="onMapClick"
        @update:zoom="zoomUpdate"
      >
        <l-circle
          @click="circleClick(index)"
          v-for="(circle,index) in circles"
          custom="10"
          v-bind:key="index"
          :lat-lng="circle.center"
          :radius="circle.radius"
          :color="'red'"
        />

        <l-tile-layer :url="url" :attribution="attribution"/>
      </l-map>
      <v-ons-button @click="fetchOSM">Get OSM Data {{circles[0]}}</v-ons-button>
    </div>
  </v-ons-page>
</template>

<script>
import {
  LMap,
  LTileLayer,
  LCircle,
  LMarker,
  LPopup,
  LTooltip
} from "vue2-leaflet";
import SimplePage from "./SimplePage.vue";

export default {
  components: {
    LCircle,
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip
  },
  data() {
    return {
      circles: [],
      map: null,
      circleClicked: false,
      zoom: 18,
      center: L.latLng(48.08497, -0.75763),
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
    fetchOSM() {
      axios.get("http://osm.reveries-project.fr:8000/trees").then(
        function(results) {
          for (let circle of results.data) {
            circle.radius = 5;
            this.circles.push(circle);
          }
        }.bind(this)
      );
    },
    circleClick(evt) {
      console.log(evt);
      this.circleClicked = true;
      this.$ons.notification
        .alert("Un releve est déja présent ici!")
        .then(response => {
          this.$nextTick(() => {
            this.circleClicked = false;
          });
        });
    },
    onMapClick(evt) {
      console.log(evt);
      if (this.circleClicked) {
        return;
      }
      var newCircle = {
        center: [evt.latlng.lat, evt.latlng.lng],
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 10
      };
      this.circles.push(newCircle);
      console.log("clicked on map");
      /*   var circle = L.circle([evt.latlng.lat, evt.latlng.lng], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 10
      })
        .addTo(this.map)
        .on("click", this.circleClick);*/

      this.$ons.notification
        .confirm("Voulez vous réaliser un nouveau relevé?")
        .then(response => {
          if (response) {
            this.$store.commit("releve/add", { newCircle });
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
            this.circles.pop();
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
