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
          @click="circleClick($event,index)"
          v-for="(circle,index) in observations"
          custom="10"
          v-bind:key="index+osmCircles.length"
          :lat-lng="circle.coordinates"
          :radius="8"
          :color="'red'"
        />

      <l-marker
        :lat-lng.sync="position">
      </l-marker>

        <l-circle
          v-for="(circle,index) in osmData"
          custom="10"
          @click="osmClick(index)"
          v-bind:key="'OSM'+index"
          :lat-lng="getCoordinate(circle)"
          :radius="8"
          :color="'yellow'"
        />


        <l-tile-layer :url="url" :options="mapOptions" :attribution="attribution"/>
      </l-map>
      <v-ons-dialog class="lorem-dialog" :visible.sync="missionAOver">
        <!-- Optional page. This could contain a Navigator as well. -->
        <v-ons-page>
          <v-ons-toolbar>
            <div class="center">Première mission</div>
          </v-ons-toolbar>
          <p style="text-align: center">Vous avez effectué 10 relevés, place à la mission 2</p>
          <p style="text-align: center">
            <v-ons-button modifier="light" @click="firstMissionEnd">OK</v-ons-button>
          </p>
        </v-ons-page>
      </v-ons-dialog>
      <v-ons-dialog class="lorem-dialog" :visible.sync="missionBOver">
        <!-- Optional page. This could contain a Navigator as well. -->
        <v-ons-page>
          <v-ons-toolbar>
            <div class="center">Seconde mission</div>
          </v-ons-toolbar>
          <p style="text-align: center">Vous avez effectué 3 relevés d'espèces différentes, place à la mission 3</p>
          <p style="text-align: center">
            <v-ons-button modifier="light" @click="secondMissionEnd">OK</v-ons-button>
          </p>
        </v-ons-page>
      </v-ons-dialog>
      <v-ons-dialog class="lorem-dialog" :visible.sync="missionCOver">
        <!-- Optional page. This could contain a Navigator as well. -->
        <v-ons-page>
          <v-ons-toolbar>
            <div class="center">Fin de la cartographie</div>
          </v-ons-toolbar>
          <p style="text-align: center">Vous avez terminé l'exercice, merci!</p>
          <p style="text-align: center">
            <v-ons-button modifier="light" @click="thirdMissionEnd">OK</v-ons-button>
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
</style>

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
import Releve from "./Releve.vue";

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
      missionAOver:false,
      missionBOver:false, 
      missionCOver:false,
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
        minZoom:15,
        maxZoom:19  
      }
    };
  },
  computed: {
    observations() {
      return this.$store.state.releve.releves;
    },
    osmData(){
      return this.$store.state.osmData.data
    },
    currentMission(){
      return this.$store.state.releve.mission
    }
  },

  watch:{
    'currentMission':function(newMission,oldMission){
      console.log(newMission)
      if(newMission=='B'){
      this.missionAOver=true
      }
      if(newMission=='C'){
        this.missionBOver=true
      }
    if(newMission=='D'){
        this.missionCOver=true
      }

    }

  },
  created() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject; // work as expected
      this.map.locate({ setView: true,watch:true, maxZoom: 19,zoom:19 });
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
  mounted(){
    this.$root.$on('changeCenter', coordinates => {
      this.map.flyTo(coordinates)   
      });

  }
  ,

  methods: {
    mapShow(){
            this.map.invalidateSize()
    },
    getCoordinate(circle){
      return {lat:circle.lat,lng:circle.lon}
    },
    firstMissionEnd(){
      this.missionAOver=false
      this.$store.commit('tabbar/set',1)
    },
    thirdMissionEnd(){
      this.missionCOver=false
      this.$store.commit('tabbar/set',1)

    },
    secondMissionEnd(){
      this.missionBOver=false
      this.$store.commit('tabbar/set',1)
    },
    locationerror(e) {
      //alert(e.message);
    },
    locationfound(e) {
    var radius = e.accuracy / 2;
    this.position=e.latlng
   /* L.marker(e.latlng).addTo(this.map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(this.map);*/
    },
    osmClick(index){
      let releve=this.osmData[index]
            this.circleClicked = true;

      console.log(releve)
      let newReleve={}
      newReleve.specie=releve.tags.species
        this.$store.commit("navigator/push", {
        extends: Releve,
        data() {
          return {
            releve: newReleve
          };
        }
      });
      this.$nextTick(() => {
        this.circleClicked = false;
      });

    }
    ,
    circleClick(evt, index) {
      console.log(index);
      var releve = this.observations[index];
      this.circleClicked = true;
      this.$store.commit("navigator/push", {
        extends: Releve,
        data() {
          return {
            releve: releve
          };
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
      this.$store.dispatch('osmData/getOSMData',{boundary:this.map.getBounds()})
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
