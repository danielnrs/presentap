<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

const route = useRoute();

// Mengecek apakah rute saat ini sesuai dengan rute 'to'
const isActive = computed(() => route.path === props.to);
</script>

<template>
  <li>
    <NuxtLink :to="to" class="menu-item" :class="{ active: isActive }">
      <span>{{ label }}</span>
    </NuxtLink>
  </li>
</template>

<style scoped>
/* Styling untuk item menu */
.menu-item {
  display: block;
  position: relative;
  padding: 15px 20px;
  text-decoration: none;
  color: #555;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  transition: color 0.3s ease;
  font-size: 14px;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  background-color: #caf4cc;
  transition: width 0.6s ease;
  z-index: 0;
}

.menu-item:hover::before {
  width: 100%;
}

.menu-item:hover {
  color: #1f2022;
}

.menu-item.active {
  color: #1f2022;
  font-weight: bold;
}

.menu-item.active::before {
  width: 100%;
}

.menu-item span {
  position: relative;
  z-index: 1;
}
</style>
