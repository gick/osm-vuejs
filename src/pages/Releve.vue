<template>
  <v-ons-page>
    <custom-toolbar backLabel="Retour"></custom-toolbar>
    <ons-card>
      <img v-show="releve.image" :src="releve.image" style="width: 100%">
      <div class="title">Relevé</div>
      <div class="content">
        <ons-list>
          <ons-list-header>Information</ons-list-header>
          {{releve}}
          <ons-list-item v-show="releve.specie">Espèce : {{releve.specie}}</ons-list-item>
        </ons-list>
        <section style="margin: 16px">
          <v-ons-button @click="modify" style="margin: 6px 0">Modifier</v-ons-button>
        </section>
      </div>
    </ons-card>
  </v-ons-page>
</template>
<script>
import SimplePage from "./SimplePage.vue";

export default {
  methods: {
    modify() {
      var id = this.releve._id;
      var specie = this.releve.specie;
      this.$store.commit("navigator/push", {
        extends: SimplePage,
        data() {
          return {
            releveId: id,
            specie: specie,
            modify: true,
            toolbarInfo: {
              backLabel: "Home",
              title: "key"
            }
          };
        }
      });
    }
  }
};
</script>