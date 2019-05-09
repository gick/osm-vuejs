<template>
  <v-ons-page>  

   <v-ons-alert-dialog modifier="rowfooter"
      :title="'Êtes-vous sûr de vouloir passer cette activité ?'"
      :footer="{
        Annuler: () => showDialog = false,
        Passer() {activityEnd('skipped'); showDialog = false }
      }"
      :visible.sync="showDialog"
    >
      Cette action est irréversible
    </v-ons-alert-dialog> 

   <!--  <v-ons-dialog :visible.sync="showDialog">
      
      <v-ons-button @click="showDialog = false">Annuler</v-ons-button>
      <v-ons-button @click="activityEnd('skipped'); showDialog = false">Passer la mission</v-ons-button>
    </v-ons-dialog> -->

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
        Mission en cours ( {{ indexActivite + 1}} / {{activites.length}} )
      </div>          
    </v-ons-card>

    <v-card v-show="$store.state.user.id">
        <div v-for="item in activites">
          <v-ons-card class=opaque v-show="(item.statut=='skipped')">
            ❌ {{item.intitule}}
          </v-ons-card>
          <v-ons-card v-show="(item.statut=='onGoing')">
            <v-ons-row>
              <v-ons-col>
                {{item.intitule}}  
                <br>
                <VmProgress v-if="goal>0" :percentage=progression stroke-width="10">
                  {{completion}} / {{goal}}
                </VmProgress>
                <VmProgress v-else :percentage=progression stroke-width="10">
                  {{completion}}
                </VmProgress>
              </v-ons-col>  
              <v-ons-col width="10%">
               <v-ons-icon icon="fa-angle-double-right" @click="showDialog = true" size="30px"></v-ons-icon> 
             </v-ons-col>
            </v-ons-row>   
            <countdown  v-if="totalSecondes!=0" :totalSecondes=totalSecondes @timeout="activityEnd('done')"></countdown>       
          </v-ons-card>
          <v-ons-card class=opaque v-show="(item.statut=='done')">
            ✓ {{item.intitule}}
          </v-ons-card>
          <v-ons-card class=opaque v-show="(item.statut=='toDo')">
            {{item.intitule}}
          </v-ons-card>
        </div>
    </v-card>





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
      activites: [],
      showDialog: false,
      totalSecondes : 0
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
    chgtActivity() {
      return this.$store.state.releve.chgtActivity
    },
    indexActivite() {
       return this.$store.state.releve.indexActivite
    },
    trophies() {
      return this.$store.state.releve.trophies
    },
    progression() {
      return  this.goal > 0 ? (this.completion / this.goal * 100) : 0
    }
  },
  watch : {
     'chgtActivity': {
        handler: function(){
          this.activityEnd('done')
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
    activityEnd(statut) {
      this.$store.commit('commonData/setVerificationMode', false)
      this.$store.commit('commonData/setIdentificationMode', false)
      this.activites[this.indexActivite].statut = statut
      if (statut == 'done') {
        for (let i = 0; i < this.currentActivity.mecaniques.length; i++) {
          //attribution des points
          if (this.currentActivity.mecaniques[i].nom == 'score') {
            var line = new Object()
            line.nbPoint = this.currentActivity.mecaniques[i].nbPoint
            line.action = "ACTIVITE_REUSSIE"
            this.$store.commit('releve/addPoints', line.nbPoint)
            this.$store.commit('releve/updateJournal', line)
          //attribution des trophées
          } else if (this.currentActivity.mecaniques[i].nom == 'trophee') {  
            let nom = this.currentActivity.mecaniques[i].titre
            if (!this.tropheeDejaGagne(nom)) {     
              this.$store.commit('releve/winTrophy', nom)
              let toast = this.$toasted.show("Nouveau trophée '" + nom + "'", { 
                fullWidth : true,
                position: "bottom-center", 
                duration : 5000,
                icon : "trophy"
              });
            }
          }
        }
      }
      if (this.indexActivite + 1 ==  this.currentMission.activites.length) {
          for (let i = 0; i < this.currentMission.mecaniques.length; i++) {
          //attribution des trophées
          if (this.currentMission.mecaniques[i].nom == 'trophee') {
            var nbActivitesReussies = 0
            for (let j = 0 ; j < this.activites.length ; j++) {
              if (this.activites[j].statut == 'done') {
                nbActivitesReussies++
              }
            }
            for (let j = 0 ; j < this.currentMission.mecaniques[i].listeDeTrophees.length; j++) {
              if (nbActivitesReussies >= this.currentMission.mecaniques[i].listeDeTrophees[j].condition.nbMissionReussie) {
                let nom = this.currentMission.mecaniques[i].listeDeTrophees[j].titre
                if (!this.tropheeDejaGagne(nom)) {
                  this.$store.commit('releve/winTrophy', nom)
                  let toast = this.$toasted.show("Nouveau trophée '" + nom + "'", { 
                  fullWidth : true,
                  position: "bottom-center", 
                  duration : 5000,
                  icon : "trophy"
                });
                }
                
              }
            } 
          }
        }
        this.newMission()
      } else {
        this.newActivity()
      }
    },
    newMission() {
      //recuperation d'une mission aleatoire dans le JSON
      let random = Math.floor(Math.random() * missions.missions.length);  
      this.$store.commit('releve/setMission', missions.missions[random])
      this.$store.commit('releve/setIndexActivite', -1)
      this.activites = []

      for (let i = 0; i < this.currentMission.activites.length; i++) {
        
        var action;
        switch (this.currentMission.activites[i].typeActivite.action) {
          case 'LOCALISER' : 
            action = 'Localisez'
            break;
          case 'IDENTIFIER' : 
            action = 'Identifiez'
            break;
          case 'VERIFIER' :
            action = 'Modifiez ou validez'
            break;
          case 'PHOTOGRAPHIER' :
            action = 'Prenez une photo de'
            break;
        }
        var objet;
        switch (this.currentMission.activites[i].typeActivite.objet) {
          case 'ESPECE' :
            objet = " de l'espece " + this.currentMission.activites[i].espece
            break;
          case 'GENRE' :
            objet = ' du genre ' + this.currentMission.activites[i].genre
            break;
          case 'ESPECESDIFFERENTES' :
            objet = " d'espèces différentes"
            break;
          case 'GENRESDIFFERENTS' :
            objet = ' de genres différents'
            break;
          default : 
            objet = ''
        }

        var gameMode;
        switch (this.currentMission.activites[i].gameMode) {
          case 'classic' :
            gameMode = ''
            break;
          case 'identification' :
            gameMode = " à partir d'un relevé d'expert (cercle bleu clignotant)"
            break;
          case 'verification' :
            gameMode = " d'un autre utilisateur (cercle vert clignotant)"
            break;
        }

        var tempsLimite = ""

        for (let j = 0; j < this.currentMission.activites[i].mecaniques.length; j++) {
          if (this.currentMission.activites[i].mecaniques[j].nom == 'trophee') {
            var trophee = new Object()
            trophee.path = this.currentMission.activites[i].mecaniques[j].image
            trophee.nom = this.currentMission.activites[i].mecaniques[j].titre
            trophee.obtenu = false
            this.$store.commit('releve/addTrophie', trophee)
          } else if(this.currentMission.activites[i].mecaniques[j].nom == 'chronometreDescendant') {
            tempsLimite = " en un temps limite"
          }
        }

        var nbAction = this.currentMission.activites[i].conditionDeFin[0].nbArbre
        this.$store.commit('releve/setGoal', nbAction)

        var arbre = (action == 'Modifiez ou validez') ? " relevé" : " arbre"

        if (nbAction) {
          arbre = nbAction > 1 ? arbre + "s" : arbre
          this.activites.push(new Activite(action + " " + nbAction + arbre + objet + gameMode + tempsLimite,"toDo"));
        } else {
          this.activites.push(new Activite(action + " un maximum d'arbre"+ objet + gameMode + tempsLimite,"toDo"));
        }
        
      }

      for (let i = 0; i < this.currentMission.mecaniques.length; i++) {
        if (this.currentMission.mecaniques[i].nom == 'score') {
          for (let j = 0; j < this.currentMission.mecaniques[i].actions.length; j++) {
            var param = new Object()
            param.action = this.currentMission.mecaniques[i].actions[j].code
            param.nbPoint = this.currentMission.mecaniques[i].actions[j].nbPoint
            this.$store.commit('releve/addActionTransActivite', param)
          }
        } else if (this.currentMission.mecaniques[i].nom == 'trophee') {
            for (let j = 0 ; j < this.currentMission.mecaniques[i].listeDeTrophees.length; j++) {
                var trophee = new Object()
                trophee.path = this.currentMission.mecaniques[i].listeDeTrophees[j].image
                trophee.nom = this.currentMission.mecaniques[i].listeDeTrophees[j].titre
                trophee.obtenu = false
                this.$store.commit('releve/addTrophie', trophee)
            } 
          }
      }

      this.newActivity()
    },

    newActivity() {
      this.$store.commit('releve/setCompletion', 0)
      this.$store.commit('releve/clearSets')
      this.$store.commit('releve/setIndexActivite', this.indexActivite + 1)
      this.$store.commit('releve/setActivite', this.currentMission.activites[this.indexActivite])

      var totalSecondes = 0
      var nbAction = -1
      
      for (let i = 0 ; i < this.currentMission.activites[this.indexActivite].conditionDeFin.length; i++) {
        if (this.currentMission.activites[this.indexActivite].conditionDeFin[i].tempsLimite) {
          totalSecondes = this.currentMission.activites[this.indexActivite].conditionDeFin[i].tempsLimite
        } else if (this.currentMission.activites[this.indexActivite].conditionDeFin[i].nbArbre){
          nbAction = this.currentMission.activites[this.indexActivite].conditionDeFin[i].nbArbre
        }
      }

      if (this.currentMission.activites[this.indexActivite].gameMode == 'verification') {
        this.$store.commit('commonData/setVerificationMode', true)
      } else if (this.currentMission.activites[this.indexActivite].gameMode == 'identification') {
        this.$store.commit('commonData/setIdentificationMode', true)
      }

      this.$store.commit('releve/setGoal', nbAction)
      this.totalSecondes = totalSecondes
      this.activites[this.indexActivite].statut = 'onGoing'
    },
    tropheeDejaGagne(trophyName) {
      var res = false
      for (let i = 0 ; i < this.trophies.length; i++) {
        if (this.trophies[i].nom == trophyName && this.trophies[i].obtenu == true) {
          res = true
        } 
      }
      return res
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

.opaque {
  filter : opacity(30%);
}

</style>
