<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content>
          <ion-list id="menu-list">
            <ion-list-header class="ion-padding-bottom">
              <ion-img
                :src="image"
                alt="LIVO Campus Logo"
                style="height: 90px"
              ></ion-img>
            </ion-list-header>

            <ion-menu-toggle :auto-hide="false">
              <template
                v-if="
                  (user = store.state.user ?? User.getLoggedUser()) != undefined
                "
              >
                <ion-item
                  v-for="(p, i) in getMenu(castToUser(user))"
                  :key="i"
                  @click="selectTitle(castToUser(user), i)"
                  router-direction="root"
                  :router-link="{ name: p.url_names[castToUser(user).user][0] }"
                  lines="none"
                  :detail="false"
                  class="hydrated"
                  :class="{ selected: menu.index === i }"
                >
                  <ion-icon
                    aria-hidden="true"
                    class="ion-padding-end"
                    :ios="getIcon(p.icon_ref).ios"
                    :md="getIcon(p.icon_ref).md"
                  ></ion-icon>
                  <ion-label text-wrap>{{
                    getCurrentElement(menu.order[castToUser(user).user][i])
                  }}</ion-label>
                </ion-item>
              </template>
            </ion-menu-toggle>
          </ion-list>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane,
} from "@ionic/vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import { Menu, MenuItem, User } from "./types";
import { getCurrentElement, getIcon } from "./utils";

const image = computed(() => require("./assets/Logo_LIVO_Campus_POS_RGB.png"));
const castToUser = (user: User | undefined) => user as User;
const getMenu = (user: User) => {
  const complete_menu: MenuItem[] = [];

  let tmp_item: MenuItem | undefined;

  for (const item_title of menu.order[user.user]) {
    tmp_item = menu.items[item_title];
    if (tmp_item != undefined) {
      complete_menu.push(tmp_item);
    }
  }

  return complete_menu;
};
const selectTitle = (user: User, index: number) => {
  store.state.menu.index = index;
  sessionStorage.setItem("selected_item", menu.order[user.user][index]);
};

const store = useStore();
const $route = useRoute();
const menu: Menu = store.state.menu;
const user = User.getLoggedUser();
const items_titles = Object.keys(menu.items);
const selected_item = sessionStorage.getItem("selected_item");

let tmp_index = -1;
let count = 0;

if (user != undefined) {
  if (selected_item != undefined) {
    tmp_index = menu.order[user.user].findIndex((a) => a == selected_item);
  } else if ($route.name !== undefined) {
    do {
      tmp_index = menu.items[items_titles[count++]].url_names[
        user.user
      ].findIndex((a) => a == $route.name);
    } while (tmp_index == -1 && count < items_titles.length);
  }
  store.state.menu.index =
    tmp_index != -1
      ? tmp_index
      : menu.order[user.user].findIndex(
          (a) => a == menu.default_item[user.user]
        );
  sessionStorage.setItem("selected_item", menu.order[user.user][tmp_index]);
}
</script>

<style scoped>
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color));
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

ion-menu.md ion-list {
  padding: 20px 0;
}

ion-menu.md ion-note {
  margin-bottom: 30px;
}

ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
}

ion-menu.md ion-list#menu-list {
  border-bottom: 1px solid var(--ion-color-step-150, #d7d8da);
}

ion-menu.md ion-list#menu-list ion-list-header {
  font-size: 22px;
  font-weight: 600;

  min-height: 20px;
}

ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
}

ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}

ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 20px 0 0 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 20px;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

ion-menu.ios ion-list-header,
ion-menu.ios ion-note {
  padding-left: 16px;
  padding-right: 16px;
}

ion-menu.ios ion-note {
  margin-bottom: 8px;
}

ion-note {
  display: inline-block;
  font-size: 16px;

  color: var(--ion-color-medium-shade);
}

ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
