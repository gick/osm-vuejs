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
    					{{ getText(item.context) }}
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
			getText(item){
				switch(item.activity){
					case 'identification' :
						return 'Identification réussie'
					case 'folia' :
						return 'Utilisation de Folia'
					case 'noTree' :
						return 'Arbre déclaré douteux'
					case 'extConfirmation' :
						return 'Confirmation de votre relevé'

				}
			}
		}
	}

</script>