<template>
  <ion-select
    :value="selected_option"
    @input="$emit('update:selected_option', $event.target.value)"
    :label="label"
    :aria-label="label"
    justify="start"
    :placeholder="placeholder"
    fill="outline"
    :disabled="disabled"
    :class="{
      ...classes?.select,
      'ion-padding': !no_padding,
    }"
  >
    <!-- interface="popover" è più carino, ma da warnings-->
    <ion-select-option
      v-for="option in props.list"
      :value="option.id"
      :key="option.id"
      :aria-label="getCompleteName(option)"
      :class="classes?.option"
    >
      {{ getCompleteName(option) }}
    </ion-select-option>
  </ion-select>
</template>

<script setup lang="ts">
import {
  Classes,
  /*Colors, GeneralSubElements,*/ SelectSubElements,
} from "@/types";
import { IonSelect, IonSelectOption } from "@ionic/vue";
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
  no_padding: Boolean,
  //colors: Object as PropType<Colors<GeneralSubElements>>, //<!-- TODO (7): colori
  classes: Object as PropType<Classes<SelectSubElements>>,
});
defineEmits(["update:selected_option"]);
</script>

<style>
.alert-wrapper {
  max-width: unset !important;
  width: 350px !important; /*<!-- TODO (6): trovare un metodo dinamico */
}
/*.alert-radio-label.sc-ion-alert-md {
  white-space: pre-line !important;
}

.alert-radio-label.sc-ion-alert-ios {
  white-space: pre-line !important;
}*/
</style>