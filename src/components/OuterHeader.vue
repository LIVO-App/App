<template>
    <ion-header :translucent="true">
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-menu-button color="primary"></ion-menu-button>
            </ion-buttons>
            <ion-title size="large" class="ion-text-center">{{ props.title }}</ion-title>
            <ion-title size="small" class="ion-text-center">{{ props.subtitle }}</ion-title>
        </ion-toolbar>
    </ion-header>
</template>

<script setup lang="ts">

const props = defineProps(["title","subtitle"]);

</script>

<style scoped></style>