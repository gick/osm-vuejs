<template>
  <v-ons-page v-on:show="mapShow">
    <div>
      <l-map
        ref="map"
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        style="height: 100vh; width: 100vw;"
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
          :lat-lng="getGeoJSONCoordinate(circle.location.coordinates)"
          :radius="6"
          :color="getColor(circle)"
        />
        <l-circle
          @click="circleClick(circle)"
          v-for="(circle,index) in observationsFromOSM"
          custom="10"
          v-bind:key="index+'fromOSM'"
          :lat-lng="getGeoJSONCoordinate(circle.location.coordinates)"
          :radius="6"
          :color="'orange'"
        />
        <l-circle
          @click="identificationClick(circle)"
          className="pulse"
          v-for="(circle,index) in identificationsTodo"
          custom="10"
          v-bind:key="index+'identification'"
          :lat-lng="getGeoJSONCoordinate(circle.location.coordinates)"
          :radius="6"
          color="blue"
        />
        <l-circle
          @click="identificationClick(circle)"
          v-for="(circle,index) in identificationsDone"
          custom="10"
          v-bind:key="index+'identificationDone'"
          :lat-lng="getGeoJSONCoordinate(circle.location.coordinates)"
          :radius="6"
          color="blue"
        />
        <l-circle
          @click="circleClick(circle)"
          class
          v-for="(circle,index) in observationsOther"
          custom="10"
          v-bind:key="index+'observationOther'"
          :lat-lng="getGeoJSONCoordinate(circle.location.coordinates)"
          :radius="6"
          color="lime"
        />

        <l-circle
          @click="circleClick(circle)"
          className="pulse"
          v-for="(circle,index) in observationsOtherTodo"
          custom="10"
          v-bind:key="index+'observationOtherTodo'"
          :lat-lng="getGeoJSONCoordinate(circle.location.coordinates)"
          :radius="6"
          color="lime"
        />

        <l-circle
          @click="circleClick(circle)"
          v-for="(circle,index) in observationsOtherDone"
          custom="10"
          v-bind:key="index+'observationOtherDone'"
          :lat-lng="getGeoJSONCoordinate(circle.location.coordinates)"
          :radius="6"
          color="lime"
        />

        <l-marker :lat-lng.sync="position"></l-marker>

        <l-circle
          v-for="(circle,index) in osmData"
          custom="10"
          @click="osmClick(index)"
          v-bind:key="'OSM'+index"
          :lat-lng="getGeoJSONCoordinate(circle.geometry.coordinates)"
          :radius="6"
          :color="'yellow'"
        />

        <l-circle
          v-for="(circle,index) in tempMarker"
          custom="10"
          @click="tempMarkerClick()"
          className="waitingCreation"
          v-bind:key="'OSMTemp'+index"
          :lat-lng="getGeoJSONCoordinate(circle.location.coordinates)"
          :radius="6"
          :color="'yellow'"
        />

        <l-tile-layer :url="url" :options="mapOptions" :attribution="attribution"/>
      </l-map>

      <v-ons-card>
        <v-ons-button @click="centerMap">Centrer carte</v-ons-button>
      </v-ons-card>

      <v-ons-alert-dialog modifier="rowfooter" :visible.sync="missionOver">
        <span slot="title">{{ $t('missionOverTitle') }}</span>
        {{ $t('missionOverDesc') }}
        <template slot="footer">
          <v-ons-alert-dialog-button @click="closeDialog">OK</v-ons-alert-dialog-button>
        </template>
      </v-ons-alert-dialog>

      <v-ons-alert-dialog modifier="rowfooter" :visible.sync="activityOver">
        <span slot="title">{{ $t('activityOverTitle') }}</span>
        {{ $t('activityOverDesc') }}
        <template slot="footer">
          <v-ons-alert-dialog-button @click="closeDialog">OK</v-ons-alert-dialog-button>
        </template>
      </v-ons-alert-dialog>
    </div>
    <v-ons-fab @click="centerMap" modifier="mini" position="bottom right">
      <v-ons-icon icon="md-pin"></v-ons-icon>
    </v-ons-fab>

    <ons-bottom-toolbar style="background-color:#F44336; color:white">
      <center v-show="userID && !missionDone">
        {{instruction}}
        <v-ons-row>
          <v-ons-col v-if="timeLeft!=-1">
            <v-ons-icon icon="fa-clock"></v-ons-icon>
            {{ timeLeft | duration('asSeconds') | moment("mm:ss") }}
          </v-ons-col>
          <v-ons-col>
            <div v-if="goal>0">{{completion}}/{{goal}}</div>
            <div v-else>{{completion}}</div>
          </v-ons-col>
        </v-ons-row>
      </center>
    </ons-bottom-toolbar>
  </v-ons-page>
</template>
<style>
.waitingCreation {
  animation: wait 1s ease-out;
  -webkit-animation: wait 1s ease-out;
  -webkit-animation-iteration-count: infinite;
  fill-opacity: 1;
}

@keyframes wait {
  0% {
    stroke-width: 5;
  }
  50% {
    stroke-width: 0;
  }
  100% {
    stroke-width: 5;
  }
}

.lorem-dialog .dialog-container {
  height: 200px;
}
.null {
  display: none;
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
import { EventBus } from '../js/osmBus';

//Utility function extracting all contributors id
// including from prev

//TODO Mettre bouton flottant sur la carte pour le centrage
// carte à 100% height
let extractContributor = function(releve) {
  let extractValidator = item => item.validation.map(val => val.id);
  let extractModifier = item => item.modifierId;
  let author = releve.osmId;
  let notree = releve.noTree.map(val => val.osmId);
  let extractAll = function(acc, current) {
    return acc
      .concat(extractValidator(current))
      .concat(extractModifier(current));
  };
  let currentContributors = [releve].reduce(extractAll, notree.concat(author));
  let allContributors = releve.prev.reduce(extractAll, currentContributors);
  return [...new Set(allContributors)].filter(val => val);
};
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
    instruction() {
      if (this.currentMission) {
        return this.currentMission.activities[this.indexActivite].instruction
          .short;
      }
    },
    missionDone() {
      if (this.$store.state.user.activite) {
        return false;
      }
      return true;
    },
    userID() {
      return this.$store.state.user.id;
    },
    identification() {
      return this.$store.state.commonData.identification;
    },
    verification() {
      return this.$store.state.commonData.verification;
    },
    observations() {
      return this.$store.state.releve.releves
        .filter(value => !value.identificationValue.identification)
        .filter(value => value.osmId == this.userID)
        .filter(value => value.source != "OSM");
    },
    observationsFromOSM() {
      return this.$store.state.releve.releves
        .filter(value => !value.identificationValue.identification)
        .filter(value => value.osmId == this.userID)
        .filter(value => value.source == "OSM");
    },
    identifications() {
      return this.$store.state.releve.releves.filter(
        value => value.identificationValue.identification
      );
    },
    identificationsTodo() {
      if (this.identification)
        return this.identifications.filter(
          value => !value.identificationValue.success
        );
      return [];
    },
    identificationsDone() {
      if (this.identification)
        return this.identifications.filter(
          value => value.identificationValue.success
        );
      return [];
    },
    observationsOther() {
      if (!this.verification)
        return this.$store.state.releve.releves
          .filter(value => !value.identificationValue.identification)
          .filter(value => value.osmId != this.userID);
      return [];
    },
    observationsOtherTodo() {
      if (this.verification)
        return this.$store.state.releve.releves
          .filter(value => !value.identificationValue.identification)
          .filter(value => value.osmId != this.userID)
          .filter(value => !extractContributor(value).includes(this.userID));
      return [];
    },
    tempMarker() {
      return this.$store.state.osmData.tempMarker;
    },
    observationsOtherDone() {
      if (this.verification)
        return this.$store.state.releve.releves
          .filter(value => !value.identificationValue.identification)
          .filter(value => value.osmId != this.userID)
          .filter(value => extractContributor(value).includes(this.userID));
      return [];
    },
    tempSuppressed() {
      return this.$store.state.osmData.tempSuppressed;
    },
    osmData() {
      let importedObs = this.observationsFromOSM.map(val => val.nodeId);
      return this.$store.state.osmData.data
        .filter(val => !importedObs.includes(val.id.replace('node/','')))
    },
    currentMission() {
      return this.$store.state.user.mission;
    },
    indexActivite() {
      return this.$store.state.user.indexActivite;
    },
    nbActivite() {
      return this.$store.state.user.mission.activities.length;
    },
    completion() {
      return this.$store.state.user.completion;
    },
    goal() {
      return this.$store.state.user.goal;
    },
    timeLeft() {
      return this.$store.state.user.time.duration;
    }
  },

  watch: {
    completion: {
      handler: function(newValue, oldValue) {
        if (newValue == this.goal) {
          if (this.indexActivite + 1 != this.nbActivite) {
            this.activityOver = true;
          }
        }
      },
      deep: true
    },
    missionDone: {
      handler: function(newValue, oldValue) {
        if (newValue == true && oldValue == false) {
          this.missionOver = true;
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
    EventBus.$on('updateOSM',()=>{ 
      this.$store.dispatch("osmData/getOSMData", {
          boundary: this.map.getBounds()
        });})
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
    getGeoJSONCoordinate(coordinates) {
      return { lat: coordinates[1], lng: coordinates[0] };
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
      newReleve.specie = releve.properties.species;
      newReleve.genus = releve.properties.genus;
      newReleve.common = releve.properties["name:fr"];
      newReleve.source = "OSM";
      newReleve.coordinates = [releve.lon, releve.lat];
      newReleve.nodeId = releve.properties.id.replace('node/','');
      newReleve.changeset = releve.properties.changeset;
      newReleve.version = releve.properties.version;
      newReleve.coordinates = releve.geometry.coordinates;
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
    identificationClick(releve) {
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
    validateObservation(releve) {
      this.circleClicked = true;
      this.$store.commit("navigator/push", {
        extends: SimplePage,
        data() {
          return {
            releve: releve,
            validation: true
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
      this.$ons.notification.confirm(this.$t("confirmDesc")).then(response => {
        if (response) {
          let coordinates = [
            this.newCircle.center[1],
            this.newCircle.center[0]
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
