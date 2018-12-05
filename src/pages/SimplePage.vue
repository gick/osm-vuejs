<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left">
        <v-ons-back-button>Back</v-ons-back-button>
      </div>
    </v-ons-toolbar>
    <v-ons-list>
      <v-ons-list-header>Nouveau relevé</v-ons-list-header>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <div class="center">
          <v-ons-input placeholder="Nom de l'espèce" float v-model="genre"></v-ons-input>
        </div>
      </v-ons-list-item>
      <v-ons-list-item>
        <div class="left">
          <v-ons-icon icon="ion-leaf" class="list-item__icon"></v-ons-icon>
        </div>
        <v-ons-input placeholder="Nom du genre" float v-model="specie"></v-ons-input>
      </v-ons-list-item>
    </v-ons-list>
    <section style="margin: 16px">
      <v-ons-button :disabled="!completed" @click="complete" style="margin: 6px 0">Envoyer</v-ons-button>
      <v-ons-button modifier="outline" style="margin: 6px 0">Annuler</v-ons-button>
    </section>
  </v-ons-page>
</template>
<script>
export default {
  data() {
    return { genre: "", specie: "" };
  },
  computed: {
    completed() {
      return this.genre.length + this.specie.length;
    }
  },
  methods: {
    complete() {
      this.$store.commit("releve/setGenusSpecie",{genus:this.genre,specie:this.specie})
      this.$store.commit("completion/set", 10);
      this.$store.commit("navigator/pop");
    }
  }
};
</script>