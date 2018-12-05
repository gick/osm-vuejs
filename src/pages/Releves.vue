<template>
  <v-ons-page>
    <v-ons-list>
      <v-ons-list-header>Liste des relevés</v-ons-list-header>
      <v-ons-list-item v-for="(releve,index) in releves" :key="index"
        modifier="chevron"
        @click="transition(releve)"
      >
        <p>{{releve.specie }}</p>
      </v-ons-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
import Releve from './Releve.vue'
export default {
  computed:{
    releves(){
      return this.$store.state.releve.releves
    }
  },
  methods: {
    transition(name) {

      this.$store.commit('navigator/push', {
        extends: Releve,
        data() {
          return {
            releve: name
          }
        }
      });
    }
  }
};
</script>
