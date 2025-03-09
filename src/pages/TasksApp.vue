<template>
  <q-page class="flex-grow">
    <tasks-view />
  </q-page>
</template>

<script setup>
import TasksView from 'src/components/TasksView.vue'
</script>
<style>
::-webkit-scrollbar {
  display: none;
}
</style>
