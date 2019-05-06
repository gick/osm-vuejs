<template>
  <div>
    <p v-show="timer!=null">
      Temps restant : {{ hours2digits }}:{{ minutes2digits }}:{{ secondes2digits }}
      <v-ons-progress-circular :value=progress></v-ons-progress-circular>
    </p>
    <button v-show="timer==null" @click="play">Démarrer la mission</button>  
  </div>
 
</template>
	
<script>

export default {
  data() {
    return {
          hours : 0,
          minutes : 0,
          secondes : 0,
          totalSecondes2 : 0,
          timer: null,
    };
  },
  props : ['totalSecondes'],
  computed : {
    progress() {
      return  (this.totalSecondes2 / this.totalSecondes * 100)
    },
    hours2digits() {
      return ("0" + this.hours).slice(-2);
    },
    minutes2digits() {
      return ("0" + this.minutes).slice(-2);
    },
    secondes2digits() {
      return ("0" + this.secondes).slice(-2);
    }
  },
  methods: {
  	play() {	
          this.totalSecondes2 = this.totalSecondes
          this.timer = setInterval( () => {
          this.totalSecondes2 -= 1;
          this.hours = Math.floor(this.totalSecondes2 / (60 * 60));
          this.minutes = Math.floor(this.totalSecondes2 / 60) - this.hours * 60 ;
          this.secondes = Math.floor(this.totalSecondes2) - this.minutes * 60 - this.hours * 60 * 60;
          if (this.totalSecondes2 <= 0) {
            this.$emit("timeout")
            clearInterval(this.timer);
          }
        }, 1000);       
    },
  }
};
</script>
