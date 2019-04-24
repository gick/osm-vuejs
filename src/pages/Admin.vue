<template>
  <v-ons-page>
        <custom-toolbar backLabel="Retour"></custom-toolbar>

    <v-ons-list>
      <v-ons-list-header>Relevé administrateur</v-ons-list-header>
        <v-ons-list-item>
        <div class="center">
          Relevé d'identification 
        </div>
        <div class="right">
          <v-ons-switch @change="setIdentificationMode"></v-ons-switch> 
        </div>

      </v-ons-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
export default {
  computed: {
  },
  methods: {
    setIdentificationMode(event){
        this.$store.commit('releve/setIdentificationMode',event.value)
      
    }
  }
};
</script>
