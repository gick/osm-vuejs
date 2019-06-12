<template>
  <v-ons-page>  

    <v-ons-card v-show="!$store.state.user.id">
      <div  class="title">{{ $t('authenticate')}}</div>
      <div class="content">
        <p>{{ $t('welcome')}}</p>
        <p>{{ $t('authenticatePlease')}}</p>
        <v-ons-button @click="authenticate">{{ $t('authenticateButton')}}</v-ons-button>
      </div>
    </v-ons-card>

    <v-ons-card v-show="$store.state.user.id && currentActivity">
      <div class="title">
       {{ $t('currentMission')}} ( {{ indexActivite + 1}} / {{activities.length}} )
      </div>          
    </v-ons-card>

    <v-card v-show="$store.state.user.id && currentActivity">
        <div v-for="item in activities">

          <v-ons-card v-if="(item.statut=='onGoing')">
            <v-ons-row>
              <v-ons-col>
                {{item.intitule}}  
                <br>
                <VmProgress v-if="goal>0" :percentage=progression stroke-width="10">
                  {{completion}} / {{goal}}
                </VmProgress>
                <div v-else>
                 {{ $t('tracingsDone')}} : {{completion}}
                </div>
              </v-ons-col>  
              <v-ons-col width="10%">
               <v-ons-icon icon="fa-angle-double-right" @click="showDialog = true" size="30px"></v-ons-icon> 
             </v-ons-col>
            </v-ons-row> 
            <div v-if="timeLeft!=-1">
              <v-ons-icon icon="fa-clock"></v-ons-icon>
              {{ timeLeft | duration('asSeconds') | moment("mm:ss") }}
            </div>
          </v-ons-card>

          <v-ons-card class=opaque v-else>
             {{ displayActivity(item.statut, item.intitule) }}
          </v-ons-card>       
        </div>
    </v-card>

    <v-ons-card v-show="$store.state.user.id && !currentActivity"> 
      <p>Vous avez terminé la mission, merci d'avoir participé !</p>  
    </v-ons-card>

    <v-ons-alert-dialog modifier="rowfooter"
      :visible.sync="showDialog"
    >
      <span slot="title">{{ $t('skipActivityTitle') }}</span>
      {{ $t('skipActivityDesc') }}
      <template slot="footer">
        <v-ons-alert-dialog-button @click="showDialog = false">{{ $t('cancelButton') }}</v-ons-alert-dialog-button>
        <v-ons-alert-dialog-button @click="skipActivityPressed">{{ $t('skipButton') }}</v-ons-alert-dialog-button>
      </template>
    </v-ons-alert-dialog>

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
import { EventBus } from '../js/eventBus.js';

function Activite(intitule, statut) {
    this.intitule = intitule;
    this.statut = statut;
}

export default {
  data() {
    return {
      showDialog: false,
      totalSecondes : 0,
    };
  },
  mounted() {
    EventBus.$on('displayHelpMessage', param => {
      this.displayHelpMessage(param)
    });
  },
  computed: {
    gamificationMode() {
      return this.$store.state.user.gamificationMode;
    },
    completion() {
      return this.$store.state.user.completion;
    },
    uid() {
      return this.$store.state.user.id;
    },
    goal() {
      return this.$store.state.user.goal;
    },
    currentMission() {
      return this.$store.state.user.mission;
    },
    currentActivity() {
      return this.$store.state.user.activite;
    },
    indexActivite() {
       return this.$store.state.user.indexActivite
    },
    trophies() {
      return this.$store.state.user.trophies
    },
    progression() {
      return  this.goal > 0 ? (this.completion / this.goal * 100) : 0
    },
    timeLeft() {
      return this.$store.state.user.time.duration
    },
    backup(){
        return this.$store.state.user.sessionBackup
    }
    ,
    nbSuccessfulActivities() {
      var nbSuccessfulActivities = 0
      if (!this.activities) return 0
      for (let i = 0; i < this.activities.length; i++) {
        if (this.activities[i].statut == 'done') {
          nbSuccessfulActivities++
        }
      }
      return nbSuccessfulActivities
    },
    activities() {
      return this.$store.state.user.activities
    }
  },
  watch : {
    'backup':{
     handler:function(val){ if(val && val.mission){
       // this.$store.commit('user/restoreBackup')
      }}

    },
    'uid':{
      handler(){
        if(this.backup && this.backup.mission){
          this.$store.commit('user/restoreBackup')
          if(this.backup.time && this.backup.time.duration>0){
            this.$store.dispatch('user/setTime',{duration:this.backup.time.duration})
          }
          return
        }
         this.newMission();

      }
    },
     'completion': {
        handler: function(newValue, oldValue){
          if (newValue == this.goal)
            this.activityEnd('done')
        },
        deep : true
      }, 
      'timeLeft': {
        handler: function(newValue, oldValue){
          if (newValue == 0) {
            this.activityEnd('done')
          }
        },
        deep : true
      },
      'nbSuccessfulActivities': {
        handler: function(newValue, oldValue){
          if (this.gamificationMode && this.currentMission) {
            this.updateTrophy(newValue)
          }
        },
        deep : true
      }
  },
  methods: {
    displayHelpMessage(param) {
      let {option, releve} = param
      let message = ""
      if ((option == "DIFFERENTGENUS" || option == "GENUS") && releve.genus == null) {
         message = "Vous devez renseigner le champ 'Genre' d'un relevé pour progresser dans l'activité"
      }
      if ((option == "DIFFERENTSPECIE" || option == "SPECIE") && releve.specie == null) {
         message = "Vous devez renseigner le champ 'Espèce' d'un relevé pour progresser dans l'activité"
      }
      if (option == "DIFFERENTGENUS" && releve.genus) {
         message = "Vous avez déja réalisé une action avec ce genre dans l'activité en cours"
      }
      if (option == "DIFFERENTSPECIE" && releve.specie) {
         message = "Vous avez déja réalisé une action avec cette espèce dans l'activité en cours"
      }

      if (message != "") {
        let toast = this.$toasted.show(message, { 
          fullWidth : true,
          position: "bottom-center", 
          duration : 5000,
          icon : "warning"
        });
      }
     
    },
    skipActivityPressed() {
      this.activityEnd('skipped')
      this.showDialog = false
    },
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
      let points=0
      this.$store.commit('commonData/setVerificationMode', false)
      this.$store.commit('commonData/setIdentificationMode', false)
      this.$store.commit('user/resetTime')
      this.$store.commit('user/setActivityStatus', {
        statut: statut,
        index: this.indexActivite 
      })
      if (statut == 'done' && this.gamificationMode && this.currentActivity.AMechanicList) {
        for (let mechanic of this.currentActivity.AMechanicList) {
          if (Object.keys(mechanic).includes("AScoreList")) {
            for (let score of mechanic.AScoreList) {
               this.$store.commit('user/addPoints', {
                    name: score.name,
                    history: {
                      text: "Activité réussie",
                      points : score.nbPoint
                    }
                  })
            }
          } else if (Object.keys(mechanic).includes("ATrophy")) {  
            let name = mechanic.ATrophy.title
            if (!this.tropheeDejaGagne(name)) {     
              this.$store.commit('user/winTrophy', name)
              let toast = this.$toasted.show(this.$t('newTrophy') + " '" + name + "'", { 
                fullWidth : true,
                position: "bottom-center", 
                duration : 5000,
                icon : "trophy"
              });
            }   
          }
        }
      }

      if (this.indexActivite + 1 ==  this.currentMission.activityList.length) {
         this.$store.commit('user/setActivite', null)
      } else {
        this.newActivity()
      }
    },
     async newMission() {
      let missionResponse=await axios.get('/api/mission') 
      let mission=missionResponse.data
      this.$store.commit('user/setMission', mission)
      this.$store.commit('user/setIndexActivite', -1)
      var activities = []

      for (let activity of this.currentMission.activityList) {

        if (activity.AMechanicList) {
          for (let mechanic of activity.AMechanicList) {
            if (Object.keys(mechanic).includes("ATrophy")) {
              var trophy = new Object()
              trophy.path = mechanic.ATrophy.image
              trophy.name = mechanic.ATrophy.title
              trophy.obtenu = false
              this.$store.commit('user/addTrophy', trophy)
            } 
          }
        }

        var instruction = activity.instruction.long

        var nbAction = 0
        for (let endCondition of activity.endCondition) {
          if (Object.keys(endCondition).includes("nbAction")) {
            nbAction = endCondition.nbAction
          }
        }

        this.$store.commit('user/setGoal', nbAction)

        activities.push(new Activite(instruction,"toDo"));      
      }

      this.$store.commit('user/setActivities', activities)

      if (this.currentMission.MMechanicList) {
        for (let mechanic of this.currentMission.MMechanicList) {
          if (Object.keys(mechanic).includes("MScoreList")) {
            var scores = []
            for (let score of mechanic.MScoreList) {
              scores.push({
                name : score.name,
                rules : score.actions,
                nbPoint: 0,
                icon : score.icon,
                displayName : score.displayName,
                history: [],
                display: false
              })
            }

            if (scores.length) {
              this.$store.commit('user/setScores', scores)
            }
    
          } else if (Object.keys(mechanic).includes("MTrophyList")) {
            for (let trophy of mechanic.MTrophyList) {
              var param = new Object()
              param.path = trophy.image
              param.name = trophy.title
              param.obtenu = false
              this.$store.commit('user/addTrophy', param)
              } 
            }
        }
      }
      this.newActivity()
    },

    newActivity() {
      this.$store.commit('user/setCompletion', 0)
      this.$store.commit('user/clearSets')
      this.$store.commit('user/setIndexActivite', this.indexActivite + 1)
      this.$store.commit('user/setActivite', this.currentMission.activityList[this.indexActivite])

      var totalSecondes = 0
      var nbAction = -1
      
      for (let endCondition of this.currentMission.activityList[this.indexActivite].endCondition) {
        if (endCondition.time) {
          totalSecondes = endCondition.time
        } else if (endCondition.nbAction){
          nbAction = endCondition.nbAction
        }
      }

      var duration = totalSecondes ? totalSecondes * 1000 : -1
      this.$store.dispatch('user/setTime', {
        duration : duration
      })

      switch (this.currentMission.activityList[this.indexActivite].type) {
        case "VERIFY": 
          this.$store.commit('commonData/setVerificationMode', true)
          break
        case "IDENTIFY":
          this.$store.commit('commonData/setIdentificationMode', true)
          break
      }

      this.$store.commit('user/setGoal', nbAction)
      this.totalSecondes = totalSecondes
      this.$store.commit('user/setActivityStatus', {
        statut:'onGoing',
        index: this.indexActivite
      })

      if (totalSecondes) {
         let toast = this.$toasted.show(this.$t('timedActivity'), { 
                fullWidth : true,
                position: "bottom-center", 
                duration : 5000,
                icon : "clock"
          });
      }
    },
    tropheeDejaGagne(trophyName) {
      var res = false
      for (let trophy of this.trophies) {
        if (trophy.name == trophyName && trophy.obtenu == true) {
          res = true
        } 
      }
      return res
    },
    displayActivity(statut, intitule) {
      if (statut == 'skipped') {
        return "❌ " + intitule
      } else if (statut == 'toDo') {
        return intitule
      } else if (statut == 'done') {
        return "✓ " + intitule
      }
    },
    updateTrophy(nbSuccessfulActivities) {
      if (this.currentMission.MMechanicList) {
        for (let mechanic of this.currentMission.MMechanicList) {
          if (Object.keys(mechanic).includes("MTrophyList")) {
            for (let trophy of mechanic.MTrophyList) {
              if (nbSuccessfulActivities == trophy.nbSuccessfulActivities) {
                let name = trophy.title
                if (!this.tropheeDejaGagne(name)) {
                  this.$store.commit('user/winTrophy', name)
                  let toast = this.$toasted.show(this.$t('newTrophy') + " '" + name + "'", { 
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
      }
           
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
