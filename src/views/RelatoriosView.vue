<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import HeaderComponent from '@/components/HeaderComponent.vue'
import FooterComponent from '@/components/FooterComponent.vue'

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
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

onMounted(carregarFluxoCaixa)
</script>

<template>
  <div class="page-wrapper">
    <HeaderComponent />
    
    <main class="relatorios-container">
      
      <div class="header-inventario">
        <h1>Relatório Financeiro (Fluxo de Caixa)</h1>
        <button @click="openAddModal" class="add-stock-button">
          Adicionar Lançamento
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

        <hr class="divider" />

        <section class="lancamentos-section">
          <h2>Últimos Lançamentos</h2>
          <div v-if="lancamentos.length === 0" class="no-data-message">
            Nenhum lançamento encontrado.
          </div>
          <div v-else class="table-container">
            <table class="lancamentos-table">
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
                    <span :class="['tipo-badge', l.tipo === 'ENTRADA' ? 'tipo-receita' : 'tipo-despesa']">
                      {{ l.tipo }}
                    </span>
                  </td>
                  <td>{{ l.categoria }}</td>
                  <td>{{ l.descricao || '-' }}</td>
                  <td :class="[l.tipo === 'ENTRADA' ? 'valor-receita' : 'valor-despesa']">
                    {{ formatCurrency(l.valor) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>

    <FooterComponent />

    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Adicionar Lançamento no Caixa</h2>
        <div v-if="modalError" class="modal-error">{{ modalError }}</div>
        <div v-if="modalSuccess" class="modal-success">{{ modalSuccess }}</div>
        
        <form @submit.prevent="submitLancamento">
          
          <div class="form-group">
            <label for="tipo">Tipo:</label>
            <select id="tipo" v-model="novoLancamento.tipo" required>
              <option value="ENTRADA">Entrada (Receita)</option>
              <option value="SAIDA">Saída (Despesa)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="categoria">Categoria:</label>
            <select id="categoria" v-model="novoLancamento.categoria" required>
              <option value="CAPITAL_INICIAL">Capital Inicial</option>
              <option value="VENDA">Venda</option>
              <option value="INSUMO">Insumo (Compra)</option>
              <option value="SALARIO">Salário</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>

          <div class="form-group">
            <label for="descricao">Descrição:</label>
            <input type="text" id="descricao" v-model="novoLancamento.descricao" required>
          </div>

          <div class="form-group">
            <label for="valor">Valor (R$):</label>
            <input type="number" id="valor" v-model.number="novoLancamento.valor" min="0.01" step="0.01" required>
          </div>

          <div class="form-group">
            <label for="data">Data do Lançamento:</label>
            <input type="date" id="data" v-model="novoLancamento.data_lancamento" required>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn-submit">Adicionar</button>
            <button type="button" @click="closeAddModal" class="btn-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
    </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f4f7f6;
}
.relatorios-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  flex-grow: 1;
  width: 100%;
}
.divider { 
  border: none; 
  border-top: 1px solid #ddd; 
  margin: 2.5rem 0; 
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}
.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 5px solid #007bff; 
}
.metric-card h3 {
  font-size: 1.1rem;
  color: #6c757d;
  margin-top: 0;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}
.metric-card p {
  font-size: 2.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.card-receita { border-left-color: #28a745; }
.card-receita p { color: #28a745; }
.card-despesa { border-left-color: #dc3545; }
.card-despesa p { color: #dc3545; }
.card-saldo { border-left-color: #007bff; }
.card-saldo p { color: #007bff; }

.lancamentos-section {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.lancamentos-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ddd;
}
.table-container { overflow-x: auto; }
.lancamentos-table {
  width: 100%;
  border-collapse: collapse; 
  margin-top: 1rem;
}
.lancamentos-table th,
.lancamentos-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: middle; 
  color: #333;
}
.lancamentos-table th {
  background-color: #f8f9fa; 
  font-weight: 600;
  color: #495057;
  white-space: nowrap; 
}
.lancamentos-table tbody tr:hover { background-color: #f1f1f1; }
.tipo-badge {
  padding: 4px 10px; 
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: capitalize;
  color: white;
}
.tipo-receita { background-color: #28a745; }
.tipo-despesa { background-color: #dc3545; }
.valor-receita { color: #28a745; font-weight: bold; }
.valor-despesa { color: #dc3545; font-weight: bold; }
.error-message, .loading-message, .no-data-message { 
  text-align: center; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; 
}
.error-message { color: #dc3545; background-color: #f8d7da; border: 1px solid #f5c6cb; font-weight: 600; }
.loading-message, .no-data-message { background-color: #eee; color: #555; }

.header-inventario {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
h1 {
  color: #333; 
  text-align: left;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 600;
}
.add-stock-button { 
  background-color: #50fa7b;
  color: #282a36;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.add-stock-button:hover {
  background-color: #69ff91;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
}
.modal-content {
  background-color: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 500px;
  max-width: 90%;
  color: #333; 
}
.modal-content h2 {
  color: #007bff;
  text-align: center;
  margin-bottom: 25px;
  font-size: 1.8em;
  border-bottom: none;
  padding-bottom: 0;
}
.form-group {
  margin-bottom: 1.25rem;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: bold;
}
.form-group select,
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fefefe;
  color: #333;
  font-size: 1em;
  box-sizing: border-box;
}
.form-group select:focus,
.form-group input:focus {
  border-color: #007bff; 
  outline: none;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}
.btn-submit, .btn-cancel {
  padding: 10px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.btn-submit {
  background-color: #28a745;
  color: white;
}
.btn-submit:hover {
  background-color: #218838;
}
.btn-cancel {
  background-color: #6c757d;
  color: white;
}
.btn-cancel:hover {
  background-color: #5a6268;
}
.modal-error {
  background-color: #f8d7da;
  color: #dc3545;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}
.modal-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}
</style>