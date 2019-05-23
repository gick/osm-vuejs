<template>
	<div style="display:inline-block;" class="file-upload-form">
		<v-ons-button :disabled="disabled" @click="$refs.pictureInput.click()"
			>Photo</v-ons-button
		>
		<input
			type="file"
			@change="rotateImage"
			ref="pictureInput"
			style="display:none"
			accept="image/*;capture=camera"
		/>
	</div>
</template>
<script>
const imageFileToBase64 = require('image-file-to-base64-exif')

export default {
	data() {
		return { imageData: '' } // we will store base64 format of image in this string
	},
	props: ['disabled'],
	methods: {
		rotateImage: function(event) {
			var imageFile = event.target.files[0]
      imageFileToBase64(imageFile,600,600,0.8)
        .then(function(base64){
          this.$emit('image',base64)
        }.bind(this))
			
		},
	}
}
</script>
