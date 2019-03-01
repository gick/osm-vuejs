<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left">
        <v-ons-back-button>Back</v-ons-back-button>
      </div>
    </v-ons-toolbar>

    <v-ons-list-header>Clef d'identification</v-ons-list-header>

    <v-ons-list>
      <vs-on-list-item>
          <div class="center">
          <identification-element v-for='item in identificationSources' :identification='item'></identification-element>
      </div>
      </vs-on-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
import identificationElement from './identificationKey/identificationElement.vue'
export default {
    beforeCreate(){
        axios.get("http://localhost:8000/listProp")
            .then(function(results){
                this.identificationSources=results.data
            }.bind(this))
    },
    components:{
        identificationElement
    },
    data() {
    return {
      identificationSources: [],
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
