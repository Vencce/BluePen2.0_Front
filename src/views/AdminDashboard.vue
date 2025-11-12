<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import FooterComponent from '@/components/FooterComponent.vue'
import HeaderComponent from '@/components/HeaderComponent.vue'

const authStore = useAuthStore()

const pedidos = ref([])
const loading = ref(true)
const errorMessage = ref(null)

const carregarPedidos = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/pedidos/', {
      headers: {
        Authorization: `Token ${authStore.token}`,
      },
    })
    pedidos.value = response.data
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error.response?.data || error.message)
    if (error.response?.status === 403) {
      errorMessage.value = 'Acesso negado. Apenas administradores podem ver os pedidos.'
    } else {
      errorMessage.value = 'Não foi possível carregar os pedidos.'
    }
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
  if (!itens || !Array.isArray(itens)) {
    return 0
  }
  return itens.reduce((total, item) => {
    return total + (item.quantidade || 0)
  }, 0)
}

onMounted(() => {
  if (authStore.isSuperuser) {
    carregarPedidos()
  } else {
    loading.value = false
    errorMessage.value = 'Acesso não autorizado.'
  }
})
</script>

<template>
  <div class="page-wrapper">
    <HeaderComponent />

    <main class="dashboard-content">
      <section class="quick-access">
        <h2>Acesso Rápido</h2>
        <div class="quick-links">
          <a href="http://127.0.0.1:8000/admin/" target="_blank" class="link-card">
            <h3>Gerenciar no Django Admin</h3>
            <p>Adicionar/Editar produtos e usuários.</p>
          </a>
          <router-link to="/loja" class="link-card">
            <h3>Ver a Loja</h3>
            <p>Ver a loja como um usuário comum.</p>
          </router-link>
        </div>
      </section>

      <hr class="divider" />

      <section class="orders-section">
        <h2>Últimas Vendas</h2>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <div v-else-if="loading">
          <p>Carregando pedidos...</p>
        </div>
        <div v-else-if="pedidos.length === 0">
          <p>Nenhum pedido encontrado.</p>
        </div>

        <div v-else class="orders-table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Data</th>
                <th>Total</th>
                <th>Status</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pedido in pedidos" :key="pedido.id">
                <td>{{ pedido.id }}</td>
                <td>{{ pedido.user?.username || 'N/A' }}</td>
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
.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  flex-grow: 1;
  width: 100%;
}
h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}

td {
  color: #333;
}

.quick-access {
  margin-bottom: 2rem;
}
.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.link-card {
  display: block;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.link-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}
.link-card h3 {
  color: #007bff;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}
.link-card p {
  font-size: 0.9rem;
  color: #555;
}

.divider {
  border: none;
  border-top: 1px solid #ddd;
  margin: 2.5rem 0;
}

.orders-section {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 2rem;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
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
