<template>
  <v-ons-page modifier="white">
    <v-ons-list-title>Access</v-ons-list-title>
    <v-ons-list>
      <v-ons-list-item
        v-for="(item, index) in access"
        :key="item.title"
        :modifier="md ? 'nodivider' : ''"
        @click="loadView(index)"
      >
        <div class="left">
          <v-ons-icon fixed-width class="list-item__icon" :icon="item.icon"></v-ons-icon>
        </div>
        <div class="center">{{ item.title }}</div>
      </v-ons-list-item>
      <v-ons-list-item @click="logout">Logout</v-ons-list-item>
      <v-ons-list-item @click="admin">Admin</v-ons-list-item>
    </v-ons-list>
  </v-ons-page>
</template>

<script>
import Admin from "./Admin.vue";
export default {
  methods: {
    loadView(index) {
      this.$store.commit("tabbar/set", index + 1);
      this.$store.commit("splitter/toggle");
    },
    loadLink(url) {
      window.open(url, "_blank");
    },
    logout() {
      this.$store.dispatch("user/logout");
      this.$store.commit("splitter/toggle");
    },
    admin() {
      this.$store.commit("navigator/push", {
        extends: Admin,
        data() {
          return {
            toolbarInfo: {
              backLabel: "Home",
              title: "key"
            }
          };
        }
      });
      this.$store.commit("splitter/toggle");

    }
  },
  data() {
    return {
      access: [
        {
          title: "Mission en cours",
          icon: "ion-home"
        },
        {
          title: "Mon arboretum",
          icon: "ion-leaf"
        },
        {
          title: "Mes relevés",
          icon: "ion-edit"
        },
        {
          title: "Folia",
          icon: "ion-search"
        }
      ]
    };
  }
};
</script>

<style scoped>
.profile-pic {
  width: 100%;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  color: rgba(0, 0, 0, 0.56);
  padding-bottom: 8px;
}
.page--material .profile-pic {
  background-color: #f6f6f6;
}

.profile-pic > img {
  display: block;
  max-width: 100%;
}
</style>

<style>
.page--material__background.page--white__background {
  background-color: #fff;
}
</style>
