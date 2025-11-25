<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import AdminLayout from '@/components/AdminLayout.vue'

const authStore = useAuthStore()
const pedidos = ref([])
const loading = ref(true)
const errorMessage = ref(null)
const successMessage = ref(null)

const statusOptions = [
  { value: 'pendente', text: 'Pendente' },
  { value: 'aprovado', text: 'Aprovado' },
  { value: 'enviado', text: 'Enviado' },
  { value: 'entregue', text: 'Entregue' },
  { value: 'cancelado', text: 'Cancelado' },
]

const carregarPedidos = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await axios.get('https://bluepen-back.onrender.com/api/pedidos/', {
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

const handleStatusChange = async (pedido, event) => {
  const newStatus = event.target.value
  successMessage.value = null
  errorMessage.value = null

  try {
    await axios.patch(
      `https://bluepen-back.onrender.com/api/pedidos/${pedido.id}/`,
      { status: newStatus },
      { headers: { Authorization: `Token ${authStore.token}` } },
    )

    pedido.status = newStatus
    successMessage.value = `Status do Pedido #${pedido.id} atualizado para ${newStatus}!`
  } catch (error) {
    console.error('Erro ao atualizar status:', error.response?.data)
    errorMessage.value = `Erro ao atualizar Pedido #${pedido.id}.`
    await carregarPedidos()
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

onMounted(carregarPedidos)
</script>

<template>
  <AdminLayout>
    <div class="card-container">
      <div class="header-flex">
        <h1>Gerenciamento de Pedidos</h1>
      </div>

      <div v-if="loading" class="loading-message">Carregando pedidos...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

      <div v-if="!loading && pedidos.length === 0" class="no-data-message">
        Nenhum pedido encontrado.
      </div>

      <div v-else-if="!loading" class="table-responsive">
        <table class="clean-table">
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
              <td>#{{ pedido.id }}</td>
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
    </div>
  </AdminLayout>
</template>

<style scoped>
.header-flex {
  margin-bottom: 2rem;
}
h1 {
  color: #334155;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
}

.card-container {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.error-message {
  color: #b91c1c;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  text-align: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  font-weight: 600;
}
.success-message {
  color: #065f46;
  background-color: #d1fae5;
  border: 1px solid #a7f3d0;
  text-align: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  font-weight: 600;
}
.loading-message,
.no-data-message {
  background-color: #f1f5f9;
  color: #64748b;
  text-align: center;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.clean-table {
  width: 100%;
  border-collapse: collapse;
}
.clean-table th {
  text-align: center;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 12px 15px;
  border-bottom: 1px solid #f1f5f9;
}
.clean-table td {
  padding: 12px 15px;
  color: #475569;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  vertical-align: middle;
}

.status-select {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  color: #334155;
  background-color: white;
}
.status-select:focus {
  border-color: #3b82f6;
}

.status-pendente {
  background-color: #fff7ed;
  color: #c2410c;
  border-color: #fdba74;
}
.status-aprovado {
  background-color: #f0fdf4;
  color: #15803d;
  border-color: #86efac;
}
.status-enviado {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-color: #93c5fd;
}
.status-entregue {
  background-color: #eef2ff;
  color: #4338ca;
  border-color: #a5b4fc;
}
.status-cancelado {
  background-color: #fef2f2;
  color: #b91c1c;
  border-color: #fca5a5;
}
</style>
