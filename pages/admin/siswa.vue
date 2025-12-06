<template>
  <div class="container">
    <Sidebar />
    <main class="content">
      <h1 class="title">Siswa</h1>
      <div class="grid">
        <div class="top-cards">
          <Card>
            <div class="search-container">
              <label for="search">Cari Siswa:</label>
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Masukkan Nama atau NIS..." />
            </div>
          </Card>

          <Card>
            <div class="filter-container">
              <label for="kelas">Pilih Kelas:</label>
              <select
                id="kelas"
                v-model="selectedClass"
                class="filter-dropdown">
                <option value="">Semua Kelas</option>
                <option
                  v-for="kelas in availableClasses"
                  :key="kelas"
                  :value="kelas">
                  {{ kelas }}
                </option>
              </select>
            </div>
          </Card>
        </div>

        <Card :isWide="true">
          <div class="title-container">
            <h2 class="card-title">Daftar Siswa</h2>
            <BaseButton class="btn-custom" @click="openForm">
              <template #icon>
                <UserPlusIcon class="icon" />
              </template>
              Tambah Siswa
            </BaseButton>
          </div>

          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>No ID</th>
                  <th>NIS</th>
                  <th @click="sortStudents('name')" style="cursor: pointer;">
                    Nama
                    <span
                      v-if="sortKey === 'name'"
                      >{{ sortOrder === 'asc' ? '▲' : '▼' }}</span
                    >
                  </th>
                  <th>Kelas</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredStudents.length === 0">
                  <td colspan="6" class="empty-message">
                    Tidak ada data siswa tersedia.
                  </td>
                </tr>
                <tr v-for="(student, i) in sortedStudents" :key="student.id">
                  <td>{{ i + 1 }}</td>
                  <td>{{ student.rfid }}</td>
                  <td>{{ student.nis }}</td>
                  <td>{{ student.name }}</td>
                  <td>{{ student.kelas }}</td>
                  <td>
                    <div class="btn-actions">
                      <BaseButton
                        class="btn-edit"
                        @click="openEditForm(student)"
                        >Edit</BaseButton
                      >
                      <BaseButton
                        class="btn-delete"
                        @click="confirmDelete(student.id)"
                        >Hapus</BaseButton
                      >
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  </div>

  <FormSiswa
    :isOpen="isFormOpen"
    :student="editStudent"
    @close="closeForm"
    @studentAdded="fetchStudents" />

  <ConfirmDialog
    :isOpen="isConfirmOpen"
    message="Apakah Anda yakin ingin menghapus siswa ini?"
    @confirm="deleteStudent"
    @cancel="isConfirmOpen = false" />
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
});

import { ref, computed, onMounted } from "vue";
import Sidebar from "@/components/common/SideBar.vue";
import Card from "@/components/common/card.vue";
import BaseButton from "@/components/common/baseButton.vue";
import FormSiswa from "@/components/common/addForm.vue";
import ConfirmDialog from "@/components/common/confirmDialog.vue";
import { UserPlusIcon } from "@heroicons/vue/24/solid";
import axios from "axios";

const students = ref([]);
const selectedClass = ref("");
const searchQuery = ref("");
const isFormOpen = ref(false);
const editStudent = ref(null);
const isConfirmOpen = ref(false);
const sortKey = ref(''); // Kunci untuk sorting
const sortOrder = ref('asc'); // Urutan sorting: 'asc' atau 'desc'
let studentToDelete = null;

const sortStudents = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'; // Ubah urutan
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc'; // Default urutan baru
  }
};
const sortedStudents = computed(() => {
  let studentsToSort = [...filteredStudents.value];
  if (sortKey.value) {
    studentsToSort.sort((a, b) => {
      const modifier = sortOrder.value === 'asc' ? 1 : -1;
      return a[sortKey.value].localeCompare(b[sortKey.value]) * modifier;
    });
  }
  return studentsToSort;
});

const fetchStudents = async () => {
  try {
    const response = await axios.get("/api/attendances/students");
    students.value = response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
  }
};

onMounted(fetchStudents);

const availableClasses = computed(() => {
  return Array.from(new Set(students.value.map((student) => student.kelas)));
});

const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const matchesClass = selectedClass.value ? student.kelas === selectedClass.value : true;
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.nis.toString().includes(searchQuery.value);

    return matchesClass && matchesSearch;
  });
});

const openForm = () => {
  editStudent.value = null;
  isFormOpen.value = true;
};

const openEditForm = (student) => {
  editStudent.value = { ...student };
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
  editStudent.value = null;
};

const confirmDelete = (id) => {
  studentToDelete = id;
  isConfirmOpen.value = true;
};

const deleteStudent = async () => {
  if (studentToDelete) {
    try {
      await axios.delete(`/api/attendances/students?id=${studentToDelete}`);
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  }
  isConfirmOpen.value = false;
};
</script>

<style scoped>
.grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.top-cards .card {
  flex: 1;
  min-width: 200px;
}

/* Container untuk pencarian & filter */
.filter-container, .search-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
}

/* Style label */
.filter-container label, .search-container label {
  font-weight: bold;
  color: #333;
}

/* Style dropdown */
.filter-dropdown {
  padding: 8px;
  border: 1px solid #aaa;
  border-radius: 5px;
  font-size: 14px;
  width: 100%;
  background-color: white;
  cursor: pointer;
}

.filter-dropdown:hover {
  border-color: #666;
}

.filter-dropdown:focus {
  border-color: #007bff;
  outline: none;
}

/* Input pencarian */
.search-input {
  padding: 8px;
  border: 1px solid #aaa;
  border-radius: 5px;
  font-size: 14px;
  width: 100%;
  background-color: white;
}

.search-input:focus {
  border-color: #007bff;
  outline: none;
}

/* Menjadikan judul & tombol dalam satu baris dengan jarak di antara mereka */
.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 2px solid #ddd;
  margin-bottom: 10px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
}

.btn-custom {
  padding: 6px 10px; /* Ukuran lebih besar */
  font-size: 14px;
  background-color: #178fb7 !important;
  color: white !important;
}

.btn-actions {
  display: flex;
  gap: 10px;
}

.btn-edit, .btn-delete {
  padding: 6px;
  font-size: 12px;
  width: 70px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-edit {
  background-color: #007bff;
}

.btn-edit:hover {
  background-color: #0056b3;
}

.btn-delete {
  background-color: #fc5061
}

.btn-delete:hover {
  background-color: #c82333;
}

.title-container .icon {
  height: 20px;
  width: 20px;
}

.table-container {
  max-height: 465px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 5px;
  text-align: left;
}

.table th {
  background-color: #f4f4f4;
  position: sticky;
  top: 0;
  z-index: 1;
  text-align: center;
}


.table th:last-child,
.table td:last-child {
  width: 100px;
  white-space: nowrap;
}

.table tbody tr:hover {
  background-color: #eaeaea;
  transition: background-color 0.5s ease;
}

.empty-message {
  text-align: center;
  font-style: italic;
  color: #777;
  padding: 15px;
  font-size: 14px;
}
</style>
