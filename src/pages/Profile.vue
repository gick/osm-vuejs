<template>
	<v-ons-page @show="resetBadge">
		<div v-show="$store.state.user.id">
			<v-ons-card>
	      		<v-ons-row>
	        		<v-ons-col>{{ username }}</v-ons-col>
	        		<v-ons-col>
	        			<center>
	        				{{tropheesObtenus}}/{{trophies.length}}
	        				<v-ons-icon icon="fa-trophy" style="opacity:0.9; color:#f4c242"></v-ons-icon>
	        			</center>		
	        		</v-ons-col>
	        		<v-ons-col style="text-align: right" >
	        			<div @click='displayScoreDetails'>
	        				 {{ score }} <v-ons-icon icon="fa-star" style="color:#cca108"></v-ons-icon> 
	        			</div>	
	        		</v-ons-col>     		
	      		</v-ons-row>  
	    	</v-ons-card>
	    	<v-ons-card>
	    		<v-ons-row>
	    			<v-ons-col width="20%" v-for="(trophy,index) in trophies">
	    				<center>
	    					<v-ons-icon v-if="trophy.obtenu" size="30px" icon="fa-trophy" style="color:#f4c242" @click="displayTrophy(index)"></v-ons-icon>
	    					<v-ons-icon v-else size="30px" icon="fa-trophy" style="opacity:0.2" @click="displayTrophy(index)"></v-ons-icon>
	    				</center>	
	    			</v-ons-col>
	    		</v-ons-row>
	    	</v-ons-card>

	    	<v-card>
		    		<v-ons-card v-for="trophy in trophies">
		    			<img v-if="trophy.obtenu" :src="'./trophees/' + trophy.path" style="width:100%">
		    			<img v-else :src="'./trophees/' + trophy.path" style="opacity:0.2; width:100%">
		    			<br>
		    			<center v-if="trophy.obtenu">
		    				{{ trophy.nom }}
		    			</center>
		    			<center v-else>
		    				<v-ons-icon icon="fa-lock"></v-ons-icon>
		    				{{ trophy.nom }}
		    			</center>
		    		</v-ons-card>
	    </v-card>
    </div>
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
  		this.$store.commit('releve/clearNotifProfil')
  	},
  	displayTrophy(index) {
  		console.log(JSON.stringify(this.trophies[index]))
  	}
  }
}

</script>