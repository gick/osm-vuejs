<template>
  <v-ons-navigator swipeable swipe-target-width="50px"
    :page-stack="$store.state.navigator.stack"
    :pop-page="storePop"
    :options="{animation:'slide-ios'}"
    :class="{ 'border-radius': borderRadius }"
  ></v-ons-navigator>
</template>

<script>
var osmAuth = require('osm-auth');
import AppSplitter from './AppSplitter.vue';
export default {
  beforeCreate() {
        this.$store.commit('navigator/push', AppSplitter);
  },
  data() {
    return {
      shutUp: this.md
    }
  },
  computed: {
    pageStack() {
      return this.$store.state.navigator.stack;
    },
    options() {
      return this.$store.state.navigator.options;
    },
    borderRadius() {
      return new URL(window.location).searchParams.get('borderradius') !== null;
    }
  },
  methods: {
    storePop() {
      this.$store.commit('navigator/pop');
    },
    showPopTip() {
      !this.shutUp && this.$ons.notification.toast({
        message: 'Try swipe-to-pop from left side!',
        buttonLabel: 'Shut up!',
        timeout: 2000
      }).then(i => this.shutUp = i === 0);
    }
  }
};
</script>
