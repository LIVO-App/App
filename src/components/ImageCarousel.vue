<template>
  <swiper
    v-if="images.length > 1"
    :modules="modules"
    :slides-per-view="1"
    navigation
    :autoplay="{
      delay: 4000,
      disableOnInteraction: false,
    }"
  >
    <swiper-slide v-for="(image, index) in images" :key="index">
      <div class="ion-text-center">
        <ionic-element
          v-if="show_name"
          :element="getCustomMessage(image.name, image.name)"
        />
        <ion-img
          :src="
            isFile(image)
              ? require('@/assets/' + language + '_to_load.png')
              : image.url
          "
          :alt="image.name"
          style="height: 150px"
        />
      </div>
    </swiper-slide>
  </swiper>
  <div v-else-if="images.length == 1" class="ion-text-center">
    <ionic-element
      v-if="show_name"
      :element="getCustomMessage(images[0].name, images[0].name)"
    />
    <ion-img
      :src="
        isFile(images[0])
          ? require('@/assets/' + language + '_to_load.png')
          : images[0].url
      "
      :alt="images[0].name"
      style="height: 150px"
    />
  </div>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Autoplay } from "swiper/modules";
import { ImageDescriptor } from "@/types";
import { PropType } from "vue";
import { getCurrentLanguage, getCustomMessage } from "@/utils";
import { IonImg } from "@ionic/vue";

const isFile = (image: ImageDescriptor | File): image is File =>
  image instanceof File;

defineProps({
  images: {
    type: Array as PropType<(ImageDescriptor | File)[]>,
    required: true,
  },
  show_name: {
    type: Boolean,
    default: false,
  },
});

const language = getCurrentLanguage();
const modules = [Navigation, Autoplay];
</script>
