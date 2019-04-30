<template>
	<v-ons-page>
		<v-ons-card v-show="$store.state.user.id">
      		<v-ons-row>
        		<v-ons-col>{{ username }}</v-ons-col>
        		<v-ons-col style="text-align: right" >
        			<div @click='displayScoreDetails'>
        				Score : {{ score }}
        			</div>	
        		</v-ons-col>
      		</v-ons-row> 
      		<v-ons-row>
        		<!-- <v-ons-col>
        			0<img src="./trophees/trophy.png">
        		</v-ons-col>
        		<v-ons-col>
        			0<img src="./trophees/question_mark.png">
        		</v-ons-col> -->
      		</v-ons-row>  
    	</v-ons-card>
    	<v-card>
	    		<v-ons-card v-for="trophie in trophies">
	    			<img :src="'./trophees/' + trophie.path">
	    			<br>
	    			<center>{{ trophie.nom }}</center>
	    		</v-ons-card>
    </v-card>
	</v-ons-page>
</template>

<script>

import ScoreDetails from "./ScoreDetails.vue"

export default {
  data() {
    return {

    }
  },
  computed : {
  	score() {
      return this.$store.state.releve.score
    },
    username() {
      return this.$store.state.user.name
    },
    trophies() {
    	return this.$store.state.releve.trophies
    }
  },
  methods : {
  	displayScoreDetails() {
  		this.$store.commit("navigator/push", {
        extends: ScoreDetails  
      });
  	},
  	clearBadges() {
  		this.$store.commit('releve/clearNotifProfil')
  	}
  },
  mounted() {
  	this.clearBadges()
  }
}

</script>