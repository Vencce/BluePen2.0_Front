<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import AdminLayout from '@/components/AdminLayout.vue' 

const authStore = useAuthStore()

const lancamentos = ref([])
const loading = ref(true)
const errorMessage = ref(null)

const showAddModal = ref(false)
const modalError = ref(null)
const modalSuccess = ref(null)
const novoLancamento = ref({
  tipo: 'ENTRADA',
  categoria: 'CAPITAL_INICIAL',
  descricao: '',
  valor: 0,
  data_lancamento: new Date().toISOString().split('T')[0]
})

const totalReceitas = computed(() => {
  return lancamentos.value
    .filter(l => l.tipo === 'ENTRADA' && l.categoria === 'VENDA')
    .reduce((total, item) => total + parseFloat(item.valor), 0)
})
const totalDespesas = computed(() => {
  return lancamentos.value
    .filter(l => l.tipo === 'SAIDA')
    .reduce((total, item) => total + parseFloat(item.valor), 0)
})
const saldoAtual = computed(() => {
  const todasEntradas = lancamentos.value
    .filter(l => l.tipo === 'ENTRADA')
    .reduce((total, item) => total + parseFloat(item.valor), 0)
  return todasEntradas - totalDespesas.value
})

const carregarFluxoCaixa = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await axios.get(
      'http://127.0.0.1:8000/api/fabrica/fluxo-caixa/',
      { headers: { Authorization: `Token ${authStore.token}` } }
    )
    lancamentos.value = response.data.sort((a, b) => 
      new Date(b.data_lancamento) - new Date(a.data_lancamento)
    )
  } catch (error) {
    console.error('Erro ao carregar fluxo de caixa:', error)
    errorMessage.value = 'Não foi possível carregar os relatórios.'
  } finally {
    loading.value = false
  }
}

const openAddModal = () => {
  modalError.value = null
  modalSuccess.value = null
  novoLancamento.value = {
    tipo: 'ENTRADA',
    categoria: 'CAPITAL_INICIAL',
    descricao: '',
    valor: 0,
    data_lancamento: new Date().toISOString().split('T')[0]
  }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const submitLancamento = async () => {
  modalError.value = null
  modalSuccess.value = null

  if (novoLancamento.value.valor <= 0) {
    modalError.value = "O valor deve ser maior que zero."
    return
  }
  if (!novoLancamento.value.descricao) {
    modalError.value = "A descrição é obrigatória."
    return
  }

  try {
    await axios.post(
      'http://127.0.0.1:8000/api/fabrica/fluxo-caixa/',
      novoLancamento.value,
      { headers: { 'Authorization': `Token ${authStore.token}` } }
    )
    modalSuccess.value = "Lançamento adicionado com sucesso!"
    await carregarFluxoCaixa()
    
    setTimeout(() => {
      closeAddModal()
    }, 2000)

  } catch (error) {
    console.error('Erro ao adicionar lançamento:', error.response?.data)
    modalError.value = "Falha ao salvar. Verifique os dados."
  }
}

const formatCurrency = (value) => {
  const numericValue = parseFloat(value) || 0;
  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// CORREÇÃO AQUI TAMBÉM
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

onMounted(carregarFluxoCaixa)
</script>

<template>
  <AdminLayout>
      
      <div class="page-header-flex">
        <h1>Relatório Financeiro (Fluxo de Caixa)</h1>
        <button @click="openAddModal" class="btn-action">
          + Adicionar Lançamento
        </button>
      </div>

      <div v-if="loading" class="loading-message">Carregando...</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div v-if="!loading && !errorMessage">
        <section class="metrics-grid">
          <div class="metric-card card-receita">
            <h3>Total de Receitas (Vendas)</h3>
            <p>{{ formatCurrency(totalReceitas) }}</p>
          </div>
          <div class="metric-card card-despesa">
            <h3>Total de Despesas</h3>
            <p>{{ formatCurrency(totalDespesas) }}</p>
          </div>
          <div class="metric-card card-saldo">
            <h3>Saldo Atual em Caixa</h3>
            <p>{{ formatCurrency(saldoAtual) }}</p>
          </div>
        </section>

        <section class="card-container">
          <h2>Últimos Lançamentos</h2>
          <div v-if="lancamentos.length === 0" class="no-data-message">
            Nenhum lançamento encontrado.
          </div>
          <div v-else class="table-responsive">
            <table class="clean-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="l in lancamentos" :key="l.id">
                  <td>{{ formatDate(l.data_lancamento) }}</td>
                  <td>
                    <span :class="['badge', l.tipo === 'ENTRADA' ? 'badge-success' : 'badge-danger']">
                      {{ l.tipo }}
                    </span>
                  </td>
                  <td>{{ l.categoria }}</td>
                  <td>{{ l.descricao || '-' }}</td>
                  <td :class="[l.tipo === 'ENTRADA' ? 'text-success' : 'text-danger']">
                    {{ formatCurrency(l.valor) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Adicionar Lançamento</h2>
        <div v-if="modalError" class="modal-error">{{ modalError }}</div>
        <div v-if="modalSuccess" class="modal-success">{{ modalSuccess }}</div>
        
        <form @submit.prevent="submitLancamento">
          
          <div class="form-group">
            <label>Tipo:</label>
            <select v-model="novoLancamento.tipo" required>
              <option value="ENTRADA">Entrada (Receita)</option>
              <option value="SAIDA">Saída (Despesa)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Categoria:</label>
            <select v-model="novoLancamento.categoria" required>
              <option value="CAPITAL_INICIAL">Capital Inicial</option>
              <option value="VENDA">Venda</option>
              <option value="INSUMO">Insumo (Compra)</option>
              <option value="SALARIO">Salário</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>

          <div class="form-group">
            <label>Descrição:</label>
            <input type="text" v-model="novoLancamento.descricao" required>
          </div>

          <div class="form-group">
            <label>Valor (R$):</label>
            <input type="number" v-model.number="novoLancamento.valor" min="0.01" step="0.01" required>
          </div>

          <div class="form-group">
            <label>Data:</label>
            <input type="date" v-model="novoLancamento.data_lancamento" required>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn-submit">Salvar</button>
            <button type="button" @click="closeAddModal" class="btn-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.page-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn-action { 
  background-color: #3b82f6;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}
.btn-action:hover {
  background-color: #2563eb;
}

/* Modal Styles - Simplified for Admin Look */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
}
.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.modal-content h2 {
    color: #334155;
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.4rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}
.form-group select,
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #334155;
  outline: none;
}
.form-group select:focus,
.form-group input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}
.btn-submit {
  background-color: #10b981;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-cancel {
  background-color: white;
  color: #64748b;
  border: 1px solid #cbd5e1;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.modal-error {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 0.9rem;
}
.modal-success {
  background-color: #d1fae5;
  color: #065f46;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-size: 0.9rem;
}
</style>