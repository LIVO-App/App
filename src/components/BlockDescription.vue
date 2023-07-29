<template>
  <ion-grid>
    <ion-row>
      <ion-col size="auto">
        <ion-icon
          @click="$router.go(-1)"
          aria-hidden="true"
          class="ion-padding-end"
          :ios="getIcon(store, 'arrow_back').ios"
          :md="getIcon(store, 'arrow_back').md"
        ></ion-icon>
        <!-- Da sistemare: freccetta -->
      </ion-col>
      <ion-col>
        <ion-title style="wid">{{ head_content.title }}</ion-title>
      </ion-col>
    </ion-row>
    <ion-row>
      <ion-text>{{ head_content.subtitle }}</ion-text>
    </ion-row>
    <ion-row>
      <div class="ion-padding">
        <ionic-element
          v-for="element in head_content.content"
          :key="element.id"
          :element="element"
        ></ionic-element>
      </div>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  GeneralCardElements,
  LearningBlock,
  LearningContextSummary,
} from "@/types";
import { executeLink, getIcon } from "@/utils";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonTitle,
  IonText,
} from "@ionic/vue";
import { AxiosInstance } from "axios";
import { inject, PropType } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const store = useStore();
const $router = useRouter();
const $axios: AxiosInstance | undefined = inject("$axios");
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  learning_context: Object as PropType<LearningContextSummary>,
});
let head_content: GeneralCardElements;

if ($axios != undefined) {
  await executeLink(
    $axios,
    "/v1/learning_blocks/" + props.id,
    async (response) => {
      head_content = await new LearningBlock(response.data.data).toCard(
        $axios,
        store,
        props.learning_context,
        true,
        false
      );
    }
  );
} else {
  console.error("Connection failed");
}
</script>

<style>
</style>