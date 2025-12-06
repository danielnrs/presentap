<template>
  <!-- Overlay Blur -->
  <transition name="overlay-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('cancel')"></div>
  </transition>

  <!-- Modal Box -->
  <transition name="modal-zoom">
    <div v-if="isOpen" class="modal-container">
      <h2 class="modal-title">Konfirmasi</h2>
      <p class="modal-message">{{ message }}</p>
      <div class="modal-actions">
        <button @click="$emit('confirm')" class="btn-confirm">Ya, Hapus</button>
        <button @click="$emit('cancel')" class="btn-cancel">Batal</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  message: String,
});

defineEmits(["confirm", "cancel"]);
</script>

<style scoped>
/* 🔹 Overlay dengan Blur */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  z-index: 999;
}

/* 🔹 Modal Container */
.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  opacity: 1;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.modal-message {
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* 🔹 Tombol */
.btn-confirm {
  background-color: #f1959f;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-cancel {
  background-color: #b3b3b4;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-confirm:hover {
  background-color: #c81d2e;
}

.btn-cancel:hover {
  background-color: #3b3e40;
}

/* 🔥 Transisi Overlay (Blur) */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* 🔥 Transisi Modal */
.modal-zoom-enter-active,
.modal-zoom-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-zoom-enter-from,
.modal-zoom-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>