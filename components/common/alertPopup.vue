<template>
  <div v-if="visible" class="alert-popup" :class="type">
    <span>{{ message }}</span>
    <button @click="close">✖</button>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  message: String,
  type: { type: String, default: "success" }, // "success" | "error"
  duration: { type: Number, default: 3000 }, // 3 detik
});

const visible = ref(false);

watch(
  () => props.message,
  (newMessage) => {
    if (newMessage) {
      visible.value = true;
      setTimeout(() => (visible.value = false), props.duration);
    }
  }
);

const close = () => {
  visible.value = false;
};
</script>

<style scoped>
.alert-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #28a745;
  color: white;
  padding: 12px 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;
}
.alert-popup.error {
  background: #dc3545;
}
button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
