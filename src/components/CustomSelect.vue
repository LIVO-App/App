<template>
  <ion-select
    :value="selected_option"
    @input="$emit('update:selected_option', $event.target.value)"
    :label="label"
    :aria-label="label"
    justify="start"
    :placeholder="placeholder"
    class="ion-padding"
    fill="outline"
    :disabled="disabled"
  >
    <!-- interface="popover" è più carino, ma da warnings-->
    <ion-select-option
      v-for="option in props.list"
      :value="option.id"
      :key="option.id"
      :aria-label="getCompleteName(option)"
    >
      {{ getCompleteName(option) }}
    </ion-select-option>
  </ion-select>
</template>

<script setup lang="ts">
import { IonSelect, IonSelectOption, IonLabel } from "@ionic/vue";
import { PropType } from "vue";

const props = defineProps({
  selected_option: {
    type: String,
  },
  list: {
    type: Object as PropType<
      {
        id: any;
      }[]
    >,
    required: true,
  },
  label: String,
  aria_label: String,
  placeholder: String,
  getCompleteName: {
    type: Function,
    default: (option: any) => option.id,
  },
  disabled: Boolean,
});
defineEmits(["update:selected_option"]);
</script>

<style>
</style>