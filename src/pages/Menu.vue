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
      <v-ons-list-item>Langue &nbsp;
        <select v-model="$i18n.locale">
          <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang">
            {{ lang }}
          </option>
        </select>
      </v-ons-list-item>
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
         window.location.reload()
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
    }
  },
  /*
    admin() {
      this.$ons.notification
        .prompt("Mot de passe", {})
        .then(function(response) {
          if (response == "calamar") {
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
          } else {
            this.$ons.notification.alert("Votre tentative d'intrusion a été enregistré")
          }
        }.bind(this))
        
    
  }}*/
  data() {
    return {langs: ['fr', 'en']};
  },
  computed: {
    gamificationMode() {
      return this.$store.state.user.gamificationMode;
    },
    access() {
      var access = [
        {
          title: this.$t('missionMenu'),
          icon: "ion-home"
        },
        {
          title: this.$t('tracingsMenu'),
          icon: "ion-edit"
        },
        {
          title: "Folia",
          icon: "ion-search"
        }
      ];
      if (this.gamificationMode) {
        var profil = {
          title: this.$t('scoreMenu'),
          icon: "ion-trophy"
        };
        var arboretum = {
          title: this.$t('arboretumMenu'),
          icon: "ion-leaf"
        };
        access.splice(1, 0, profil, arboretum);
      }
      return access;
    }
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
