<template>
  <v-ons-page>
    <v-ons-list>
      <v-ons-list-header>Transitions</v-ons-list-header>
      <v-ons-list-item v-for="animation in animations" :key="animation"
        modifier="chevron"
        @click="transition(animation)"
      >
        {{ animation }}
      </v-ons-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
const transitionPage = {
  template: `
    <v-ons-page>
      <custom-toolbar backLabel="Anim">
        {{ animation }}
      </custom-toolbar>
      <p style="text-align: center">
        La page relevé est à faire
      </p>
    </v-ons-page>
    `
};

export default {
  data() {
    return {
      animations: ['Relevé 1', 'Relevé 2']
    };
  },
  methods: {
    transition(name) {

      this.$store.commit('navigator/push', {
        extends: transitionPage,
        data() {
          return {
            animation: name
          }
        }
      });
    }
  }
};
</script>
