<template>
	<v-ons-page>
		 <v-ons-toolbar>
      <div class="left">
        <v-ons-back-button>Back</v-ons-back-button>
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
    		<v-ons-list-item v-for="line in journal">
    			<v-ons-row>
    				<v-ons-col>
    					{{ line.action }}
    				</v-ons-col>
    				<v-ons-col style="text-align: right">
    					+{{ line.nbPoint }}
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
    					{{action}}
    				</v-ons-col>
    				<v-ons-col style="text-align: right">
    					+{{actionsTransActivite.get(action)}}
    				</v-ons-col>	 
    			</v-ons-row>
    		</v-ons-list-item>
    		<v-ons-list-item>
    			<v-ons-row>
    				<v-ons-col>
    					ACTIVITE_REUSSIE
    				</v-ons-col>
    				<v-ons-col style="text-align: right">
    					+?
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
				return this.$store.state.releve.journal
			},
			score() {
      	return this.$store.state.releve.score
    	},
    	actionsTransActivite() {
    		return this.$store.state.releve.actionsTransActivite
    	}
		}
	}

</script>