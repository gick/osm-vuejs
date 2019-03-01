<template>
  <v-ons-page>
    <custom-toolbar backLabel="Retour"></custom-toolbar>
    <ons-card>
      <img v-show="releve.image" :src="releve.image" style="width: 100%">
      <div class="title">Relevé</div>
      <div class="content">
        <ons-list>
          <ons-list-header>Information</ons-list-header>
          <ons-list-item v-show="releve.genus">Genre : {{releve.genus}}</ons-list-item>
          <ons-list-item v-show="releve.specie">Espèce : {{releve.specie}}</ons-list-item>
        </ons-list>
      </div>
    </ons-card>
  </v-ons-page>
</template>