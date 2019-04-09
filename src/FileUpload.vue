<template>
    <div style="display:inline-block;" class="file-upload-form">
      <v-ons-button @click="$refs.file.click()">Photo</v-ons-button>

      <input type="file" @change="previewImage" ref="file" style="display:none"  accept="image/*;capture=camera">
    </div>
</template>
<script>
export default {
  data() {
    return { imageData: "" }; // we will store base64 format of image in this string
  },
  methods: {
    previewImage: function(event) {
      // Reference to the DOM input element
      var input = event.target;
      console.log(input)
      // Ensure that you have a file before attempting to read it
      if (input.files && input.files[0]) {
        // create a new FileReader to read this image and convert to base64 format
        var reader = new FileReader();
        // Define a callback function to run, when FileReader finishes its job
        reader.onload = e => {
          // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
          // Read image as base64 and set to imageData
          this.imageData = e.target.result;
          this.$emit("image", this.imageData);
        };
        // Start the reader job - read file as a data url (base64 format)
        reader.readAsDataURL(input.files[0]);
      }
    }
  }
};
</script>