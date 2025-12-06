<script>
export default {
  name: "Card",
  props: {
    title: String,
    isWide: Boolean,
  },
};
</script>

<template>
  <div class="card" :class="{ wide: isWide }">
    <h2 class="card-header">{{ title }}</h2>
    <slot></slot> <!-- Slot untuk menampilkan konten dari parent -->
  </div>
</template>

<style scoped>
.card {
  background: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.card.wide {
  grid-column: span 2;
}
.card-header {
  font-weight: bold;
  font-size: 20px;
}
</style>
