<template>
  <v-ons-page>
    <v-ons-list-header>Mon arboretum</v-ons-list-header>

    <v-ons-list>
      <vs-on-list-item>
        <v-ons-card>
          <div class="title">Chêne rouvre</div>
          <div class="content">
            <p>Bravo vous avez identifier un chêne rouvre.</p>
            <p>
             Vous avez identifié un chêne rouvre, identifier en cinq pour passer au niveau suivant !
              <v-ons-progress-bar :value="20" secondary-value="100"></v-ons-progress-bar>
            </p>
          </div>
        </v-ons-card>
      </vs-on-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
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
