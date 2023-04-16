<template>
    <ion-header collapse="condense">
        <ion-toolbar>
            <ion-title size="large" class="ion-text-center">{{ props.title }}</ion-title>
            <ion-title size="small" class="ion-text-center">{{ props.subtitle }}</ion-title>
        </ion-toolbar>
    </ion-header>
</template>

<script setup lang="ts">

const props = defineProps(["title","subtitle"]);

</script>

<style scoped></style>