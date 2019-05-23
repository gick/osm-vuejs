<template>
	<v-ons-page @show="resetBadge">
		<div v-show="$store.state.user.id">
			 <v-ons-list-header>{{ username }}</v-ons-list-header>
			 <v-ons-card>
	    	<v-ons-row @click='displayScoreDetails'>
	    		<v-ons-col>
	        	Points d'observation : {{ score }}
	    		</v-ons-col>
	    		<v-ons-col style="text-align: right" >
	        	<v-ons-icon icon="fa-info-circle" style="color:#cca108"></v-ons-icon> 
	       	</v-ons-col>
	      </v-ons-row>
	    </v-ons-card>
			 <v-ons-card>
	    	<v-ons-row @click='displayKnowledgeDetails'>
	    		<v-ons-col>
	        	Points de connaissance : {{ knowledgeScore }}
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

import ScoreExplorationDetails from "./ScoreExplorationDetails.vue"
import ScoreKnowledgeDetails from "./ScoreKnowledgeDetails.vue"
import TrophiesDetails from "./TrophiesDetails.vue"

export default {
  data() {
    return {

    }
  },
  computed : {
  	score() {
      return this.$store.state.user.explorationScore
    },
    username() {
      return this.$store.state.user.name
		},
		knowledgeScore(){
			return this.$store.state.user.knowledgeScore
		}
		,
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
        extends: ScoreExplorationDetails  
      });
		},
		displayKnowledgeDetails() {
  		this.$store.commit("navigator/push", {
        extends: ScoreKnowledgeDetails  
      });
		}	
		,
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