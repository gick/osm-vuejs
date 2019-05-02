<template>
  <v-ons-page v-on:show="mapShow">
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
          @click="circleClick(circle)"
          v-for="(circle,index) in observations"
          custom="10"
          v-bind:key="index+osmCircles.length"
          :lat-lng="circle.coordinates"
          :radius="6"
          :color="getColor(circle)"
        />
        <l-circle
          @click="identificationClick(circle)"
          className="pulse"
          v-for="(circle,index) in identificationsTodo"
          custom="10"
          v-bind:key="index+'identification'"
          :lat-lng="circle.coordinates"
          :radius="6"
          color="blue"
        />
        <l-circle
          @click="identificationClick(circle)"
          v-for="(circle,index) in identificationsDone"
          custom="10"
          v-bind:key="index+'identificationDone'"
          :lat-lng="circle.coordinates"
          :radius="6"
          color="blue"
        />
        <l-circle
          @click="validateObservation(circle)"
          className="pulse"
          v-for="(circle,index) in observationsOther"
          custom="10"
          v-bind:key="index+'observationOther'"
          :lat-lng="circle.coordinates"
          :radius="6"
          color="lime"
        />
        <l-circle
          @click="circleClick(circle)"
          v-for="(circle,index) in observationsOtherDone"
          custom="10"
          v-bind:key="index+'observationOtherDone'"
          :lat-lng="circle.coordinates"
          :radius="6"
          color="lime"
        />

        <l-marker :lat-lng.sync="position"></l-marker>

        <l-circle
          v-for="(circle,index) in osmData"
          custom="10"
          @click="osmClick(index)"
          v-bind:key="'OSM'+index"
          :lat-lng="getCoordinate(circle)"
          :radius="6"
          :color="'yellow'"
        />

        <l-tile-layer :url="url" :options="mapOptions" :attribution="attribution"/>
      </l-map>
      <v-ons-card>
        <v-ons-button @click="centerMap">Centrer carte</v-ons-button>
      </v-ons-card>
      <v-ons-dialog class="lorem-dialog" :visible.sync="missionOver">
        <!-- Optional page. This could contain a Navigator as well. -->
        <v-ons-page>
          <v-ons-toolbar>
            <div class="center">Mission terminée</div>
          </v-ons-toolbar>
          <p style="text-align: center">Vous avez terminé votre mission, place à la mission suivante</p>
          <p style="text-align: center">
            <v-ons-button modifier="light" @click="closeDialog">OK</v-ons-button>
          </p>
        </v-ons-page>
      </v-ons-dialog>

      <v-ons-dialog class="lorem-dialog" :visible.sync="activityOver">
        <!-- Optional page. This could contain a Navigator as well. -->
        <v-ons-page>
          <v-ons-toolbar>
            <div class="center">Activité terminée</div>
          </v-ons-toolbar>
          <p
            style="text-align: center"
          >Vous avez terminé votre activité, place à l'activité suivante</p>
          <p style="text-align: center">
            <v-ons-button modifier="light" @click="closeDialog">OK</v-ons-button>
          </p>
        </v-ons-page>
      </v-ons-dialog>
    </div>
  </v-ons-page>
</template>
<style>
.lorem-dialog .dialog-container {
  height: 200px;
}
.null{
  display:none;
}
.pulse {
  animation: pulsate 1s ease-out;
  -webkit-animation: pulsate 1s ease-out;
  -webkit-animation-iteration-count: infinite;
}

@keyframes pulsate {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>

<script>
import {
  LMap,
  LTileLayer,
  LCircleMarker,
  LCircle,
  LMarker,
  LPopup,
  Vue2Leaflet,
  LTooltip
} from "vue2-leaflet";
import SimplePage from "./SimplePage.vue";
import Releve from "./Releve.vue";
import ReleveOSM from "./ReleveOSM.vue";
import ReleveIdentification from "./ReleveIdentification.vue";

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
      missionOver: false,
      activityOver: false,
      newCircle: null,
      osmCircles: [],
      map: null,
      circleClicked: false,
      zoom: 19,
      center: L.latLng(48.08497, -0.75763),
      url: "//proxy-ign.openstreetmap.fr/94GjiyqD/bdortho/{z}/{x}/{y}.jpg",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      withPopup: L.latLng(47.41322, -1.219482),
      withTooltip: L.latLng(47.41422, -1.250482),
      currentZoom: 16,
      position: L.latLng(47.41322, -1.219482),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
        minZoom: 15,
        maxZoom: 19
      },
      positionID: 0
    };
  },
  computed: {
    userID() {
      return this.$store.state.user.id;
    },
    observations() {
      return this.$store.state.releve.releves
      .filter(value=>!value.identificationValue.identification)
      .filter(value=>value.osmId==this.userID)
    },
    identifications(){
      return this.$store.state.releve.releves.filter(value=>value.identificationValue.identification);
    },
    identificationsTodo(){
      return this.identifications.filter(value=>!value.identificationValue.success);
    },
    identificationsDone(){
      return this.identifications.filter(value=>value.identificationValue.success);
    },
    observationsOther(){
      return this.$store.state.releve.releves
      .filter(value=>!value.identificationValue.identification)
      .filter(value=>value.osmId!=this.userID)
      .filter(value=>!value.contributor.includes(this.userId))
    },
    observationsOtherDone(){
      return this.$store.state.releve.releves
      .filter(value=>!value.identificationValue.identification)
      .filter(value=>value.osmId!=this.userId)
      .filter(value=>value.contributor.includes(this.userId))
    },

    osmData() {
      return this.$store.state.osmData.data;
    },
    currentMission() {
      return this.$store.state.releve.mission;
    },
    chgtActivity() {
      return this.$store.state.releve.chgtActivity;
    },
    indexActivite() {
      return this.$store.state.releve.indexActivite;
    },
    nbActivite() {
      return this.$store.state.releve.mission.activites.length;
    }
  },

  watch: {
    chgtActivity: {
      handler: function(newMision, oldMission) {
        if (this.indexActivite + 1 == this.nbActivite) {
          this.missionOver = true;
        } else {
          this.activityOver = true;
        }
      },
      deep: true
    }
  },
  created() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject; // work as expected
      this.map.locate({ setView: true, maxZoom: 19, zoom: 19 });
      axios.get("/trees").then(
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
  mounted() {
    this.$root.$on("changeCenter", coordinates => {
      this.map.flyTo(coordinates);
    });
    let options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };
    this.positionID = navigator.geolocation.watchPosition(
      this.locationFound,
      this.locationError,
      options
    );
  },
  methods: {
    getColor(releve) {
      if (releve.identification) {
        return "blue";
      }
      return this.userID === releve.osmId ? "red" : "lime";
    },
    centerMap() {
      this.map.flyTo(this.position);
    },
    mapShow() {
      this.map.invalidateSize();
    },
    getCoordinate(circle) {
      return { lat: circle.lat, lng: circle.lon };
    },
    closeDialog() {
      this.missionOver = false;
      this.activityOver = false;
      this.$store.commit("tabbar/set", 1);
    },
    locationerror() {},
    locationError(e) {
      console.log(e);
      navigator.geolocation.clearWatch(this.positionID);
      let options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      this.positionID = navigator.geolocation.watchPosition(
        this.locationFound,
        this.locationError,
        options
      );
    },
    locationfound(e) {},
    locationFound(e) {
      console.log(e);
      this.position = [e.coords.latitude, e.coords.longitude];
      /* L.marker(e.latlng).addTo(this.map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(this.map);*/
    },
    osmClick(index) {
      let releve = this.osmData[index];
      this.circleClicked = true;

      console.log(releve);
      let newReleve = {};
      newReleve.specie = releve.tags.species;
      this.$store.commit("navigator/push", {
        extends: ReleveOSM,
        data() {
          return {
            releve: newReleve
          };
        }
      });
      this.$nextTick(() => {
        this.circleClicked = false;
      });
    },
    circleClick(releve) {
      this.circleClicked = true;
        this.$store.commit("navigator/push", {
          extends: Releve,
          data() {
            return {
              id: releve._id
            };
          }
        });
      
      this.$nextTick(() => {
        this.circleClicked = false;
      });
    },
    identificationClick(releve){
        this.circleClicked = true;
        this.$store.commit("navigator/push", {
          extends: ReleveIdentification,
          data() {
            return {
              releve: releve
            };
          }
        });
      
      this.$nextTick(() => {
        this.circleClicked = false;
      });
    },
    validateObservation(releve){
        this.circleClicked = true;
        this.$store.commit("navigator/push", {
          extends: SimplePage,
          data() {
            return {
              releve: releve,
              validation:true
            };
          }
        });
      
      this.$nextTick(() => {
        this.circleClicked = false;
      });

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
      this.$store.dispatch("osmData/getOSMData", {
        boundary: this.map.getBounds()
      });
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
