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
    	<v-ons-list-header>Journal</v-ons-list-header>
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
    		<v-ons-list-item v-for="action in actionsTransActivite.keys()">
    			<v-ons-row>
    				<v-ons-col>
    					{{ getText(action)}}
    				</v-ons-col>
    				<v-ons-col style="text-align: right">
    					{{actionsTransActivite.get(action)}}
    				</v-ons-col>	 
    			</v-ons-row>
    		</v-ons-list-item>
    		<v-ons-list-item>
    			<v-ons-row>
    				<v-ons-col>
    					Activité réussie
    				</v-ons-col>
    				<v-ons-col style="text-align: right">
    					?
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
    	actionsTransActivite() {
    		return this.$store.state.user.actionsTransActivite
    	}
		},
		methods : {
			getText(action) {
			  switch (action) {
			    case "COMPLETE_GENUS" :
			      return "Genre renseigné"
			    case "COMPLETE_SPECIE" :
			      return "Espèce renseignée"
			    case "COMPLETE_COMMON" :
			      return "Nom commun renseigné"
			     case "MODIFY_GENUS" :
			      return "Genre modifié"
			    case "MODIFY_SPECIE" :
			      return "Espèce modifiée"
			    case "MODIFY_COMMON" :
			      return "Nom commun modifié"
			    case "PHOTOGRAPH" :
			      return "Prise de photo"
			    case "VALIDATE" :
			      return "Validation"
			    case "SUCCESSFUL_ACTIVITY" :
			      return "Activité réussie"
			    case "GPS" :
			      return "Faire un relevé"
			    default :
			      return "Action non répertoriée"
			  }
			}
		}
	}

</script>