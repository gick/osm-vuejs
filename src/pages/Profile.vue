<template>
	<v-ons-page @show="resetBadge">
		<div v-show="$store.state.user.id">
			 <v-ons-list-header>{{ username }}</v-ons-list-header>
			 <v-ons-card>
	    	<v-ons-row @click='displayScoreDetails'>
	    		<v-ons-col>
	        	Score : {{ score }}
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
	    </v-card>
    </div>
	</v-ons-page>

</template>

<script>

import ScoreDetails from "./ScoreDetails.vue"
import TrophiesDetails from "./TrophiesDetails.vue"

export default {
  data() {
    return {

    }
  },
  computed : {
  	score() {
      return this.$store.state.user.score
    },
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
  methods : {
  	displayScoreDetails() {
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