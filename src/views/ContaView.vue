<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import FooterComponent from '@/components/FooterComponent.vue'
import HeaderComponentLoja from '@/components/HeaderComponentLoja.vue'
import { RouterLink } from 'vue-router'

const API_BASE = 'https://bluepen-back.onrender.com'

const authStore = useAuthStore()

const profile = ref(null)
const pedidos = ref([])
const loading = ref(true)
const errorMessage = ref(null)

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
      axios.get(`${API_BASE}/api/pedidos/`, {
        headers: { Authorization: `Token ${authStore.token}` },
      }),
      axios.get(`${API_BASE}/api/profile/`, {
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
          
          <div class="profile-details">
            <p><strong class="detail-label">Usuário:</strong> {{ authStore.user?.username }}</p>
            <p><strong class="detail-label">Email:</strong> {{ authStore.user?.email }}</p>
            <p><strong class="detail-label">Telefone:</strong> {{ profile?.telefone || 'Não cadastrado' }}</p>
            <p>
              <strong class="detail-label">Data de Nasc.:</strong> {{ profile?.data_nascimento || 'Não cadastrada' }}
            </p>
            <div class="profile-actions">
              <button class="btn-edit-profile btn-desabilitado">Editar Perfil</button>
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
                  <td data-label="ID">#{{ pedido.id }}</td>
                  <td data-label="Data">{{ formatDateTime(pedido.created_at) }}</td>
                  <td data-label="Total">{{ formatCurrency(pedido.total_pedido) }}</td>
                  <td data-label="Status">
                    <span :class="['status-badge', `status-${pedido.status}`]">
                      {{ pedido.status }}
                    </span>
                  </td>
                  <td data-label="Quantidade">{{ calcularTotalItens(pedido.itens) }}</td>
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
  color: #1e293b;
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
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
}

.profile-details p {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dotted #eee;
  padding-bottom: 5px;
}
.detail-label {
  color: #333;
  min-width: 120px;
}

.profile-actions {
  display: flex;
  gap: 10px;
  margin-top: 1.5rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}
.btn-edit-profile {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}
.btn-desabilitado {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.8;
}
.btn-edit-edereco {
  padding: 10px 20px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}
.btn-edit-edereco:hover {
  background-color: #0d966e;
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
.status-pendente { background-color: #ffc107; color: #333; }
.status-aprovado { background-color: #28a745; }
.status-enviado { background-color: #17a2b8; }
.status-entregue { background-color: #007bff; }
.status-cancelado { background-color: #dc3545; }

@media (max-width: 600px) {
  .account-container {
    padding: 1rem;
  }
  .orders-table th {
    display: none;
  }
  .orders-table tr {
    display: block;
    margin-bottom: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 10px;
    background-color: white;
  }
  .orders-table td {
    display: block;
    text-align: left;
    border-bottom: none;
    padding: 5px 0;
  }
  .orders-table td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #495057;
    margin-right: 10px;
    display: inline-block;
    min-width: 70px;
  }
  .orders-table td:last-child {
    border-bottom: none;
  }
}
</style>