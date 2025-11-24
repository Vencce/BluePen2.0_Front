<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import AdminLayout from '@/components/AdminLayout.vue'

const authStore = useAuthStore()

const movimentos = ref([])
const loading = ref(true)
const errorMessage = ref(null)

const totalEntradas = computed(() => {
  return movimentos.value
    .filter(l => l.tipo === 'ENTRADA')
    .reduce((total, item) => total + parseFloat(item.quantidade), 0)
})
const totalSaidas = computed(() => {
  return movimentos.value
    .filter(l => l.tipo === 'SAIDA')
    .reduce((total, item) => total + parseFloat(item.quantidade), 0)
})
const saldoEstoque = computed(() => {
  return totalEntradas.value - totalSaidas.value
})

const carregarMovimentos = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await axios.get(
      'http://127.0.0.1:8000/api/fabrica/movimentos-insumo/',
      { headers: { Authorization: `Token ${authStore.token}` } }
    )
    movimentos.value = response.data.sort((a, b) => 
      new Date(b.data_hora) - new Date(a.data_hora)
    )
  } catch (error) {
    console.error('Erro ao carregar movimentos de insumos:', error)
    errorMessage.value = 'Não foi possível carregar os relatórios.'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) => {
  const numericValue = parseFloat(value) || 0;
  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const formatNumber = (value) => {
    const numericValue = parseInt(value) || 0;
    return numericValue; 
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  const options = {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric'
  }
  return new Date(dateTimeString).toLocaleDateString('pt-BR', options)
}

onMounted(carregarMovimentos)
</script>

<template>
  <AdminLayout>
      
      <div class="page-header-flex">
        <h1>Relatório de Movimentação de Insumos</h1>
      </div>

      <div v-if="loading" class="loading-message">Carregando...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div v-if="!loading && !errorMessage">

        <section class="metrics-grid">
          <div class="metric-card card-receita">
            <h3>Total de Entradas (Compras)</h3>
            <p>{{ formatNumber(totalEntradas) }} <small>un.</small></p>
          </div>
          <div class="metric-card card-despesa">
            <h3>Total de Saídas (Produção)</h3>
            <p>{{ formatNumber(totalSaidas) }} <small>un.</small></p>
          </div>
          <div class="metric-card card-saldo">
            <h3>Saldo Atual em Estoque</h3>
            <p>{{ formatNumber(saldoEstoque) }} <small>un.</small></p>
          </div>
        </section>

        <section class="card-container">
          <h2>Histórico de Movimentos</h2>
          <div v-if="movimentos.length === 0" class="no-data-message">
            Nenhuma movimentação encontrada.
          </div>
          <div v-else class="table-responsive">
            <table class="clean-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Insumo</th>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Custo/Un (R$)</th>
                  <th>Referência</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in movimentos" :key="m.id">
                  <td>{{ formatDateTime(m.data_hora) }}</td>
                  <td>{{ m.insumo?.nome || 'N/A' }}</td>
                  <td>
                    <span :class="['badge', m.tipo === 'ENTRADA' ? 'badge-success' : 'badge-danger']">
                      {{ m.tipo }}
                    </span>
                  </td>
                  <td>{{ formatNumber(m.quantidade) }}</td>
                  <td :class="[m.tipo === 'ENTRADA' ? 'text-success' : 'text-danger']">
                    {{ formatCurrency(m.custo_unitario_movimento) }}
                  </td>
                  <td>{{ m.referencia_tabela || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
  </AdminLayout>
</template>

<style scoped>
.no-data-message{
  color: #64748b;
  font-size: 0.9rem;
}

.page-header-flex {
  margin-bottom: 2rem;
}
h1 {
  color: #334155; 
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}
.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #3b82f6; 
}
.metric-card h3 {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 0;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.metric-card p {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.metric-card p small { font-size: 1rem; font-weight: 500; color: #64748b; }
.card-receita { border-left-color: #10b981; }
.card-despesa { border-left-color: #ef4444; }
.card-saldo { border-left-color: #3b82f6; }

.card-container {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.card-container h2 {
    font-size: 1.2rem;
    color: #334155;
    margin-bottom: 1.5rem;
    margin-top: 0;
}

.clean-table {
  width: 100%;
  border-collapse: collapse;
}
.clean-table th {
  text-align: left;
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
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}
.badge-success { background-color: #d1fae5; color: #065f46; }
.badge-danger { background-color: #fee2e2; color: #991b1b; }
.text-success { color: #10b981; font-weight: 600; }
.text-danger { color: #ef4444; font-weight: 600; }
</style>