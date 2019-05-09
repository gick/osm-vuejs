<template>
	<v-ons-page>
		<v-ons-toolbar>
      <div class="left">
        <v-ons-back-button>Back</v-ons-back-button>
      </div>
    </v-ons-toolbar>
		<v-card>
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
	    </v-card>

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
	</v-ons-page>

</template>

<script>

export default {
  data() {
    return {

    }
  },
  computed : {
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
  	displayTrophy(index) {
  		console.log(JSON.stringify(this.trophies[index]))
  	}
  }
}

</script>