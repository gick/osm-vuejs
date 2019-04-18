<template>
  <v-ons-page> 
    <v-ons-fab style="background-color:red" @click="logout" v-show="$store.state.user.id" position="bottom right">
      <v-ons-icon icon="ion-close"></v-ons-icon>
    </v-ons-fab>

      <br>
      <br>
    </p>
      <v-ons-card v-show="!$store.state.user.id">
      <div  class="title">Authentifiez vous!</div>
      <div class="content">
        <p>Bienvenue dans AlbiziApp</p>
        <p>Merci de vous authentifier. </p>
        <v-ons-button @click="authenticate">Authenticate</v-ons-button>
      </div>
    </v-ons-card>

    <v-ons-card v-show="$store.state.user.id">
      <div class="title">
        Mission en cours
        <v-ons-button @click="afficherDetails"> Détails </v-ons-button>
      </div>
      <div v-if="details" v-for="item in activites">
        <li v-show="(item.statut=='skipped')"><strike>{{item.intitule}}</strike></li>
        <li v-show="(item.statut=='onGoing')"><B>{{item.intitule}}</B></li>
        <li v-show="(item.statut=='done')">✓ {{item.intitule}}</li>
        <li v-show="(item.statut=='toDo')">{{item.intitule}}</li>
      </div>
      <div id="consigneMission" class="content">

      </div> 
       <v-ons-button @click="activitySkipped"> Passer l'activité </v-ons-button> 
      <p>Progression : {{completion}} / {{goal}}</p>
      <progress :value="calculProgression" max="100"></progress>
    </v-ons-card>
    <!--  <v-ons-button @click="logout">Logout</v-ons-button>
      <p v-show='username'>Bonjour user {{username}}</p>

    <v-ons-card v-for="page of pages" :key="page.label" @click="push(page.component, page.label)">
      <div class="title">{{ page.label }}</div>
      <div class="content">{{ page.desc }}</div>
    </v-ons-card> !-->
  </v-ons-page>
</template>

<script>
import PullHook from "./PullHook.vue";
import Dialogs from "./Dialogs.vue";
import Buttons from "./Buttons.vue";
import Carousel from "./Carousel.vue";
import InfiniteScroll from "./InfiniteScroll.vue";
import Progress from "./Progress.vue";
import SimplePage from "./SimplePage.vue";
import missions from "../missions.json";

function Activite(intitule, statut) {
    this.intitule = intitule;
    this.statut = statut;
}

export default {
  data() {
    return {
      username:'',
      activites: [],
      details : false,
      pages: [
        {
          component: SimplePage,
          label: "Simple Page",
          desc: "Just to test adding a simple page."
        },
        {
          component: PullHook,
          label: "Pull Hook",
          desc: 'Simple "pull to refresh" functionality to update data.'
        },
        {
          component: Dialogs,
          label: "Dialogs",
          desc:
            "Components and utility methods to display many types of dialogs."
        },
        {
          component: Buttons,
          label: "Buttons",
          desc:
            "Different styles for buttons, floating action buttons and speed dials."
        },
        {
          component: Carousel,
          label: "Carousel",
          desc: "Customizable carousel that can be optionally fullscreen."
        },
        {
          component: InfiniteScroll,
          label: "Infinite Scroll",
          desc: 'Two types of infinite lists: "Load More" and "Lazy Repeat".'
        },
        {
          component: Progress,
          label: "Progress",
          desc: "Linear progress, circular progress and spinners."
        }
      ]
    };
  },
  mounted() {
    this.newMission();
  },
  computed: {
    completion() {
      return this.$store.state.releve.completion;
    },
    goal() {
      return this.$store.state.releve.goal;
    },
    currentMission() {
      return this.$store.state.releve.mission;
    },
    currentActivity() {
      return this.$store.state.releve.activite;
    },
    activiteEnCours() {
      return this.$store.state.releve.activiteEnCours
    },
    indexActivite() {
       return this.$store.state.releve.indexActivite
    },
    calculProgression() {
      if (this.goal == 0)
        return 0
      else
        return (this.completion / this.goal) * 100      
    }
  },
  watch : {
     'activiteEnCours': {
        handler: function(){
          this.activites[this.indexActivite].statut = 'done'
          if (this.indexActivite + 1 ==  this.currentMission.activites.length) {
           this.newMission()
          } else {
            this.newActivity()
          }
        },
        deep : true
      }
  },
  methods: {
    authenticate(){
     this.$store.dispatch('user/login')
    },
    logout(){
        this.$store.dispatch('user/logout')
    },
    push(page, key) {
      this.$store.commit("navigator/push", {
        extends: page,
        data() {
          return {
            toolbarInfo: {
              backLabel: "Home",
              title: key
            }
          };
        }
      });
    },
    activitySkipped() {
      this.activites[this.indexActivite].statut = 'skipped'
      if (this.indexActivite + 1 ==  this.currentMission.activites.length) {
        this.newMission()
      } else {
        this.newActivity()
      }
    },
    newMission() {
      //recuperation d'une mission aleatoire dans le JSON
      let random = Math.floor(Math.random() * missions.missions.length);  
      this.$store.commit('releve/setMission', missions.missions[random])
     // this.$store.state.releve.mission = missions.missions[random];
      this.$store.commit('releve/setIndexActivite', -1)
     // this.$store.state.releve.indexActivite = -1 
      this.activites = []

      for (let i = 0; i < this.currentMission.activites.length; i++) {
        
        var typeActivite;
        switch (this.currentMission.activites[i].typeActivite.split('')[0]) {
          case 'A' : 
            typeActivite = 'identifier'
            break;
          case 'B' :
            typeActivite = 'verifier'
            break;
          case 'C' :
            typeActivite = 'photographier'
            break;
        }
        var sousCategorieActivite;
        switch (this.currentMission.activites[i].typeActivite.split('')[1]) {
          case '2' :
            sousCategorieActivite = " de l'espece " + this.currentMission.activites[i].espece
            break;
          case '3' :
            sousCategorieActivite = ' du genre ' + this.currentMission.activites[i].genre
            break;
          case '4' :
            sousCategorieActivite = " d'especes differentes"
            break;
          case '5' :
            sousCategorieActivite = ' de genres differents'
            break;
          default : 
            sousCategorieActivite = ''
        }

        var nbAction = this.currentMission.activites[i].conditionDeFin[0].nbArbre
        this.$store.commit('releve/setGoal', nbAction)
       // this.$store.state.releve.goal = nbAction
        var arbre = nbAction > 1 ? " arbres" : " arbre"
        this.activites.push(new Activite("Vous devez " + typeActivite + " " + nbAction + arbre + sousCategorieActivite,"toDo"));
      }
      this.newActivity()
    },

    afficherDetails() {
      this.details = !this.details
    },

    newActivity() {
      this.$store.commit('releve/setCompletion', 0)
     //  this.$store.state.releve.completion = 0
     this.$store.commit('releve/clearSets')
      /* this.$store.state.releve.differentSpecieAdded.length = 0
       this.$store.state.releve.differentGenderAdded.length = 0
       this.$store.state.releve.differentSpeciePhotographed.length = 0
       this.$store.state.releve.differentGenderPhotographed.length = 0
       this.$store.state.releve.differentSpecieChecked.length = 0
       this.$store.state.releve.differentGenderChecked.length = 0*/
       this.$store.commit('releve/setIndexActivite', this.indexActivite + 1)
       //this.$store.state.releve.indexActivite++
       this.$store.commit('releve/setActivite', this.currentMission.activites[this.indexActivite])
       //this.$store.state.releve.activite = this.currentMission.activites[this.indexActivite]

      //recuperation du type d'activite
      var typeActivite;
      switch (this.currentMission.activites[this.indexActivite].typeActivite.split('')[0]) {
        case 'A' : 
          typeActivite = 'identifier'
          break;
        case 'B' :
          typeActivite = 'verifier'
          break;
        case 'C' :
          typeActivite = 'photographier'
          break;
      }
      var sousCategorieActivite;
      switch (this.currentMission.activites[this.indexActivite].typeActivite.split('')[1]) {
        case '2' :
          sousCategorieActivite = " de l'espece " + this.currentMission.activites[this.indexActivite].espece
          break;
        case '3' :
          sousCategorieActivite = ' du genre ' + this.currentMission.activites[this.indexActivite].genre
          break;
        case '4' :
          sousCategorieActivite = " d'especes differentes"
          break;
        case '5' :
          sousCategorieActivite = ' de genres differents'
          break;
        default : 
          sousCategorieActivite = ''
      }

      var nbAction = this.currentMission.activites[this.indexActivite].conditionDeFin[0].nbArbre
      this.$store.commit('releve/setGoal', nbAction)
      //this.$store.state.releve.goal = nbAction
      var arbre = nbAction > 1 ? " arbres" : " arbre"
      document.getElementById("consigneMission").innerHTML = "<p>Vous devez " + typeActivite + " " + nbAction + arbre + sousCategorieActivite + ".</p>"
      this.activites[this.indexActivite].statut = 'onGoing'
      /*for (let i = 0; i < this.currentMission.mecaniques.length; i++) {
        document.getElementById("consigneMission").innerHTML += "<p>" + this.currentMission.mecaniques[i].nom + "</p>"
      } */
    }
  }
};
</script>

<style>
.intro {
  text-align: left;
  padding: 0 22px;
  margin-top: 20px;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(0, 0, 0, 0.54);
}

ons-card {
  cursor: pointer;
  color: #333;
}

.card__title,
.card--material__title {
  font-size: 20px;
}
</style>
