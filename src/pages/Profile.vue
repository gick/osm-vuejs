<template>
	<v-ons-page>
		<v-ons-card v-show="$store.state.user.id">
      		<v-ons-row>
        		<v-ons-col>{{ username }}</v-ons-col>
        		<v-ons-col style="text-align: right">Score : {{ score }}</v-ons-col>
      		</v-ons-row>    
    	</v-ons-card>
    	<v-card>
	    		<v-ons-card v-for="trophie in trophies">
	    			<img :src=trophie.path>
	    			<br>
	    			<center>{{ trophie.nom }}</center>
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
  	score() {
      return this.$store.state.releve.score
    },
    username() {
      return this.$store.state.user.name
    },
    trophies() {
    	return this.$store.state.releve.trophies
    }
  }
}

</script>