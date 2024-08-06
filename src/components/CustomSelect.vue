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
    interface="popover"
    :class="{
      ...getBreakpointClasses(classes?.select, breakpoint),
      'ion-padding': !no_padding,
    }"
  >
    <!-- interface="popover" è più carino, ma da warnings-->
    <ion-select-option
      v-for="option in props.list"
      :value="option.id"
      :key="option.id"
      :aria-label="getCompleteName(option)"
      :class="getBreakpointClasses(classes?.option, breakpoint)"
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
import { getBreakpoint, getBreakpointClasses } from "@/utils";
import { IonSelect, IonSelectOption } from "@ionic/vue";
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch,
} from "vue";

const updateBreakpoint = () => {
  breakpoint.value = getBreakpoint(window.innerWidth);
};

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

const breakpoint = ref(getBreakpoint(window.innerWidth));

if (props.classes?.select != undefined || props.classes?.option != undefined) {
  onMounted(() =>
    nextTick(() => {
      window.addEventListener("resize", updateBreakpoint);
    })
  );

  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateBreakpoint);
  });

  watch(
    () => window.innerWidth,
    (newWidth) => {
      breakpoint.value = getBreakpoint(newWidth);
    }
  );
}
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
