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
    			{{ displayedScore.displayName }}
    		</v-ons-col>
    		<v-ons-col style="text-align: right">
    			{{ displayedScore.nbPoint }}
    		</v-ons-col>
    	</v-ons-row>   	 
    </v-ons-card>
   
    <v-ons-card>
    	<v-ons-list-header>Points acquis</v-ons-list-header>
    	<v-ons-list style="max-height:200px; overflow: auto">
    		<v-ons-list-item v-for="item in displayedScore.history">
    			<v-ons-row>
    				<v-ons-col>
    					{{ item.text }}
    				</v-ons-col>
    				<v-ons-col style="text-align: right" width='20%'>
    					{{ item.points }}
    				</v-ons-col>
    			</v-ons-row>  
    		</v-ons-list-item>
    	</v-ons-list>
    </v-ons-card>
   
    <v-ons-card>
    	<v-ons-list-header>Comment obtenir des points ?</v-ons-list-header>
    	<v-ons-list>
    		<v-ons-list-item v-for="(item,index) in displayedScore.rules" v-bind:key='index + "rules"'>
    			<v-ons-row>
    				<v-ons-col>
    					{{ item.text}}
    				</v-ons-col>
    				<v-ons-col style="text-align: right" width='20%'>
    					{{item.nbPoint}}
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
			scores() {
				return this.$store.state.user.scores
			},
			displayedScore() {
				for (let i = 0; i < this.scores.length; i++) {
					if (this.scores[i].display) {
						return this.scores[i]
					}
				}
			}
		},
		methods : {
			
		}
	}

</script>