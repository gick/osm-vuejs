<template>
  <v-ons-page>
    <div>
      <div style="height: 20%; overflow: auto;">
        <h3>Simple map</h3>
        <p>First marker is placed at {{ withPopup.lat }}, {{ withPopup.lng }}</p>
        <p>Center is at {{ currentCenter }} and the zoom is: {{ currentZoom }}</p>
        <button @click="showLongText">Toggle long popup</button>
      </div>
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
        <l-marker :lat-lng="withPopup">
          <l-popup>
            <div @click="innerClick">I am a popup
              <p
                v-show="showParagraph"
              >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi. Donec finibus semper metus id malesuada.</p>
            </div>
          </l-popup>
        </l-marker>
        <l-marker :lat-lng="withTooltip">
          <l-tooltip :options="{permanent: true, interactive: true}">
            <div @click="innerClick">I am a tooltip
              <p
                v-show="showParagraph"
              >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi. Donec finibus semper metus id malesuada.</p>
            </div>
          </l-tooltip>
        </l-marker>
      </l-map>
    </div>
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
      zoom: 18,
      center: L.latLng(47.41322, -1.219482),
      url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
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
    onMapClick(evt) {
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
          }
        });
      var circle = L.circle([evt.latlng.lat, evt.latlng.lng], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 2
      }).addTo(this.map);
      console.log(this.$refs);
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
