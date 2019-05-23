<template>
	<v-ons-page>
		 <v-ons-toolbar>
      <div class="left">
        <v-ons-back-button>Retour</v-ons-back-button>
      </div>
    </v-ons-toolbar>
    <v-ons-card>
    	<v-ons-row>
    		<v-ons-col>
    			Score
    		</v-ons-col>
    		<v-ons-col style="text-align: right">
    			{{score}}
    		</v-ons-col>
    	</v-ons-row>   	 
    </v-ons-card>
   
    <v-ons-card>
    	<v-ons-list-header>Points acquis</v-ons-list-header>
    	<v-ons-list style="max-height:200px; overflow: auto">
    		<v-ons-list-item v-for="item in journal">
    			<v-ons-row>
    				<v-ons-col>
    					{{ getText(item.action) }}
    				</v-ons-col>
    				<v-ons-col style="text-align: right">
    					{{ item.points }}
    				</v-ons-col>
    			</v-ons-row>  
    		</v-ons-list-item>
    	</v-ons-list>
    </v-ons-card>
   
    <v-ons-card>
    	<v-ons-list-header>Comment obtenir des points ?</v-ons-list-header>
    	<v-ons-list>
    		<v-ons-list-item v-for="(item,index) in explorationRules" v-bind:key='index + "rules"'>
    			<v-ons-row>
    				<v-ons-col>
    					{{ item.text}}
    				</v-ons-col>
    				<v-ons-col style="text-align: right">
    					{{item.points}}
    				</v-ons-col>	 
    			</v-ons-row>
    		</v-ons-list-item>
    	</v-ons-list>
    </v-ons-card>

  </v-ons-page>


</template>

<script>
	export default {
		data() {
			return {

			}
		},
		computed : {
			journal() {
				return this.$store.state.user.explorationHistory
			},
			score() {
      	return this.$store.state.user.explorationScore
    	},
    	explorationRules() {
				return this.$store.state.commonData.explorationRules
			},
		},
		methods : {
			getText(action) {
			  switch (action) {
			    case "completeGenus" :
			      return "Genre renseigné"
			    case "completeSpecie" :
			      return "Espèce renseignée"
			    case "completeCommon" :
			      return "Nom commun renseigné"
			     case "modifyGenus" :
			      return "Genre modifié"
			    case "modifySpecie" :
			      return "Espèce modifiée"
			    case "modifyCommon" :
			      return "Nom commun modifié"
			    case "photograph" :
			      return "Prise de photo"
			    case "validate" :
			      return "Validation"
			    case "successfulActivity" :
			      return "Activité réussie"
			    case "gps" :
			      return "Faire un relevé"
			  }
			}
		}
	}

</script>