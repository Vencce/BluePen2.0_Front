<script setup>
import EnderecoManager from '@/components/EnderecoManager.vue';
</script>

<template>
  <div class="endereco-manager-page">
    <EnderecoManager />
  </div>
</template>

<style scoped>
.endereco-manager-page {
  padding-top: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - var(--header-height, 0px) - var(--footer-height, 0px));
}
</style>