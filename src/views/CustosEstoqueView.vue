<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/components/AdminLayout.vue'

const authStore = useAuthStore()
const custos = ref([])
const loading = ref(false)
const message = ref(null)

const carregarCustos = async () => {
  try {
    const response = await axios.get('https://bluepen-back.onrender.com/api/fabrica/fluxo-caixa/', {
      headers: { Authorization: `Token ${authStore.token}` }
    })
    custos.value = response.data.filter(c => c.categoria === 'DEPRECIACAO' || c.descricao.includes('Custo Diário')).sort((a,b) => new Date(b.data_lancamento) - new Date(a.data_lancamento))
  } catch (error) {
    console.error(error)
  }
}

const processarCustosHoje = async () => {
  loading.value = true
  message.value = null
  try {
    const response = await axios.post('https://bluepen-back.onrender.com/api/fabrica/custos-diarios/processar/', {}, {
      headers: { Authorization: `Token ${authStore.token}` }
    })
    message.value = { type: 'success', text: `Sucesso! Total gerado: R$ ${response.data.total}` }
    await carregarCustos()
  } catch (error) {
    if (error.response && error.response.status === 400) {
      message.value = { type: 'warning', text: error.response.data.message }
    } else {
      message.value = { type: 'error', text: 'Erro ao processar custos.' }
    }
  } finally {
    loading.value = false
  }
}

const formatCurrency = (val) => parseFloat(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

onMounted(carregarCustos)
</script>

<template>
  <AdminLayout>
    <div class="page-header-flex">
      <h1>Custos de Estoque (Depreciação)</h1>
      <button @click="processarCustosHoje" class="btn-action" :disabled="loading">
        {{ loading ? 'Processando...' : 'Processar Custos de Hoje' }}
      </button>
    </div>

    <div v-if="message" :class="['alert', `alert-${message.type}`]">
      {{ message.text }}
    </div>

    <div class="card-container">
      <h3>Histórico de Custos Diários</h3>
      <p class="info-text">Custo calculado: R$ 0,02 por unidade de produto acabado em estoque.</p>
      
      <table class="clean-table" v-if="custos.length > 0">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="custo in custos" :key="custo.id">
            <td>{{ formatDate(custo.data_lancamento) }}</td>
            <td>{{ custo.descricao }}</td>
            <td class="text-danger">- {{ formatCurrency(custo.valor) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">Nenhum custo registrado ainda.</div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.page-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
h1 { color: #334155; margin: 0; }
.card-container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.info-text { color: #64748b; margin-bottom: 1.5rem; font-size: 0.9rem; }
.btn-action { background-color: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-action:disabled { background-color: #94a3b8; cursor: not-allowed; }
.clean-table { width: 100%; border-collapse: collapse; }
.clean-table th { text-align: left; color: #94a3b8; padding: 12px; border-bottom: 1px solid #f1f5f9; }
.clean-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
.text-danger { color: #ef4444; font-weight: bold; }
.alert { padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; text-align: center; font-weight: 500; }
.alert-success { background-color: #dcfce7; color: #166534; }
.alert-warning { background-color: #fef9c3; color: #854d0e; }
.alert-error { background-color: #fee2e2; color: #991b1b; }
.no-data { text-align: center; color: #64748b; padding: 2rem; }
</style>