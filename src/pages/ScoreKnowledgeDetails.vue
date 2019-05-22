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
    			{{knowledgeScore}}
    		</v-ons-col>
    	</v-ons-row>   	 
    </v-ons-card>
   
    <v-ons-card>
    	<v-ons-list-header>Points acquis</v-ons-list-header>
    	<v-ons-list style="max-height:200px; overflow: auto">
    		<v-ons-list-item v-for="(item,index) in knowledgeHistory" v-bind:key="index+'history'">
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
    		<v-ons-list-item v-for="(item,index) in knowledgeRules" v-bind:key='index + "rules"'>
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
			knowledgeRules() {
				return this.$store.state.commonData.knowledgeRules
			},
			knowledgeScore() {
      	return this.$store.state.user.knowledgeScore
    	},
    	knowledgeHistory() {
    		return this.$store.state.user.knowledgeHistory
    	}
		},
		methods : {
			getText(action){
				switch(action){
					case 'IDENTIFIED_GENUS' :
						return 'Genre correctement identifié'
                    case 'IDENTIFIED_SPECIE' :
                        return 'Espèce correctement identifiée'
                    case 'IDENTIFIED_COMMON' :
                        return 'Nom commun correctement identifié'
					case 'USE_FOLIA' :
						return 'Utilisation de Folia'
					case 'QUESTION' :
						return 'Arbre déclaré douteux'
					case 'SAME_GENUS_PROPAGATION' :
						return 'Confirmation du genre de votre relevé'
                    case 'SAME_SPECIE_PROPAGATION' :
                        return 'Confirmation de l\'espèce de votre relevé'
                    case 'SAME_COMMON_PROPAGATION' :
                        return 'Confirmation du nom commun de votre relevé'
				}
			}
		}
	}

</script>