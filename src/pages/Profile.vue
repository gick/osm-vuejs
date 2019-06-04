<template>
	<v-ons-page @show="resetBadge">
		<div v-show="$store.state.user.id">
			 <v-ons-list-header>{{ username }}</v-ons-list-header>
			 	<v-ons-card v-if="status.length>0">
	    	<v-ons-row @click='displayStatusDetails'>
	    		<v-ons-col>
	        	Status actuel : {{ status[status.length -1].name }}
	    		</v-ons-col>
	    		<v-ons-col style="text-align: right" >
	        	<v-ons-icon icon="fa-info-circle" style="color:#cca108"></v-ons-icon> 
	       	</v-ons-col>
	      </v-ons-row>
	    </v-ons-card>

	    <v-ons-card v-for="score in scores">
	    	<v-ons-row @click='displayScoreDetails(score.name)'>
	    		<v-ons-col>
	        	{{score.displayName}} : {{ score.nbPoint}}
	    		</v-ons-col>
	    		<v-ons-col style="text-align: right" >
	        	<v-ons-icon icon="fa-info-circle" style="color:#cca108"></v-ons-icon> 
	       	</v-ons-col>
	      </v-ons-row>
	    </v-ons-card>

			<v-ons-card>
	      		<v-ons-row @click='displayTrophiesDetails'>
	        		<v-ons-col>
	        				{{tropheesObtenus}}/{{trophies.length}}
	        				<v-ons-icon icon="fa-trophy" style="opacity:0.9; color:#f4c242"></v-ons-icon>	
	        		</v-ons-col> 
	        		<v-ons-col style="text-align: right" >
	        			<v-ons-icon icon="fa-info-circle" style="color:#cca108"></v-ons-icon> 
	        		</v-ons-col>   		
	      		</v-ons-row>  
	    	</v-ons-card>
    </div>
	</v-ons-page>

</template>

<script>

import ScoreDetails from "./ScoreDetails.vue"
import TrophiesDetails from "./TrophiesDetails.vue"
import StatusDetails from './StatusDetails.vue'
export default {
  data() {
    return {

    }
  },
  computed : {
  	scores() {
			return this.$store.state.user.scores
		},
		status(){
			return this.$store.state.user.status
		}
		,
    username() {
      return this.$store.state.user.name
		},
    trophies() {
    	return this.$store.state.user.trophies
    },
    tropheesObtenus() {
    	var res = 0
    	for (let i = 0; i < this.trophies.length; i++) {
    		if (this.trophies[i].obtenu) res++
    	}
    return res
    }
	},
	watch:{
		'status' :{
			handler:function(newStatus){
				if(newStatus && newStatus.length>0){
				let toast = this.$toasted.show("Vous avez acquis un nouveau status : " + _.last(newStatus).name + "!", { 
                fullWidth : true,
                position: "bottom-center", 
                duration : 5000,
                icon : "clock"
          });

			}}
		}
	},	
  methods : {
		displayStatusDetails(){
  		this.$store.commit("navigator/push", {
        extends: StatusDetails  
      });

		},
  	displayScoreDetails(scoreName) {
  		this.$store.commit("user/displayScore", scoreName)
  		this.$store.commit("navigator/push", {
        extends: ScoreDetails  
      });
		},
  	resetBadge() {
  		this.$store.commit('user/clearNotifProfil')
  	},
  	displayTrophiesDetails() {
  		this.$store.commit("navigator/push", {
        extends: TrophiesDetails 
      });
  	}
  }
}

</script>