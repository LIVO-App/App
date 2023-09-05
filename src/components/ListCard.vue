<template>
  <ion-card :color="colors?.background" :class="{
    '--ion-no-border': colors?.external_borders == undefined
  }">
    <ion-card-header v-if="props.title != undefined && props.title.text != ''">
      <ion-card-title
        :color="props.title.color ?? colors?.text"
        >{{ props.title.text }}</ion-card-title
      > <!-- Da sistemare: non cambia colore -->
      <ion-card-subtitle
        v-if="props.subtitle != undefined"
        :color="props.subtitle.color ?? colors?.text"
        class="ion-text-center"
        >{{ props.subtitle.text }}</ion-card-subtitle
      >
    </ion-card-header>
    <ion-card-content style="overflow-y: auto">
      <ion-list class="ion-no-padding">
        <template v-if="Object.keys(props.cards_list.cards).length === 0">
          <ion-item :color="colors?.background" class="ion-no-padding">
            <ion-label
              class="ion-text-wrap ion-text-center"
              :color="emptiness_message.color ?? colors?.text"
              >{{ props.emptiness_message.text }}</ion-label
            >
          </ion-item>
        </template>
        <template v-else-if="props.cards_list.cards[''] != undefined">
          <ion-item
            v-if="props.cards_list.cards[''].length === 0"
            :color="colors?.background"
            class="ion-no-padding"
          >
            <ion-label
              class="ion-text-wrap ion-text-center"
              :color="emptiness_message.color ?? colors?.text"
              >{{ props.emptiness_message.text }}</ion-label
            >
          </ion-item>
          <template v-else>
            <template v-for="card in props.cards_list.cards['']" :key="card.id">
              <ion-item :lines="colors?.list_borders != undefined ? 'inset' : 'none'" :color="colors?.background" class="ion-no-padding">
                <course-card
                  v-if="isCourse(card)"
                  @execute_link="$emit('execute_link')"
                  @signal_event="$emit('signal_event')"
                  :credits="card.credits"
                  :content="card.content"
                  :enrollment="card.enrollment"
                  :url="card.url"
                  :method="card.method"
                />
                <general-card
                  v-else-if="isGeneral(card)"
                  @execute_link="$emit('execute_link')"
                  @signal_event="$emit('signal_event')"
                  :id="card.id"
                  :title="
                    card.title != undefined
                      ? {
                          text: card.title.text,
                          color: card.title.color ?? colors?.text,
                        }
                      : undefined
                  "
                  :subtitle="
                    card.subtitle != undefined
                      ? {
                          text: card.subtitle.text,
                          color: card.subtitle.color ?? colors?.text,
                        }
                      : undefined
                  "
                  :content="card.content"
                  :side_element="card.side_element"
                  :selected="card.selected"
                  :link="card.link"
                  :background_color="colors?.background"
                  :borders="colors?.cards_borders"
                />
              </ion-item>
            </template>
          </template>
        </template>
        <template v-else>
          <ion-item-group
            v-for="ordered_cards in props.cards_list.order"
            :key="'group-' + ordered_cards.key"
          >
            <ion-item-divider :color="colors?.dividers ?? 'light'">
              <ion-label
                class="ion-padding-end item-text-wrap"
                :color="actual_text_divider_color"
                >{{ ordered_cards.title.text }}</ion-label
              >
            </ion-item-divider>
            <ion-item
              v-if="props.cards_list.cards[ordered_cards.key].length === 0"
              :color="colors?.background"
              class="ion-no-padding"
            >
              <ion-label
                class="ion-text-wrap ion-text-center"
                :color="emptiness_message.color ?? colors?.text"
                >{{ emptiness_message.text }}</ion-label
              >
            </ion-item>
            <template v-else>
              <template
                v-for="card in props.cards_list.cards[ordered_cards.key]"
                :key="card.id"
              >
                <ion-item :lines="colors?.list_borders != undefined ? 'inset' : 'none'" :color="colors?.background" class="ion-no-padding">
                  <course-card
                    v-if="isCourse(card)"
                    @execute_link="$emit('execute_link')"
                    @signal_event="$emit('signal_event')"
                    :credits="card.credits"
                    :content="card.content"
                    :enrollment="card.enrollment"
                    :url="card.url"
                    :method="card.method"
                  />
                  <general-card
                    v-else-if="isGeneral(card)"
                    @execute_link="$emit('execute_link')"
                    @signal_event="$emit('signal_event')"
                    :id="card.id"
                    :title="
                      card.title != undefined
                        ? {
                            text: card.title.text,
                            color: card.title.color ?? colors?.text,
                          }
                        : undefined
                    "
                    :subtitle="
                      card.subtitle != undefined
                        ? {
                            text: card.subtitle.text,
                            color: card.subtitle.color ?? colors?.text,
                          }
                        : undefined
                    "
                    :content="card.content"
                    :side_element="card.side_element"
                    :selected="card.selected"
                    :link="card.link"
                    :background_color="colors?.background"
                    :borders="colors?.cards_borders"
                  />
                </ion-item>
              </template>
            </template>
          </ion-item-group>
        </template>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonItem,
} from "@ionic/vue";
import { PropType } from "vue";
import { CustomText, OrderedCardsList } from "../types";
import { isGeneral, isCourse } from "../utils";

const props = defineProps({
  title: Object as PropType<CustomText>,
  subtitle: Object as PropType<CustomText>,
  emptiness_message: {
    type: Object as PropType<CustomText>,
    required: true,
  },
  cards_list: {
    type: Object as PropType<OrderedCardsList>,
    required: true,
  },
  colors: Object as PropType<{
    background: string,
    text: string,
    dividers_text: string,
    dividers: string,
    external_borders: string,
    cards_borders: string,
    list_borders: string
  }>
});

defineEmits(["execute_link", "signal_event"]);

const actual_text_divider_color = props.colors?.dividers_text ?? props.colors?.background;
</script>


<style scoped>
ion-card {
  max-height: 100%;
  display: flex;
  flex-direction: column;
}
ion-card-content {
  max-height: 100%;
  position: relative;
  overflow: hidden;
  overflow-y: auto;
}
ion-card-title {
  font-size: 32px;
}
</style>