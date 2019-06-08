<template>
  <v-ons-page>
    <v-ons-list>
      <v-ons-list-header>{{ $t('tracingsList') }}</v-ons-list-header>
      <v-ons-list-item
        v-for="(releve,index) in releves"
        :key="index"
        modifier="chevron"
        @click="transition(releve)"
      >
        <div class="center">
          <span class="list-item__subtitle">{{releve.specie}}</span>
          <span class="list-item__subtitle">{{releve.common}}</span>
          <span class="list-item__subtitle">{{releve.genus}}</span>
          <span class="list-item__subtitle" v-if="!(releve.specie && releve.common && releve.genus)"> {{ $t('unspecifiedTree') }}</span>
        </div>
        <badge-info  :ref="'rel'+releve._id" :releve="releve"></badge-info>
      </v-ons-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
import Releve from "./Releve.vue";
import BadgeInfo from "../partials/BadgeInfo.vue";

export default {
  components:{
    BadgeInfo
  },
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
      let ref='rel'+releve._id
      this.$refs[ref][0].reset()
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
