<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content>
          <ion-list id="menu-list">
            <ion-list-header class="ion-padding-bottom">
              <router-link
                v-if="user != undefined"
                :to="{ name: getDefautlLink(user.user).name }"
              >
                <ion-img
                  :src="image"
                  alt="LIVO Campus Logo"
                  style="height: 90px"
                />
              </router-link>
              <ion-img
                v-else
                :src="image"
                alt="LIVO Campus Logo"
                style="height: 90px"
              />
            </ion-list-header>

            <ion-menu-toggle :auto-hide="false" :key="trigger">
              <template v-if="user != undefined">
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
import { computed, ComputedRef, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import { Menu, MenuItem, User } from "./types";
import { getCurrentElement, getDefautlLink, getIcon } from "./utils";

const image = computed(() => require("./assets/Logo_LIVO_Path.png"));
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
const changeTitle = () => {
  const items_titles = Object.keys(menu.items);
  const selected_item = sessionStorage.getItem("selected_item");

  let urls: string[] | undefined;
  let tmp_index = -1;
  let count = 0;

  if ($route.name !== undefined && user.value != undefined) {
    console.log("Ciao", selected_item, $route.name);

    if (selected_item != null && selected_item == $route.name) {
      tmp_index = menu.order[user.value.user].findIndex(
        (a) => a == selected_item
      );
      console.log(user.value.user, menu.order[user.value.user], tmp_index);
    } else if ($route.name != "auth" && $route.name != "logout") {
      while (tmp_index == -1 && count < items_titles.length) {
        console.log(
          count,
          items_titles[count],
          menu.items[items_titles[count]].url_names
        );
        urls = menu.items[items_titles[count]].url_names[user.value.user];
        if (urls != undefined) {
          tmp_index = urls.findIndex((a) => a == $route.name);
          console.log("Ciaone", urls, tmp_index);
        }
        count++;
      }
      if (tmp_index != -1) {
        tmp_index = menu.order[user.value.user].findIndex(
          (a) => a == items_titles[count - 1]
        );
        console.log("Ciao", menu.order[user.value.user], tmp_index);
      }
    }
    menu.index =
      tmp_index != -1
        ? tmp_index
        : menu.order[user.value.user].findIndex(
            (a) => a == menu.default_item[(user.value as User).user]
          );
    sessionStorage.setItem(
      "selected_item",
      menu.order[user.value.user][tmp_index]
    );
    trigger.value++;
  }
};

const store = useStore();
const $route = useRoute();
const menu: Menu = store.state.menu;

const trigger = ref(0);
const user: ComputedRef<User | undefined> = computed(
  () => store.state.user ?? User.getLoggedUser()
);

changeTitle();
watch($route, changeTitle);
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
