<template>
  <button
    :class="['base-button', { disabled: disabled }]"
    :disabled="disabled"
    @click="handleClick"
  >
    <div class="button-content">
      <slot name="icon"></slot>
      <span class="button-text"><slot></slot></span>
    </div>
  </button>
</template>

<script setup>
const props = defineProps({
  type: { type: String, default: "button" },
  disabled: { type: Boolean, default: false }
});

const emit = defineEmits(["click"]);

const handleClick = (event) => {
  if (!props.disabled) {
    emit("click", event);
  }
};
</script>

<style scoped>
/* Style dasar button */
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px; /* Ubah ukuran tombol langsung di sini */
  font-size: 14px; /* Ubah ukuran teks di sini */
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;
  background-color: #007bff;
  color: white;
}

/* Membuat ikon dan teks sejajar rapi */
.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px; /* Jarak antara ikon dan teks */
}

/* Hover efek */
.base-button:hover {
  opacity: 0.85;
}

/* Disabled button */
.base-button.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
