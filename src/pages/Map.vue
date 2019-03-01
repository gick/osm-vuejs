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
        @locationfound="locationfound"
        @locationerror="locationerror"
        @update:zoom="zoomUpdate"
      >
        <l-circle
          @click="circleClick(event,index)"
          custom="10"
          v-if="newCircle"
          :lat-lng="newCircle.center"
          :radius="8"
          :color="'red'"
        />

        <l-circle
          @click="circleClick(event,index)"
          v-for="(circle,index) in osmCircles"
          custom="10"
          v-bind:key="index"
          :lat-lng="circle.center"
          :radius="5"
          :color="'blue'"
        />
        <l-circle
          @click="circleClick($event,index)"
          v-for="(circle,index) in observations"
          custom="10"
          v-bind:key="index+osmCircles.length"
          :lat-lng="circle.coordinates"
          :radius="8"
          :color="'red'"
        />

        <l-tile-layer :url="url" :attribution="attribution"/>
      </l-map>
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
  Vue2Leaflet,
  LTooltip
} from "vue2-leaflet";
import SimplePage from "./SimplePage.vue";
import Releve from './Releve.vue'

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
      newCircle: null,
      osmCircles: [],
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
  computed: {
    observations() {
      return this.$store.state.releve.releves;
    }
  },
  created() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject; // work as expected
      this.map.locate({ setView: true, maxZoom: 16 });
      axios.get("http://localhost:8000/trees").then(
        function(results) {
          console.log(results);
          for (let circle of results.data) {
            circle.radius = 5;
            this.osmCircles.push(circle);
          }
        }.bind(this)
      );
    });
  },
  methods: {
    locationerror(e) {
      alert(e.message);
    },
    locationfound(e) {
      var radius = e.accuracy / 2;
      L.marker(e.latlng)
        .addTo(this.map)
        .bindPopup("You are within " + radius + " meters from this point")
        .openPopup();

      L.circle(e.latlng, radius).addTo(this.map);
    },
    circleClick(evt,index) {
      console.log(index);
      var releve=this.observations[index]
      this.circleClicked = true;
       this.$store.commit('navigator/push', {
        extends: Releve,
        data() {
          return {
            releve: releve
          }
        }

      });
             this.$nextTick(() => {
            this.circleClicked = false;
          });

     // this.$ons.notification
     //   .alert("Un releve est déja présent ici!")
     //   .then(response => {
     //     this.$nextTick(() => {
     //       this.circleClicked = false;
     //     });
     //   });
    },
    onMapClick(evt) {
      console.log(evt);
      if (this.circleClicked) {
        return;
      }
      this.newCircle = {
        center: [evt.latlng.lat, evt.latlng.lng],
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 10
      };
      console.log("clicked on map");
      this.$ons.notification
        .confirm("Voulez vous réaliser un nouveau relevé?")
        .then(response => {
          if (response) {
            let coordinates = [
              this.newCircle.center[0],
              this.newCircle.center[1]
            ];
            this.newCircle = null;

            //this.$store.commit("releve/add", { coordinates:coordinates });
            this.$store.commit("navigator/push", {
              extends: SimplePage,
              data() {
                return {
                  coordinates: coordinates,
                  toolbarInfo: {
                    backLabel: "Home",
                    title: "key"
                  }
                };
              }
            });
          } else {
            this.newCircle = null;
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
