<template>
  <v-ons-page>
    <v-ons-list-header>{{ $t('myArboretum') }}</v-ons-list-header>

    <v-ons-list>

      <vs-on-list-item v-bind:key="index" v-for="(specie,index) in species">
        <v-ons-card>
          <img :src="getImageUrl(specie)" onerror="this.style.display='none'"/>
          <div class="title">{{specie}}</div>
          <div class="content">
            <p>
              {{ $t('nbIdentification')}} : {{getIdentificationNumber(specie) }}
            </p>
          </div>
        </v-ons-card>
      </vs-on-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
//TODO vue grille avec item grisé/vue switch
export default {
  data() {
    return {
      name: "",
      switchOn: true,
      items: [
        { text: "Vue", value: "Vue" },
        { text: "React", value: "React" },
        { text: "Angular", value: "Angular" }
      ],
      selectedItem: "Vue",
      vegetables: ["Apples", "Bananas", "Oranges"],
      selectedVegetable: "Bananas",
      colors: ["Red", "Green", "Blue"],
      checkedColors: ["Green", "Blue"],
      volume: 25
    };
  },
  computed:{
    species(){
      let species=[...new Set(this.$store.state.arboretum.species)]
      return species
    },
    specieList(){
      return this.$store.state.arboretum.species
    }
  },
  methods:{
    getIdentificationNumber(specie){
      return this.specieList.filter(v=>v==specie).length
    },
    getImageUrl(specie){
      let genus = specie.split(' ')[0]
      let species= specie.split(' ')[1]
      let formated=species.charAt(0).toUpperCase()+species.slice(1)
      return './Feuilles/'+genus+formated+'.jpg'
    }
  }
};
</script>

<style scoped>
.right-icon {
  margin-left: 10px;
}
.right-label {
  color: #666;
}
</style>
