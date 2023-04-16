import { ComponentCustomProperties } from "vue";
import { Store } from "vuex";
import { Menu } from "./types";

declare module '@vue/runtime-core' {
  //Declare your own store states
  interface State {
    menu: Menu,
    menuIndex: number,
    language: string,
    role: string
  }

  interface ComponentCustomProperties {
    $store: Store<State>
  }
}