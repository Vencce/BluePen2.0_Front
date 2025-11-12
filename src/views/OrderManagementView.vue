<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import HeaderComponent from '@/components/HeaderComponent.vue' // O header do admin
import FooterComponent from '@/components/FooterComponent.vue'

const authStore = useAuthStore()
const pedidos = ref([])
const loading = ref(true)
const errorMessage = ref(null)
const successMessage = ref(null)

// Opções de status (baseado no seu models.py)
const statusOptions = [
  { value: 'pendente', text: 'Pendente' },
  { value: 'aprovado', text: 'Aprovado' },
  { value: 'enviado', text: 'Enviado' },
  { value: 'cancelado', text: 'Cancelado' },
]

// 1. BUSCAR TODOS OS PEDIDOS (O PedidoViewSet já filtra por admin)
const carregarPedidos = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/pedidos/', {
      headers: { Authorization: `Token ${authStore.token}` },
    })
    pedidos.value = response.data
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error.response?.data || error.message)
    errorMessage.value = 'Não foi possível carregar os pedidos.'
  } finally {
    loading.value = false
  }
}

// 2. ATUALIZAR O STATUS (A nova função)
const handleStatusChange = async (pedido, event) => {
  const newStatus = event.target.value
  successMessage.value = null
  errorMessage.value = null

  try {
    // Envia um PATCH para a API de Pedidos com o novo status
    await axios.patch(
      `http://127.0.0.1:8000/api/pedidos/${pedido.id}/`,
      { status: newStatus }, // Envia apenas o campo que mudou
      { headers: { Authorization: `Token ${authStore.token}` } },
    )

    // Atualiza o status localmente para o feedback ser instantâneo
    pedido.status = newStatus
    successMessage.value = `Status do Pedido #${pedido.id} atualizado para ${newStatus}!`

    // Opcional: recarregar tudo (descomente se preferir)
    // await carregarPedidos()
  } catch (error) {
    console.error('Erro ao atualizar status:', error.response?.data)
    errorMessage.value = `Erro ao atualizar Pedido #${pedido.id}.`
    // Recarrega os pedidos para reverter a mudança visual em caso de erro
    await carregarPedidos()
  }
}

// Funções auxiliares (copiadas do seu AdminDashboard.vue)
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

onMounted(carregarPedidos)
</script>

<template>
  <div class="page-wrapper">
    <HeaderComponent />

    <main class="management-container">
      <h1>Gerenciamento de Pedidos</h1>

      <div v-if="loading" class="loading-message">Carregando pedidos...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

      <div v-if="!loading && pedidos.length === 0" class="no-data-message">
        Nenhum pedido encontrado.
      </div>

      <div v-else-if="!loading" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente (Usuário)</th>
              <th>Data</th>
              <th>Total</th>
              <th>Quantidade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pedido in pedidos" :key="pedido.id">
              <td>{{ pedido.id }}</td>
              <td>{{ pedido.user?.username || 'N/A' }}</td>
              <td>{{ formatDateTime(pedido.created_at) }}</td>
              <td>{{ formatCurrency(pedido.total_pedido) }}</td>
              <td>{{ calcularTotalItens(pedido.itens) }}</td>
              <td>
                <select
                  :value="pedido.status"
                  @change="handleStatusChange(pedido, $event)"
                  :class="['status-select', `status-${pedido.status}`]"
                >
                  <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.text }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
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
.management-container {
  max-width: 1400px;
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

.error-message,
.success-message,
.loading-message,
.no-data-message {
  text-align: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  font-weight: 600;
}
.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}
.success-message {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}
.loading-message,
.no-data-message {
  background-color: #eee;
  color: #555;
}

.table-container {
  overflow-x: auto;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  color: #333;
}
.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}
.data-table tbody tr:hover {
  background-color: #f1f1f1;
}

.status-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-position: right 10px center;
  background-repeat: no-repeat;
  background-size: 10px;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.6-3.6%205.4-7.9%205.4-12.9%200-5-1.8-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E');
}
.status-pendente {
  background-color: #fff8e1;
  color: #f57f17;
  border-color: #f57f17;
}
.status-aprovado {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-color: #2e7d32;
}
.status-enviado {
  background-color: #e0f7fa;
  color: #007bb6;
  border-color: #007bb6;
}
.status-cancelado {
  background-color: #ffebee;
  color: #d32f2f;
  border-color: #d32f2f;
}
</style>
