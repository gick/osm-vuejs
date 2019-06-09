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
          <div
            class="center"
          >Mode création de relevé anonyme (les relevés seront vus comme ceux d'un autre joueur)</div>
          <div class="right">
            <v-ons-switch v-model="$store.state.user.isAnon"></v-ons-switch>
          </div>
        </v-ons-list-item>
        <v-ons-list-item>
          <div class="center">Mode suppression (EVITEZ DE SUPPRIMER DES RELEVES D'AUTRES ADMINS)</div>
          <div class="right">
            <v-ons-switch v-model="$store.state.user.isGod"></v-ons-switch>
          </div>
        </v-ons-list-item>

        <v-ons-list-item>
          <div class="center">Mode vérification des identifications expertes</div>
          <div class="right">
            <v-ons-switch v-model="identificationMode"></v-ons-switch>
          </div>
        </v-ons-list-item>
        <v-ons-list-item>
          <div class="center">Mode vérification des relevés utilisateurs</div>
          <div class="right">
            <v-ons-switch v-model="verificationMode"></v-ons-switch>
          </div>
        </v-ons-list-item>

        <v-ons-list-item>
          <div class="center">Mode gamification</div>
          <div class="right">
            <v-ons-switch v-model="$store.state.user.gamificationMode"></v-ons-switch>
          </div>
        </v-ons-list-item>
        <v-ons-list-item>
          <div class="center">Reset session</div>
          <div class="right">
            <v-ons-button @click="resetSession">Reset</v-ons-button>
          </div>
        </v-ons-list-item>

        <v-ons-list-item v-for="score in scores">
          <div class="center">Add {{score.displayName}}</div>
          <div class="right">
            <v-ons-button @click="addPoints(score)">Add</v-ons-button>
          </div>
        </v-ons-list-item>
        <v-ons-list-item>
          <div class="center">Upload</div>
          <div class="right">
            <file-upload
              accept=".json"
              class="upload"
              url="/api/uploadMission"
              :thumb-url="thumbUrl"
              @error="error"
              @success="success"
            ></file-upload>
          </div>
        </v-ons-list-item>
        <v-ons-list-item>
          <div class="center">Restore mission</div>
          <div class="right">
            <v-ons-button @click="restoreMission">Restore</v-ons-button>
          </div>
        </v-ons-list-item>

      </v-ons-list>
      <v-ons-list></v-ons-list>
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
<style>
.upload {
    height: 42px;
    width: 69px;
    border-radius: 3px;
    overflow: hidden;}
</style>

<script>
export default {
  data() {
    return {
      identCheck: this.$store.state.releve.identificationMode,
      verifCheck: this.$store.state.releve.verificationMode,
      isAnon: this.$store.state.user.isAnon,
      verificationsByUser: [],
      identificationByUser: []
    };
  },
  computed: {
    userList() {
      return this.$store.state.users.userList;
    },
    scores() {
      return this.$store.state.user.scores;
    },
    identificationMode: {
      get() {
        return this.$store.state.commonData.identification;
      },
      set(val) {
        this.$store.commit("commonData/setIdentificationMode", val);
      }
    },
    verificationMode: {
      get() {
        return this.$store.state.commonData.verification;
      },
      set(val) {
        this.$store.commit("commonData/setVerificationMode", val);
      }
    }
  },
  methods: {
    success() {
      //this.resetSession()
    },
    restoreMission(){
      axios.post('/api/restoreMission')
    }
    ,
    error() {
      this.$toasted.show("Votre fichier n'est pas un JSON valide", {
        theme: "bubble",
        position: "top-center",
        duration: 5000
      });
    },
    thumbUrl() {
      return "";
    },
    addPoints(score) {
      this.$ons.notification
        .prompt("Number of points", {
          inputType: "number",
          title: "Add " + score.displayName,
          defaultValue: 0
        })
        .then(
          function(points) {
            if (points) {
              this.$store.commit("user/addPoints", {
                name: score.name,
                history: {
                  text: "via admin",
                  points: parseInt(points)
                }
              });
            }
          }.bind(this)
        );
    },

    resetSession() {
      axios.post("/api/resetBackup").then(
        function(response) {
          if (response.data.success) {
            window.location.reload();
          }
        }.bind(this)
      );
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
          this.identificationByUser = this.formatResult(response.data);
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
      this.$store.commit("releve/setIdentificationMode", event.value);
      if (!event.value) return;

      this.$store.commit("commonData/setIdentificationMode", true);
    }
  }
};
</script>
