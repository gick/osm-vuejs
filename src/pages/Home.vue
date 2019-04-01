<template>
  <v-ons-page> 
    <v-ons-fab style="background-color:red" @click="logout" v-show="$store.state.user.id" position="bottom right">
      <v-ons-icon icon="ion-close"></v-ons-icon>
    </v-ons-fab>

    <p class="intro">Ceci est un prototype d'interface pour les missions.
      <br>
      <br>
    </p>
      <v-ons-card v-show="!$store.state.user.id">
      <div  class="title">Authentifiez vous!</div>
      <div class="content">
        <p>Bienvenue dans AlbiziApp</p>
        <p>Merci de vous authentifier. </p>
              <v-ons-button @click="authenticate">Authenticate</v-ons-button>

      </div>
    </v-ons-card>

    <v-ons-card v-show="$store.state.user.id">
      <div  class="title">Mission en cours</div>
      <div v-if="completionRate<100" class="content">
        <p>Bonjour {{$store.state.user.name}}</p>
        <p>Votre mission actuelle est {{$store.state.completion.mission}} d'effectuer 10 relevés. Pour cela, utiliser la carte accessible via la barre de menu.</p>
        <p>
          Vous avez effectué {{completionRate/10}} relevé.
          <v-ons-progress-bar :value="completionRate" secondary-value="100"></v-ons-progress-bar>
        </p>
      </div>
      <div v-if="completionRate>=100" class="content">
        <p>Bravo vous avez terminé la première mission.</p>
        <p>
          Votre nouvelle mission est d'effectuer 3 relevés <b>d'espèces différentes.</b>
          <v-ons-progress-bar :value="completionRate2" secondary-value="30"></v-ons-progress-bar>
        </p>
      </div>
    </v-ons-card>
    <!--  <v-ons-button @click="logout">Logout</v-ons-button>
      <p v-show='username'>Bonjour user {{username}}</p>

    <v-ons-card v-for="page of pages" :key="page.label" @click="push(page.component, page.label)">
      <div class="title">{{ page.label }}</div>
      <div class="content">{{ page.desc }}</div>
    </v-ons-card> !-->
  </v-ons-page>
</template>

<script>
var osmAuth = require('osm-auth');
import PullHook from "./PullHook.vue";
import Dialogs from "./Dialogs.vue";
import Buttons from "./Buttons.vue";
import Carousel from "./Carousel.vue";
import InfiniteScroll from "./InfiniteScroll.vue";
import Progress from "./Progress.vue";
import SimplePage from "./SimplePage.vue";

export default {
  data() {
    return {
      username:'',
      pages: [
        {
          component: SimplePage,
          label: "Simple Page",
          desc: "Just to test adding a simple page."
        },
        {
          component: PullHook,
          label: "Pull Hook",
          desc: 'Simple "pull to refresh" functionality to update data.'
        },
        {
          component: Dialogs,
          label: "Dialogs",
          desc:
            "Components and utility methods to display many types of dialogs."
        },
        {
          component: Buttons,
          label: "Buttons",
          desc:
            "Different styles for buttons, floating action buttons and speed dials."
        },
        {
          component: Carousel,
          label: "Carousel",
          desc: "Customizable carousel that can be optionally fullscreen."
        },
        {
          component: InfiniteScroll,
          label: "Infinite Scroll",
          desc: 'Two types of infinite lists: "Load More" and "Lazy Repeat".'
        },
        {
          component: Progress,
          label: "Progress",
          desc: "Linear progress, circular progress and spinners."
        }
      ]
    };
  },
  computed: {
    completionRate() {
      return this.$store.state.completion.rate;
    }
  },
  methods: {
    authenticate(){
        this.$store.dispatch('user/login')
    },
    logout(){
        this.$store.dispatch('user/logout')
    },
    updateCompletion() {
      this.$store.commit("completion/set", 10);
    },
    push(page, key) {
      this.$store.commit("navigator/push", {
        extends: page,
        data() {
          return {
            toolbarInfo: {
              backLabel: "Home",
              title: key
            }
          };
        }
      });
    }
  }
};
</script>

<style>
.intro {
  text-align: left;
  padding: 0 22px;
  margin-top: 20px;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(0, 0, 0, 0.54);
}

ons-card {
  cursor: pointer;
  color: #333;
}

.card__title,
.card--material__title {
  font-size: 20px;
}
</style>
