<template>
  <v-ons-page :style="swipePosition">
    <custom-toolbar :style="swipeTheme" modifier="white-content">
      {{ title }}
      <v-ons-toolbar-button
        slot="right"
        modifier="white-content"
        @click="$store.commit('splitter/toggle');"
      >
        <v-ons-icon icon="ion-navicon, material:md-menu"></v-ons-icon>
      </v-ons-toolbar-button>
    </custom-toolbar>
    <v-ons-tabbar
      position="auto"
      :modifier="md ? 'autogrow white-content' : ''"
      :on-swipe="md ? onSwipe : null"
      :tabbar-style="swipeTheme"
      :tabs="tabs"
      :index.sync="index"
    ></v-ons-tabbar>
  </v-ons-page>
</template>

<script>
import Pusher from "pusher-js";
import Map from "./pages/Map.vue";
import Home from "./pages/Home.vue";
import Profile from "./pages/Profile.vue";
import Arboretum from "./pages/Arboretum.vue";
import Releve from "./pages/Releves.vue";
import Folia from "./pages/Folia.vue";

// Just a linear interpolation formula
const lerp = (x0, x1, t) => parseInt((1 - t) * x0 + t * x1, 10);
// RGB colors
const red = [244, 67, 54];
const blue = [30, 136, 229];
const purple = [103, 58, 183];

export default {
  data() {
    return {
      shutUp: !this.md,
      showingTip: false,
      colors: red,
      animationOptions: {},
      topPosition: 0
    };
  },
  mounted() {},
  watch: {
    'lostProgression':{
      handler:function(val){
        if(val==1){
       this.$toasted.show("La mission à été modifié, vous avez perdu votre progression", {
          theme: "bubble",
          position: "top-center",
          duration: 5000
      });
        this.$store.commit('user/lostProgression')
        }
      }
    },
    userID() {
      Pusher.logToConsole = true;

      var pusher = new Pusher("f204a3eb6cfeb87e594b", {
        cluster: "eu",
        forceTLS: true,
        authEndpoint: "/api/pusher/auth"
      });
      var userChannel = pusher.subscribe("presence-channel");
      userChannel.bind(
        "pusher:member_removed",
        function(member) {
          // for example:
          this.$store.commit("users/removeUser", member);
        }.bind(this)
      );

      userChannel.bind(
        "pusher:member_added",
        function(member) {
          // for example:
          this.$store.commit("users/addUser", member);
        }.bind(this)
      );

      userChannel.bind(
        "pusher:subscription_succeeded",
        function(members) {
          // for example
          members.each(
            function(member) {
              console.log(member);
              this.$store.commit("users/addUser", member);
            }.bind(this)
          );
        }.bind(this)
      );

      var channel = pusher.subscribe("observation");
      channel.bind(
        "new_obs",
        function(data) {
          let { userId, observation } = data;
          if (userId == this.userID) {
            return;
          }
          this.$store.commit("releve/addFromOutside", observation);
        }.bind(this)
      );
      channel.bind(
        "progression_lost",
        function(data) {
        this.$toasted.show("Vous allez être deconnecté suite à un changement de la mission", {
          theme: "bubble",
          position: "top-center",
          duration: 5000,
          onComplete:()=>{window.location.reload();
          }
        });

        }.bind(this)
      );

      channel.bind(
        "modify_obs",
        function(data) {
          let { userId, observation } = data;
          if (userId == this.userID) {
            return;
          }
          this.$store.commit("releve/modifyFromOutside", observation);
        }.bind(this)
      );
      channel.bind(
        "invalidate_tree",
        function(data) {
          let { userId, observation } = data;
          if (userId == this.userID) {
            return;
          }

          this.$store.commit("releve/setNoTree", observation);
        }.bind(this)
      );
      channel.bind(
        "validate_obs",
        function(data) {
          let { userId, observation } = data;
          if (userId == this.userID) {
            return;
          }
          this.$store.commit("releve/validateFromOutside", observation);
        }.bind(this)
      );

      channel.bind(
        "uninvalidate_tree",
        function(data) {
          let { userId, observation } = data;
          if (userId == this.userID) {
            return;
          }

          this.$store.commit("releve/setNoTree", observation);
        }.bind(this)
      );

      channel.bind(
        "remove_obs",
        function(data) {
          let { userId, observation } = data;
          if (userId == this.userID) {
            return;
          }

          this.$store.commit("releve/removeObservation", observation);
        }.bind(this)
      );
    }
  },
  methods: {
    onSwipe(index, animationOptions) {
      // Apply the same transition as ons-tabbar
      this.animationOptions = animationOptions;

      // Interpolate colors and top position
      const a = Math.floor(index),
        b = Math.ceil(index),
        ratio = index % 1;
      this.colors = this.colors.map((c, i) =>
        lerp(this.tabs[a].theme[i], this.tabs[b].theme[i], ratio)
      );
      this.topPosition = lerp(
        this.tabs[a].top || 0,
        this.tabs[b].top || 0,
        ratio
      );
    },
    showTip(e, message) {
      if (!this.shutUp && !(e && e.swipe) && !this.showingTip) {
        this.showingTip = true;
        this.$ons.notification
          .toast({
            message,
            buttonLabel: "Shut up!",
            timeout: 2000
          })
          .then(i => {
            this.shutUp = i === 0;
            this.showingTip = false;
          });
      }
    }
  },

  computed: {
    tabs() {
      var tab = 
      [
        {
          label: this.$t('map'),
          icon: "ion-map",
          active: false,
          page: Map,
          theme: red
        },
        {
          label: this.$t('mission'),
          icon: "ion-home",
          page: Home,
          theme: red
        },       
        {
          label: this.$t('relevés'),
          icon: "ion-edit",
          page: Releve,
          theme: purple,
          badge: this.$store.state.releve.releves.filter(
            value => value.osmId == this.userID
          ).length
            ? this.$store.state.releve.releves.filter(
                value => value.osmId == this.userID
              ).length
            : null
        },
        {
          label: "Folia",
          icon: "ion-search",
          page: Folia,

          theme: purple
        }
      ];
      if (this.gamificationMode) {
        var profil = 
         {
          label: this.$t('score'),
          icon: "ion-trophy",
          page: Profile,
          theme: red,
          badge:
            this.$store.state.user.notifProfil == 0
              ? null
              : this.$store.state.user.notifProfil
        };
        var arboretum =
        {
          label: this.$t('arboretum'),
          icon: "ion-leaf",
          page: Arboretum,
          theme: blue
        }
        tab.splice(2,0, profil, arboretum)
      }
      return tab
    },
    gamificationMode() {
      return this.$store.state.user.gamificationMode;
    },
    userID() {
      return this.$store.state.user.id;
    },
    lostProgression(){
      return this.$store.state.user.lostProgression;
    },
    index: {
      get() {
        return this.$store.state.tabbar.index;
      },
      set(newValue) {
        this.$store.commit("tabbar/set", newValue);
      }
    },
    title() {
      return this.md
        ? "Albiziapp"
        : this.tabs[this.index].title || this.tabs[this.index].label;
    },
    swipeTheme() {
      return (
        this.md && {
          backgroundColor: `rgb(${this.colors.join(",")})`,
          transition: `all ${this.animationOptions.duration || 0}s ${this
            .animationOptions.timing || ""}`
        }
      );
    },
    swipePosition() {
      return (
        this.md && {
          top: this.topPosition + "px",
          transition: `all ${this.animationOptions.duration || 0}s ${this
            .animationOptions.timing || ""}`
        }
      );
    }
  }
};
</script>

<style>
/* Custom 'white-content' modifier */

.page--material .toolbar--white-content__center,
.page--material .toolbar-button--white-content,
.page--material :checked + .tabbar--white-content__button {
  color: white;
}

.page--material .tabbar--white-content__button {
  color: rgba(255, 255, 255, 0.7);
}

.page--material .tabbar--white-content__border {
  background-color: white;
}
</style>
