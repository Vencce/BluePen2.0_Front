<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import FooterComponent from '@/components/FooterComponent.vue'
import HeaderComponentLoja from '@/components/HeaderComponentLoja.vue'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()

const profile = ref(null)
const pedidos = ref([])
const loading = ref(true)
const errorMessage = ref(null)

const avatarFile = ref(null)
const uploadMessage = ref('')
const uploadError = ref(null)

const carregarDadosDaConta = async () => {
  loading.value = true
  errorMessage.value = null

  if (!authStore.token) {
    errorMessage.value = 'Autenticação necessária.'
    loading.value = false
    return
  }

  try {
    const [pedidosResponse, profileResponse] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/pedidos/', {
        headers: { Authorization: `Token ${authStore.token}` },
      }),
      axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Token ${authStore.token}` },
      }),
    ])

    pedidos.value = pedidosResponse.data
    profile.value = profileResponse.data.length > 0 ? profileResponse.data[0] : null
  } catch (error) {
    console.error('Erro ao carregar dados da conta:', error.response?.data || error.message)
    errorMessage.value = 'Não foi possível carregar os dados da sua conta.'
  } finally {
    loading.value = false
  }
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (file) {
    avatarFile.value = file
    uploadMessage.value = `Arquivo selecionado: ${file.name}`
    uploadError.value = null
  }
}

const handleAvatarUpload = async () => {
  uploadError.value = null
  uploadMessage.value = ''

  if (!avatarFile.value) {
    uploadError.value = 'Nenhum arquivo selecionado.'
    return
  }
  if (!profile.value?.id) {
    uploadError.value = 'Perfil do usuário não encontrado.'
    return
  }

  const formData = new FormData()
  formData.append('avatar', avatarFile.value)

  try {
    const response = await axios.patch(
      `http://127.0.0.1:8000/api/profile/${profile.value.id}/`,
      formData,
      {
        headers: {
          Authorization: `Token ${authStore.token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    )

    uploadMessage.value = 'Avatar atualizado com sucesso!'
    avatarFile.value = null
    authStore.updateProfile(response.data)
    profile.value = response.data
  } catch (error) {
    console.error('Erro ao enviar avatar:', error.response?.data)
    uploadError.value = 'Erro ao enviar imagem.'
  }
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }
  return new Date(dateTimeString).toLocaleDateString('pt-BR', options)
}

const formatCurrency = (value) => {
  const numericValue = parseFloat(value) || 0
  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const calcularTotalItens = (itens) => {
  if (!itens || !Array.isArray(itens)) return 0
  return itens.reduce((total, item) => total + (item.quantidade || 0), 0)
}

onMounted(() => {
  carregarDadosDaConta()
})
</script>

<template>
  <div class="page-wrapper">
    <HeaderComponentLoja />
    <main class="account-container">
      <h1>Minha Conta</h1>
      <div v-if="loading" class="loading-message">Carregando...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div v-if="!loading && !errorMessage" class="account-content">
        <section class="account-section profile-section">
          <h2>Meus Dados</h2>
          <div class="avatar-upload-section">
            <img :src="authStore.avatarUrl" alt="Avatar" class="profile-avatar-large" />
            <form @submit.prevent="handleAvatarUpload" class="avatar-form">
              <label for="avatar-upload" class="btn-file-label">Escolher Foto</label>
              <input
                type="file"
                id="avatar-upload"
                @change="onFileSelected"
                accept="image/png, image/jpeg"
              />
              <button type="submit" class="btn-avatar-save" :disabled="!avatarFile">
                Salvar Foto
              </button>
            </form>
            <p v-if="uploadError" class="upload-feedback error">{{ uploadError }}</p>
            <p v-if="uploadMessage" class="upload-feedback success">{{ uploadMessage }}</p>
          </div>

          <div class="profile-details">
            <p><strong>Usuário:</strong> {{ authStore.user?.username }}</p>
            <p><strong>Email:</strong> {{ authStore.user?.email }}</p>
            <p><strong>Telefone:</strong> {{ profile?.telefone || 'Não cadastrado' }}</p>
            <p>
              <strong>Data de Nasc.:</strong> {{ profile?.data_nascimento || 'Não cadastrada' }}
            </p>
            <div class="profile-actions">
              <button class="btn-edit-profile (desabilitado)">Editar Perfil</button>
              <RouterLink to="/meus-enderecos" class="btn-edit-edereco">
                Gerenciar Endereços
              </RouterLink>
            </div>
          </div>
        </section>

        <hr class="divider" />

        <section class="account-section orders-section">
          <h2>Meus Pedidos</h2>

          <div v-if="pedidos.length === 0" class="no-data-message">
            Você ainda não fez nenhum pedido.
          </div>

          <div v-else class="orders-table-container">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pedido in pedidos" :key="pedido.id">
                  <td>#{{ pedido.id }}</td>
                  <td>{{ formatDateTime(pedido.created_at) }}</td>
                  <td>{{ formatCurrency(pedido.total_pedido) }}</td>
                  <td>
                    <span :class="['status-badge', `status-${pedido.status}`]">
                      {{ pedido.status }}
                    </span>
                  </td>
                  <td>{{ calcularTotalItens(pedido.itens) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
    <FooterComponent />
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f4f7f6;
}

.account-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  flex-grow: 1;
  width: 100%;
}
h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
}
h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}
.divider {
  border: none;
  border-top: 1px solid #ddd;
  margin: 2.5rem 0;
}
.account-section {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.avatar-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}
.profile-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #007bff;
  margin-bottom: 1rem;
}
.avatar-form {
  display: flex;
  gap: 10px;
  align-items: center;
}
input[type='file'] {
  display: none;
}
.btn-file-label {
  display: inline-block;
  padding: 10px 15px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
}
.btn-file-label:hover {
  background-color: #5a6268;
}
.btn-avatar-save {
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
}
.btn-avatar-save:hover {
  background-color: #218838;
}
.btn-avatar-save:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.upload-feedback {
  font-size: 0.9rem;
  margin-top: 10px;
  font-weight: 600;
}
.upload-feedback.success {
  color: #28a745;
}
.upload-feedback.error {
  color: #dc3545;
}

.profile-details p {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 0.75rem;
}
.profile-details p strong {
  color: #333;
  min-width: 120px;
  display: inline-block;
}

.profile-actions {
  display: flex;
}
.btn-edit-profile {
  margin-top: 1rem;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}
.btn-edit-profile.desabilitado {
  background-color: #6c757d;
  cursor: not-allowed;
}
.btn-edit-profile:hover {
  background-color: #036ee0;
}

.btn-edit-edereco {
  margin: 1rem 0 0 1rem;
  padding: 8px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
}
.btn-edit-edereco:hover {
  background-color: #036ee0;
}

.error-message,
.loading-message,
.no-data-message {
  text-align: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}
.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  font-weight: 600;
}
.loading-message,
.no-data-message {
  background-color: #eee;
  color: #555;
}

.orders-table-container {
  overflow-x: auto;
}
.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.orders-table th,
.orders-table td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  color: #333;
}
.orders-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}
.orders-table tbody tr:hover {
  background-color: #f1f1f1;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: capitalize;
  color: white;
  white-space: nowrap;
}
.status-pendente {
  background-color: #ffc107;
  color: #333;
}
.status-aprovado {
  background-color: #28a745;
}
.status-enviado {
  background-color: #17a2b8;
}
.status-cancelado {
  background-color: #dc3545;
}
</style>
