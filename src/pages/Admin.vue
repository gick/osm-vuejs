<template>
  <v-ons-page @show="loadUserData">
    <custom-toolbar backLabel="Retour"></custom-toolbar>
    <div class="content">
      <v-ons-list>
        <v-ons-list-title>Relevé administrateur</v-ons-list-title>
        <v-ons-list-item>
          <div class="center">Relevé d'identification</div>
          <div class="right">
            <v-ons-switch v-model="identCheck" @change="setIdentificationMode"></v-ons-switch>
          </div>
        </v-ons-list-item>
        <v-ons-list-item>
          <div class="center">Relevé de vérification</div>
          <div class="right">
            <v-ons-switch v-model="verifCheck" @change="setVerificationMode"></v-ons-switch>
          </div>
        </v-ons-list-item>
        <v-ons-list-item>
          <div class="center">Mode anonyme (vos relevé seront vus comme ceux d'un autre joueur)</div>
          <div class="right">
            <v-ons-switch v-model="isAnon" @change="setAnonymous"></v-ons-switch>
          </div>
        </v-ons-list-item>
        <v-ons-list-item>
          <div class="center">Mode vérification des identification expertes</div>
          <div class="right">
            <v-ons-switch v-model="$store.state.commonData.identification"></v-ons-switch>
          </div>
        </v-ons-list-item>
        <v-ons-list-item>
          <div class="center">Mode vérification des relevé utilisateurs</div>
          <div class="right">
            <v-ons-switch v-model="$store.state.commonData.verification"></v-ons-switch>
          </div>
        </v-ons-list-item>

      </v-ons-list>
      <v-ons-list>
        <v-ons-list-title>Utilisateurs connectés</v-ons-list-title>
        <v-ons-list-item v-for="(user,index) in userList" v-bind:key="index">
          <div class="center">{{user.info.name}}</div>
        </v-ons-list-item>
      </v-ons-list>
      <v-ons-list
        v-for="(verifications,index) in verificationsByUser"
        v-bind:key="index+'verifications'"
      >
        <v-ons-list-item expandable>
          <v-ons-list-title>Vérifications effectuées par {{verifications.user}}</v-ons-list-title>

          <v-ons-list class="expandable-content">
            <v-ons-list-item
              style="display:block;"
              modifier="longdivider"
              v-for="(verif,index) in verifications.data"
              v-bind:key="index+'verifs'"
            >
              <div class="center">
                <b>Relevé d'origine :</b>
                {{verif.specie}}
                <v-ons-button @click="visualizeReleve(verif)" style="margin-left:40px;">Voir</v-ons-button>
              </div>
              <div class="left" style="display:block">
                <span>
                  <b>Action utilisateur :</b>
                </span>
                <span v-if="verif.validated">validation du relevé</span>
                <span v-if="!verif.validated">modification du relevé par {{verif.userSpecie}}</span>
              </div>
            </v-ons-list-item>
          </v-ons-list>
        </v-ons-list-item>
      </v-ons-list>
     <v-ons-list
        v-for="(identification,index) in identificationByUser"
        v-bind:key="index+'identification'"
      >
        <v-ons-list-item expandable>
          <v-ons-list-title>Identification effectuées par {{identification.user}}</v-ons-list-title>

          <v-ons-list class="expandable-content">
            <v-ons-list-item
              style="display:block;"
              modifier="longdivider"
              v-for="(ident,index) in identification.data"
              v-bind:key="index+'ident'"
            >
              <div class="center">
                <b>Relevé d'origine :</b>
                {{ident.specie}} 
                <v-ons-button @click="visualizeReleve(ident)" style="margin-left:40px;">Voir</v-ons-button>
              </div>
              <div class="left" style="display:block">
                <span>
                  <b>Relevé utilisateur : {{ident.userSpecie}}</b>
                </span>
              </div>
            </v-ons-list-item>
          </v-ons-list>
        </v-ons-list-item>
      </v-ons-list>

    </div>
  </v-ons-page>
</template>

<script>
export default {
  data() {
    return {
      identCheck: this.$store.state.releve.identificationMode,
      verifCheck: this.$store.state.releve.verificationMode,
      isAnon:this.$store.state.user.isAnon,
      verificationsByUser: [],
      identificationByUser:[]
    };
  },
  computed: {
    userList() {
      return this.$store.state.users.userList;
    },
  },
  methods: {
    setAnonymous(evt){
      if(evt.value){
        this.$store.dispatch('user/setAnonymous')
      } else {
        this.$store.dispatch('user/restoreSession')

      }
    },
    visualizeReleve(releve) {
      this.$store.commit("navigator/pop");
      this.$store.commit("tabbar/set", 0);
      this.$root.$emit("changeCenter", releve.coordinates);
    },

    loadUserData() {
      axios.get("/api/verification").then(
        function(response) {
          this.verificationsByUser = this.formatResult(response.data);
        }.bind(this)
      );
      axios.get("/api/identification").then(
        function(response) {
          this.identificationByUser=this.formatResult(response.data);
        }.bind(this)
      );
    },
    formatResult(data) {
      let verifUsers = this.getUserList(data);
      let verifArray = [];
      for (let user of verifUsers) {
        let arrayByUser = data.filter(val => val.username == user);
        verifArray.push({ user: user, data: arrayByUser });
      }
      return verifArray;
    },
    getUserList(array) {
      return [...new Set(array.map(x => x.username))];
    },
    setIdentificationMode(event) {
      if (event.value) {
        this.verifCheck = false;
      }
      this.$store.commit("releve/setIdentificationMode", event.value);
    },
    setVerificationMode(event) {
      if (event.value) {
        this.identCheck = false;
      }
      this.$store.commit("releve/setVerificationMode", event.value);
    }
  }
};
</script>
