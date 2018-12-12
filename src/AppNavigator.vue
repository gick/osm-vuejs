<template>
  <v-ons-navigator swipeable swipe-target-width="50px"
    :page-stack="$store.state.navigator.stack"
    :pop-page="storePop"
    :options="{animation:'slide-ios'}"
    @postpush="showPopTip"
    :class="{ 'border-radius': borderRadius }"
  ></v-ons-navigator>
</template>

<script>
var osmAuth = require('osm-auth');
import AppSplitter from './AppSplitter.vue';
import Carousel from './pages/Carousel.vue'
export default {
  beforeCreate() {
        this.$store.commit('navigator/push', AppSplitter);
                var auth = osmAuth({
            oauth_secret: 'ycJOK6xrlW0tPXb280k1VLkH4zGlsaGyTPm4vGvr',
            oauth_consumer_key: '1zPARMhKbBJfy6lZa9Jt3SvXOM4D3bxr1s3pMly0',
            auto:true,
        });
            auth.authenticate(function() {
                auth.xhr({
                method: 'GET',
                path: '/api/0.6/user/details'
            }, (err,res)=>{var user =res.getElementsByTagName('user')[0]
              let userObject={name:user.getAttribute('display_name'),id:user.getAttribute('id')}
            this.$store.commit('user/set',userObject)
            
            });
            }.bind(this));


  },
  data() {
    return {
      shutUp: this.md
    }
  },
  computed: {
    pageStack() {
      return this.$store.state.navigator.stack;
    },
    options() {
      return this.$store.state.navigator.options;
    },
    borderRadius() {
      return new URL(window.location).searchParams.get('borderradius') !== null;
    }
  },
  methods: {
    storePop() {
      this.$store.commit('navigator/pop');
    },
    showPopTip() {
      !this.shutUp && this.$ons.notification.toast({
        message: 'Try swipe-to-pop from left side!',
        buttonLabel: 'Shut up!',
        timeout: 2000
      }).then(i => this.shutUp = i === 0);
    }
  }
};
</script>
