<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import HeaderComponent from '@/components/HeaderComponent.vue'

const authStore = useAuthStore()

const produtos = ref([])
const insumos = ref([]) 

const loading = ref(true)
const errorMessage = ref(null)

const showAddStockModal = ref(false)
const selectedProductId = ref(null)
const stockQuantityToAdd = ref(1)
const addStockError = ref(null)
const addStockSuccess = ref(null)

const showAddInsumoModal = ref(false)
const selectedInsumoId = ref(null)
const insumoQuantityToAdd = ref(1)
const insumoCustoUnitario = ref(0.01)

const addInsumoError = ref(null)
const addInsumoSuccess = ref(null)
const selectedProduct = computed(() => {
  return produtos.value.find(p => p.id === selectedProductId.value)
})
const selectedInsumo = computed(() => {
  return insumos.value.find(i => i.id === selectedInsumoId.value)
})

const carregarInventario = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const [responseProdutos, responseInsumos] = await Promise.all([
      axios.get(
        'http://127.0.0.1:8000/api/produtos/',
        { headers: { 'Authorization': `Token ${authStore.token}` } }
      ),
      axios.get(
        'http://127.0.0.1:8000/api/fabrica/insumos/',
        { headers: { 'Authorization': `Token ${authStore.token}` } }
      )
    ])
    
    produtos.value = responseProdutos.data
    insumos.value = responseInsumos.data

  } catch (error) {
    console.error('Erro ao carregar inventário:', error.response?.data || error.message)
    errorMessage.value = 'Não foi possível carregar o inventário.'
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) => {
  const numericValue = parseFloat(value) || 0;
  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
const formatDecimal = (value) => {
    const numericValue = parseFloat(value) || 0;
    return numericValue.toFixed(4); 
}
const formatNumber = (value) => {
    const numericValue = parseInt(value) || 0;
    return numericValue; 
}


const openAddStockModal = () => {
  addStockError.value = null
  addStockSuccess.value = null
  stockQuantityToAdd.value = 1
  selectedProductId.value = produtos.value.length > 0 ? produtos.value[0].id : null
  showAddStockModal.value = true
}

const closeAddStockModal = () => {
  showAddStockModal.value = false
}

const submitAddStock = async () => {
  addStockError.value = null
  addStockSuccess.value = null
  if (!selectedProductId.value || stockQuantityToAdd.value <= 0) {
    addStockError.value = 'Selecione um produto e uma quantidade válida.'
    return
  }
  try {
    const product = produtos.value.find(p => p.id === selectedProductId.value);
    await axios.post(
      'http://127.0.0.1:8000/api/fabrica/movimentos-produto/',
      {
        produto_id: selectedProductId.value,
        tipo: 'ENTRADA',
        quantidade: stockQuantityToAdd.value,
        custo_producao_unitario: product.custo_base_producao_unitario || 0, 
        referencia_tabela: 'Inventario Manual', 
      },
      { headers: { 'Authorization': `Token ${authStore.token}` } }
    )
    addStockSuccess.value = `Estoque de ${selectedProduct.value.nome} adicionado.`
    await carregarInventario() 
    setTimeout(() => closeAddStockModal(), 1500)
  } catch (error) {
    addStockError.value = 'Falha ao adicionar estoque.'
  }
}

const openAddInsumoModal = () => {
  addInsumoError.value = null
  addInsumoSuccess.value = null
  insumoQuantityToAdd.value = 1
  
  if (insumos.value.length > 0) {
    selectedInsumoId.value = insumos.value[0].id
    insumoCustoUnitario.value = parseFloat(insumos.value[0].custo_unitario) || 0.01
  } else {
    selectedInsumoId.value = null
    insumoCustoUnitario.value = 0.01
  }
  
  showAddInsumoModal.value = true
}

const closeAddInsumoModal = () => {
  showAddInsumoModal.value = false
}

watch(selectedInsumoId, (newId) => {
  if (newId) {
    const insumo = insumos.value.find(i => i.id === newId);
    if (insumo) {
      insumoCustoUnitario.value = parseFloat(insumo.custo_unitario);
    }
  }
});

const submitAddInsumo = async () => {
  addInsumoError.value = null
  addInsumoSuccess.value = null

  if (!selectedInsumoId.value || insumoQuantityToAdd.value <= 0 || insumoCustoUnitario.value < 0) {
    addInsumoError.value = 'Selecione um insumo e preencha valores válidos.'
    return
  }

  const insumo = insumos.value.find(i => i.id === selectedInsumoId.value);
  if (!insumo) {
    addInsumoError.value = 'Insumo não encontrado.';
    return;
  }

  try {
    await axios.post(
      'http://127.0.0.1:8000/api/fabrica/movimentos-insumo/',
      {
        insumo_id: selectedInsumoId.value, 
        tipo: 'ENTRADA',
        quantidade: insumoQuantityToAdd.value,
        custo_unitario_movimento: insumoCustoUnitario.value,
        referencia_tabela: 'Compra Manual (Inventario)', 
      },
      { headers: { 'Authorization': `Token ${authStore.token}` } }
    )
    
    const valorTotalDespesa = insumoQuantityToAdd.value * insumoCustoUnitario.value;
    
    await axios.post(
      'http://127.0.0.1:8000/api/fabrica/fluxo-caixa/',
      {
        tipo: 'SAIDA', 
        categoria: 'INSUMO',
        descricao: `Compra manual de ${insumoQuantityToAdd.value}x ${insumo.nome}`,
        valor: valorTotalDespesa.toFixed(2), 
        data_lancamento: new Date().toISOString().split('T')[0]
      },
      { headers: { 'Authorization': `Token ${authStore.token}` } }
    )
    
    addInsumoSuccess.value = `Estoque de ${insumo.nome} atualizado e despesa registrada.`
    
    await carregarInventario() 
    
    setTimeout(() => closeAddInsumoModal(), 1500)

  } catch (error) {
    console.error('Erro ao adicionar insumo:', error.response?.data || error.message)
    addInsumoError.value = 'Falha ao adicionar insumo. (Verifique Estoque e Caixa)'
  }
}

onMounted(() => {
  carregarInventario()
})
</script>

<template>
  <div class="page-wrapper">
    <HeaderComponent />
    
    <main class="inventario-container">
      
      <section class="inventory-section">
        <div class="header-inventario">
          <h1>Inventário de Produtos (Acabados)</h1>
          <button @click="openAddStockModal" class="add-stock-button">
            Adicionar Estoque (Produção)
          </button>
        </div>
        
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-else-if="loading" class="loading-message">Carregando...</div>
        <div v-else-if="produtos.length === 0" class="no-data-message">Nenhum produto encontrado.</div>
        <div v-else class="table-container">
          <table class="inventario-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Produto</th>
                <th>Preço (Loja)</th>
                <th>Custo (Fábrica)</th>
                <th>Estoque Atual</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="produto in produtos" :key="produto.id">
                <td>{{ produto.id }}</td>
                <td>{{ produto.nome }}</td>
                <td>{{ formatCurrency(produto.preco) }}</td>
                <td>R$ {{ formatDecimal(produto.custo_base_producao_unitario) }}</td>
                <td>
                  <span :class="{
                    'estoque-baixo': produto.estoque > 0 && produto.estoque <= 10, 
                    'estoque-zero': produto.estoque <= 0
                  }">
                    {{ produto.estoque }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <hr class="divider">

      <section class="inventory-section">
        <div class="header-inventario">
          <h1>Inventário de Insumos (Matéria-Prima)</h1>
          <button @click="openAddInsumoModal" class="add-stock-button btn-insumo">
            Adicionar Insumo (Compra)
          </button>
        </div>
        
        <div v-if="!errorMessage && loading" class="loading-message">Carregando...</div>
        <div v-else-if="insumos.length === 0 && !loading" class="no-data-message">Nenhum insumo encontrado.</div>
        
        <div v-else-if="insumos.length > 0" class="table-container">
          <table class="inventario-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Fornecedor</th>
                <th>Custo Unit.</th>
                <th>Estoque Atual</th>
                <th>Un.</th>
                <th>Estoque Mín.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="insumo in insumos" :key="insumo.id">
                <td>{{ insumo.id }}</td>
                <td>{{ insumo.nome }}</td>
                <td>{{ insumo.fornecedor_nome || 'N/A' }}</td>
                <td>{{ formatCurrency(insumo.custo_unitario) }}</td>
                <td>
                  <span :class="{
                    'estoque-baixo': insumo.quantidade_estoque <= insumo.estoque_minimo && insumo.quantidade_estoque > 0, 
                    'estoque-zero': insumo.quantidade_estoque <= 0
                  }">
                    {{ formatNumber(insumo.quantidade_estoque) }}
                  </span>
                </td>
                <td>{{ insumo.unidade_medida }}</td>
                <td>{{ formatNumber(insumo.estoque_minimo) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      </main>

    <div v-if="showAddStockModal" class="modal-overlay" @click.self="closeAddStockModal">
      <div class="modal-content">
        <h2>Adicionar Estoque de Produto (Manual)</h2>
        <div v-if="addStockError" class="modal-error">{{ addStockError }}</div>
        <div v-if="addStockSuccess" class="modal-success">{{ addStockSuccess }}</div>
        
        <form @submit.prevent="submitAddStock">
          <div class="form-group">
            <label for="selectProduct">Produto:</label>
            <select id="selectProduct" v-model="selectedProductId" required>
              <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="stockQuantity">Quantidade (Entrada):</label>
            <input type="number" id="stockQuantity" v-model.number="stockQuantityToAdd" min="1" required>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-submit">Adicionar</button>
            <button type="button" @click="closeAddStockModal" class="btn-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
    
    <div v-if="showAddInsumoModal" class="modal-overlay" @click.self="closeAddInsumoModal">
      <div class="modal-content">
        <h2 class="insumo-title">Adicionar Insumo (Compra Manual)</h2>
        <div v-if="addInsumoError" class="modal-error">{{ addInsumoError }}</div>
        <div v-if="addInsumoSuccess" class="modal-success">{{ addInsumoSuccess }}</div>
        
        <form @submit.prevent="submitAddInsumo">
          <div class="form-group">
            <label for="selectInsumo">Insumo (Matéria-Prima):</label>
            <select id="selectInsumo" v-model="selectedInsumoId" required>
              <option v-for="i in insumos" :key="i.id" :value="i.id">{{ i.nome }} ({{ i.unidade_medida }})</option>
            </select>
          </div>
          <div class="form-group">
            <label for="insumoQuantity">Quantidade (Entrada):</label>
            <input type="number" id="insumoQuantity" v-model.number="insumoQuantityToAdd" min="1" required>
          </div>
          <div class="form-group">
            <label for="insumoCusto">Custo Unitário (R$):</label>
            <input type="number" id="insumoCusto" v-model.number="insumoCustoUnitario" min="0.0001" step="0.0001" required>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn-submit btn-insumo">Registrar Compra</button>
            <button type="button" @click="closeAddInsumoModal" class="btn-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
.page-wrapper { display: flex; flex-direction: column; min-height: 100vh; background-color: #282a36; color: #f8f8f2; }
.inventario-container { max-width: 1400px; margin: 0 auto; padding: 2rem; flex-grow: 1; width: 100%; }
.header-inventario { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
h1 { color: #bd93f9; text-align: left; margin: 0; font-size: 2.2rem; font-weight: 600; }
.add-stock-button { background-color: #50fa7b; color: #282a36; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; font-weight: bold; transition: background-color 0.3s ease; }
.add-stock-button:hover { background-color: #69ff91; }
.btn-insumo { background-color: #8be9fd; }
.btn-insumo:hover { background-color: #a1effe; }
.loading-message, .error-message, .no-data-message { text-align: center; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; font-size: 1.1rem; background-color: #44475a; }
.error-message { background-color: #ff5555; color: white; }
.no-data-message { color: #f1fa8c; }
.table-container { overflow-x: auto; background-color: #44475a; border: 1px solid #6272a4; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }
.inventario-table { width: 100%; border-collapse: collapse; }
.inventario-table th, .inventario-table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #6272a4; vertical-align: middle; }
.inventario-table th { background-color: #343746; font-weight: 600; color: #bd93f9; font-size: 0.9rem; text-transform: uppercase; white-space: nowrap; }
.inventario-table tbody tr:hover { background-color: #4f5266; }
.inventario-table td { white-space: nowrap; }
.estoque-baixo { color: #f1fa8c; font-weight: bold; }
.estoque-zero { color: #ff5555; font-weight: bold; }
.divider { border: none; border-top: 2px solid #6272a4; margin: 3rem 0; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background-color: #343746; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.6); width: 450px; max-width: 90%; color: #f8f8f2; }
.modal-content h2 { color: #50fa7b; text-align: center; margin-bottom: 25px; font-size: 1.8em; }
.modal-content h2.insumo-title { color: #8be9fd; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; color: #bd93f9; font-weight: bold; }
.form-group select, .form-group input[type="number"] { width: 100%; padding: 10px; border: 1px solid #6272a4; border-radius: 5px; background-color: #44475a; color: #f8f8f2; font-size: 1em; box-sizing: border-box; }
.form-group select:focus, .form-group input[type="number"]:focus { border-color: #50fa7b; outline: none; }
.modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
.btn-submit, .btn-cancel { padding: 10px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; font-weight: bold; transition: background-color 0.3s ease; }
.btn-submit { background-color: #50fa7b; color: #282a36; }
.btn-submit:hover { background-color: #69ff91; }
.btn-submit.btn-insumo { background-color: #8be9fd; color: #282a36; }
.btn-submit.btn-insumo:hover { background-color: #a1effe; }
.btn-cancel { background-color: #ff79c6; color: #282a36; }
.btn-cancel:hover { background-color: #ff92d0; }
.modal-error { background-color: #ff5555; color: white; padding: 10px; border-radius: 5px; margin-bottom: 15px; text-align: center; }
.modal-success { background-color: #50fa7b; color: #282a36; padding: 10px; border-radius: 5px; margin-bottom: 15px; text-align: center; }
</style>