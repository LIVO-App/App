<template>
  <div
    v-if="hasNoData(data_ref)"
    :class="{
      background:
        colors?.background != undefined &&
        getIonicColor(colors?.background) == undefined,
    }"
  >
    <ionic-element
      v-model:element="emptiness_message_ref"
      @execute_link="$emit('execute_link')"
      @signal_event="$emit('signal_event')"
    />
  </div>
  <ion-grid v-else class="ion-margin">
    <ion-row
      v-if="first_row_ref != undefined"
      class="row header ion-text-center"
    >
      <ion-col
        v-for="(cell, i) in first_row_ref"
        :key="cell.id"
        :size="
          has_fr_custom_sizes
            ? cell.size != undefined
              ? '' + cell.size
              : undefined
            : Array.isArray(sizes)
            ? '' + sizes[i]
            : undefined
        "
        class="col"
      >
        <ionic-element
          :key="cell.id"
          :element="first_row_ref[i]"
          @execute_link="$emit('execute_link')"
          @signal_event="$emit('signal_event')"
        />
      </ion-col>
    </ion-row>
    <template
      v-for="row_order in data_ref.cards[''] != undefined
        ? [
            {
              key: '',
              title: getCustomMessage('', ''),
            },
          ]
        : data_ref.order"
    >
      <ion-row
        :key="row_order.key + '_divider'"
        v-if="data_ref.cards[''] == undefined && show_table_dividers"
      >
        <ion-col class="col">
          <ionic-element
            :key="row_order.key"
            :element="row_order.title"
            @execute_link="$emit('execute_link')"
            @signal_event="$emit('signal_event')"
          />
        </ion-col>
      </ion-row>
      <ion-row
        v-for="(row, i) in data_ref.cards[row_order.key]"
        :key="row_order.key + '_' + row.id"
        class="row ion-text-center cell_primary"
      >
        <ion-col
          v-if="first_col_ref != undefined"
          :size="
            has_fc_custom_sizes
              ? first_col_ref[row_order.key][i].size != undefined
                ? '' + first_col_ref[row_order.key][i].size
                : undefined
              : Array.isArray(sizes)
              ? '' + sizes[0]
              : undefined
          "
          class="col header"
        >
          <ionic-element
            :key="first_col_ref[row_order.key][i].id"
            :element="first_col_ref[row_order.key][i]"
            @execute_link="$emit('execute_link')"
            @signal_event="$emit('signal_event')"
          />
        </ion-col>
        <ion-col
          v-for="(cell, j) in data_ref.cards[row_order.key][i].content"
          :key="cell.id"
          :size="
            Array.isArray(sizes)
              ? '' + sizes[j + (first_col_ref != undefined ? 1 : 0)]
              : sizes[row_order.key] != undefined &&
                sizes[row_order.key][row.id] != undefined &&
                sizes[row_order.key][row.id][j] != undefined
              ? '' + sizes[row_order.key][row.id][j]
              : undefined
          "
          class="col"
        >
          <ionic-element
            v-model:element="
              castTableElementArray(data_ref.cards[row_order.key][i].content)[j]
            "
            @execute_link="$emit('execute_link')"
            @signal_event="$emit('signal_event')"
          />
        </ion-col>
      </ion-row>
    </template>
  </ion-grid>
</template>

<script setup lang="ts">
import {
  CardsGridElements,
  CardsListElements,
  Classes,
  Colors,
  CustomElement,
  GeneralCardSubElements,
  GeneralTableCardElements,
  OrderedCardsList,
  TableElement,
  TmpList,
} from "@/types";
import {
  adjustColor,
  canArrayVModel,
  canCardListVModel,
  canListVModel,
  canVModel,
  getCustomMessage,
  getIonicColor,
  hasNoData,
} from "@/utils";
import { IonGrid, IonRow, IonCol } from "@ionic/vue";
import { PropType, WatchStopHandle, ref, watch } from "vue";

const castTableElementArray = (e: any) => e as TableElement[];
const hasFirstColSizes = () => {
  let keys: string[];
  let count = 0;
  let has_sizes = false;

  if (props.first_col != undefined) {
    keys = Object.keys(props.first_col);
    while (
      !(has_sizes =
        props.first_col[keys[count]].find((e) => e.size != undefined) !=
        undefined) &&
      ++count < keys.length
    );
  }

  return has_sizes;
};
const checkVModel = () =>
  props.data.order.find((order_element) => canVModel(order_element.title)) !=
    undefined || canCardListVModel(props.data.cards);
const addListeners = () => {
  watch(
    () => props.data,
    (value) => {
      data_ref.value = value;
    }
  );
  watch(
    () => data_ref.value,
    (value) => {
      emit("update:data", value);
    }
  );
};

const props = defineProps({
  emptiness_message: {
    type: Object as PropType<CustomElement>,
    required: true,
  },
  data: {
    type: Object as PropType<OrderedCardsList<GeneralTableCardElements>>,
    required: true,
  },
  show_table_dividers: {
    type: Boolean,
    default: false,
  },
  first_row: {
    type: Array<TableElement>,
  },
  first_col: {
    //No cell (0,0)
    type: Object as PropType<TmpList<TableElement[]>>,
  },
  sizes: {
    type: [Array, Object] as PropType<
      number[] | TmpList<TmpList<(number | undefined)[]>>
    >,
    required: true,
  },
  colors: Object as PropType<Colors<GeneralCardSubElements>>, // TODO (5): vedere dove applicare colors e classes alla tabella
  classes: Object as PropType<Classes<CardsListElements | CardsGridElements>>,
});

const emit = defineEmits([
  "execute_link",
  "signal_event",
  "update:emptiness_message",
  "update:data",
  "update:first_row",
  "update:first_col",
]);

const emptiness_message_ref = ref(props.emptiness_message);
const data_ref = ref(props.data);
const first_row_ref = ref(props.first_row);
const first_col_ref = ref(props.first_col);
const has_fr_custom_sizes =
  props.first_row != undefined &&
  props.first_row.find((e) => e.size != undefined) != undefined;
const has_fc_custom_sizes = hasFirstColSizes();

let stopWatch: WatchStopHandle;

if (emptiness_message_ref.value.colors == undefined) {
  emptiness_message_ref.value.colors = {};
}
emptiness_message_ref.value.colors.text = adjustColor(
  props.emptiness_message?.colors?.text,
  props.colors?.text
);

if (canVModel(props.emptiness_message)) {
  watch(
    () => props.emptiness_message,
    (value) => {
      emptiness_message_ref.value = value;
    }
  );
  watch(
    () => emptiness_message_ref.value,
    (value) => {
      emit("update:emptiness_message", value);
    }
  );
}
if (hasNoData(props.data)) {
  stopWatch = watch(
    () => props.data,
    (value) => {
      data_ref.value = value;
      if (!hasNoData(value) && checkVModel()) {
        addListeners();
        stopWatch();
      }
    }
  );
} else if (checkVModel()) {
  addListeners();
}
if (props.first_row != undefined && canArrayVModel(props.first_row)) {
  watch(
    () => props.first_row,
    (value) => {
      first_row_ref.value = value;
    }
  );
  watch(
    () => first_row_ref.value,
    (value) => {
      emit("update:first_row", value);
    }
  );
}
if (props.first_col != undefined && canListVModel(props.first_col)) {
  watch(
    () => props.first_col,
    (value) => {
      first_col_ref.value = value;
    }
  );
  watch(
    () => first_col_ref.value,
    (value) => {
      emit("update:first_col", value);
    }
  );
}
</script>

<style>
.cell_primary {
  color: var(--ion-color-primary);
}

.header .col {
  background-color: var(--ion-color-primary);
  color: white;
}

.col {
  border: solid 1px var(--ion-color-dark);
  border-bottom-style: none;
  border-right-style: none;
}

.col:last-child {
  border-right: solid 1px var(--ion-color-dark);
}

.row:last-child .col {
  border-bottom: solid 1px var(--ion-color-dark);
}

.row:first-child .col:first-child {
  border-top-left-radius: 10px;
}

.row:first-child .col:last-child {
  border-top-right-radius: 10px;
}

.row:last-child .col:first-child {
  border-bottom-left-radius: 10px;
}

.row:last-child .col:last-child {
  border-bottom-right-radius: 10px;
}
</style>
