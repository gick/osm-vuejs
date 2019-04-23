<template>
  <v-ons-page>
    <v-ons-list>
      <v-ons-list-header>Liste des relevés</v-ons-list-header>
      <v-ons-list-item
        v-for="(releve,index) in releves"
        :key="index"
        modifier="chevron"
        @click="transition(releve)"
      >
        <div class="center">
          <span class="list-item__title">Auteur : {{releve.authorName}}</span>
          <span class="list-item__subtitle">{{releve.specie}}</span>
          <span class="list-item__subtitle">{{releve.common}}</span>
        </div>
      </v-ons-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
import Releve from "./Releve.vue";
export default {
  computed: {
    releves() {
      return this.$store.state.releve.releves.filter(
        value => value.osmId == this.userID
      );
    },
    userID() {
      return this.$store.state.user.id;
    }
  },
  methods: {
    transition(releve) {
      this.$store.commit("navigator/push", {
        extends: Releve,
        data() {
          return {
            id: releve._id,
            visualize: true
          };
        }
      });
    }
  }
};
</script>
