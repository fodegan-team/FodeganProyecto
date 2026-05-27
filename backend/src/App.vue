<template>
  <router-view />
</template>

<script setup>
// App.vue — Root component FODEGAN
// Las vistas se renderizan aquí a través del router
</script>

<style>
/* ── Estilos globales ── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background: #1B4332;
}

/* Prevenir selección de texto en elementos de UI */
button, a {
  -webkit-user-select: none;
  user-select: none;
}
</style>