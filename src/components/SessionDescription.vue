<template>
  <ion-grid>
    <ion-row>
      <ion-col size="auto">
        <ion-icon
          @click="$router.go(-1)"
          aria-hidden="true"
          class="ion-padding-end"
          :ios="getIcon('arrow_back').ios"
          :md="getIcon('arrow_back').md"
        ></ion-icon>
        <!-- Da sistemare: freccetta -->
      </ion-col>
      <ion-col size="auto">
        <ionic-element :element="head_content.title" />
      </ion-col>
      <ion-col size="auto">
        <ionic-element :element="head_content.subtitle" />
      </ion-col>
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
  LearningSession,
  LearningContextSummary,
} from "@/types";
import { executeLink, getIcon } from "@/utils";
import { IonGrid, IonRow, IonCol, IonIcon } from "@ionic/vue";
import { PropType } from "vue";
import { useRouter } from "vue-router";

const $router = useRouter();
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  learning_context: Object as PropType<LearningContextSummary>,
});
let head_content: GeneralCardElements;

await executeLink("/v1/learning_sessions/" + props.id, async (response) => {
  head_content = await new LearningSession(response.data.data).toCard(
    undefined,
    props.learning_context,
    true,
    false
  );
});
</script>

<style>
</style>