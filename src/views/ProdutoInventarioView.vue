<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/components/AdminLayout.vue'

const authStore = useAuthStore()

const produtos = ref([])
const insumos = ref([]) 
const maquinas = ref([]) 

const loading = ref(true)
const errorMessage = ref(null)

const showProductionModal = ref(false)
const productionError = ref(null)
const productionSuccess = ref(null)
const novaOrdem = ref({
  produto_acabado: null,
  quantidade_produzir: 1,
  maquina: null,
  data_inicio_prevista: new Date().toISOString().split('T')[0],
  observacoes: ''
})

const showAddInsumoModal = ref(false)
const selectedInsumoId = ref(null)
const insumoQuantityToAdd = ref(1)
const insumoCustoUnitario = ref(0.01)
const addInsumoError = ref(null)
const addInsumoSuccess = ref(null)

const selectedProduct = computed(() => {
  return produtos.value.find(p => p.id === novaOrdem.value.produto_acabado)
})

const carregarInventario = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const [resProdutos, resInsumos, resMaquinas] = await Promise.all([
      axios.get('https://bluepen-back.onrender.com/api/produtos/', { headers: { 'Authorization': `Token ${authStore.token}` } }),
      axios.get('https://bluepen-back.onrender.com/api/fabrica/insumos/', { headers: { 'Authorization': `Token ${authStore.token}` } }),
      axios.get('https://bluepen-back.onrender.com/api/fabrica/maquinas/', { headers: { 'Authorization': `Token ${authStore.token}` } })
    ])
    
    produtos.value = resProdutos.data
    insumos.value = resInsumos.data
    maquinas.value = resMaquinas.data

  } catch (error) {
    console.error('Erro ao carregar inventário:', error)
    errorMessage.value = 'Não foi possível carregar os dados.'
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

const openProductionModal = () => {
  productionError.value = null
  productionSuccess.value = null
  novaOrdem.value = {
    produto_acabado: produtos.value.length > 0 ? produtos.value[0].id : null,
    quantidade_produzir: 100,
    maquina: maquinas.value.length > 0 ? maquinas.value[0].id : null,
    data_inicio_prevista: new Date().toISOString().split('T')[0],
    observacoes: 'Solicitado via Inventário'
  }
  showProductionModal.value = true
}

const closeProductionModal = () => {
  showProductionModal.value = false
}

const submitOrdemProducao = async () => {
  productionError.value = null
  productionSuccess.value = null

  if (!novaOrdem.value.produto_acabado || !novaOrdem.value.maquina || novaOrdem.value.quantidade_produzir <= 0) {
    productionError.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  try {
    const payload = {
      produto_acabado: novaOrdem.value.produto_acabado,
      quantidade_produzir: novaOrdem.value.quantidade_produzir,
      data_inicio_prevista: novaOrdem.value.data_inicio_prevista,
      observacoes: novaOrdem.value.observacoes,
      maquina_id: novaOrdem.value.maquina,       
      funcionario_id: authStore.user.id          
    }

    await axios.post(
      'https://bluepen-back.onrender.com/api/fabrica/ordens-producao/',
      payload,
      { headers: { 'Authorization': `Token ${authStore.token}` } }
    )
    
    productionSuccess.value = "Ordem de Produção criada com sucesso! Aguarde a aprovação no Controle de Qualidade."
    
    setTimeout(() => closeProductionModal(), 2500)

  } catch (error) {
    console.error('Erro ao criar ordem:', error.response?.data || error)
    productionError.value = 'Falha ao criar ordem de produção.'
  }
}

const openAddInsumoModal = () => {
  addInsumoError.value = null
  addInsumoSuccess.value = null
  insumoQuantityToAdd.value = 100
  
  if (insumos.value.length > 0) {
    selectedInsumoId.value = insumos.value[0].id
    insumoCustoUnitario.value = parseFloat(insumos.value[0].custo_unitario) || 0.01
  } else {
    selectedInsumoId.value = null
    insumoCustoUnitario.value = 0.01
  }
  showAddInsumoModal.value = true
}

const closeAddInsumoModal = () => showAddInsumoModal.value = false

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

  const insumo = insumos.value.find(i => i.id === selectedInsumoId.value);
  if (!insumo) return;

  try {
    await axios.post(
      'https://bluepen-back.onrender.com/api/fabrica/movimentos-insumo/',
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
      'https://bluepen-back.onrender.com/api/fabrica/fluxo-caixa/',
      {
        tipo: 'SAIDA', 
        categoria: 'INSUMO',
        descricao: `Compra manual de ${insumoQuantityToAdd.value}x ${insumo.nome}`,
        valor: valorTotalDespesa.toFixed(2), 
        data_lancamento: new Date().toISOString().split('T')[0]
      },
      { headers: { 'Authorization': `Token ${authStore.token}` } }
    )
    
    addInsumoSuccess.value = `Estoque de ${insumo.nome} atualizado.`
    await carregarInventario() 
    setTimeout(() => closeAddInsumoModal(), 1500)

  } catch (error) {
    addInsumoError.value = 'Falha ao registrar compra.'
  }
}

onMounted(() => {
  carregarInventario()
})
</script>

<template>
  <AdminLayout>
    <div class="inventario-container">
      
      <section class="inventory-section card-container">
        <div class="header-inventario">
          <h2>Produtos (Acabados)</h2>
          <button @click="openProductionModal" class="btn-action">
            + Criar Ordem de Produção
          </button>
        </div>
        
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-else-if="loading" class="loading-message">Carregando...</div>
        <div v-else-if="produtos.length === 0" class="no-data-message">Nenhum produto encontrado.</div>
        <div v-else class="table-container table-responsive">
          <table class="clean-table">
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
                    'badge badge-warning': produto.estoque > 0 && produto.estoque <= 10, 
                    'badge badge-danger': produto.estoque <= 0,
                    'badge badge-success': produto.estoque > 10
                  }">
                    {{ produto.estoque }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="inventory-section card-container mt-4">
        <div class="header-inventario">
          <h2>Insumos (Matéria-Prima)</h2>
          <button @click="openAddInsumoModal" class="btn-action btn-insumo">
            + Compra de Insumo
          </button>
        </div>
        
        <div v-if="!errorMessage && loading" class="loading-message">Carregando...</div>
        <div v-else-if="insumos.length === 0 && !loading" class="no-data-message">Nenhum insumo encontrado.</div>
        
        <div v-else-if="insumos.length > 0" class="table-container table-responsive">
          <table class="clean-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Fornecedor</th>
                <th>Custo Unit.</th>
                <th>Estoque</th>
                <th>Un.</th>
                <th>Mínimo</th>
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
                    'badge badge-warning': insumo.quantidade_estoque <= insumo.estoque_minimo && insumo.quantidade_estoque > 0, 
                    'badge badge-danger': insumo.quantidade_estoque <= 0,
                     'badge badge-success': insumo.quantidade_estoque > insumo.estoque_minimo
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
    </div>

    <div v-if="showProductionModal" class="modal-overlay" @click.self="closeAddStockModal">
      <div class="modal-content">
        <h2>Nova Ordem de Produção</h2>
        <p class="modal-subtitle">Isso iniciará o processo de fabricação.</p>
        
        <div v-if="productionError" class="modal-error">{{ productionError }}</div>
        <div v-if="productionSuccess" class="modal-success">{{ productionSuccess }}</div>
        
        <form @submit.prevent="submitOrdemProducao">
          <div class="form-group">
            <label for="selectProduct">Produto a Fabricar:</label>
            <select id="selectProduct" v-model="novaOrdem.produto_acabado" required>
              <option v-for="p in produtos" :key="p.id" :value="p.id">{{ p.nome }}</option>
            </select>
          </div>
          
          <div class="form-row">
             <div class="form-group half">
                <label for="qtdProduzir">Quantidade:</label>
                <input type="number" id="qtdProduzir" v-model.number="novaOrdem.quantidade_produzir" min="1" required>
             </div>
             <div class="form-group half">
                <label for="dataPrevista">Data Prevista:</label>
                <input type="date" id="dataPrevista" v-model="novaOrdem.data_inicio_prevista" required>
             </div>
          </div>

          <div class="form-group">
            <label for="selectMaquina">Máquina / Linha:</label>
            <select id="selectMaquina" v-model="novaOrdem.maquina" required>
              <option v-for="m in maquinas" :key="m.id" :value="m.id">{{ m.nome }} - {{ m.modelo }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="obsOrdem">Observações:</label>
            <input type="text" id="obsOrdem" v-model="novaOrdem.observacoes" placeholder="Ex: Lote prioritário...">
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn-submit">Criar Ordem</button>
            <button type="button" @click="closeProductionModal" class="btn-cancel">Fechar</button>
          </div>
        </form>
      </div>
    </div>
    
    <div v-if="showAddInsumoModal" class="modal-overlay" @click.self="closeAddInsumoModal">
      <div class="modal-content">
        <h2 class="insumo-title">Registrar Compra de Insumo</h2>
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

  </AdminLayout>
</template>

<style scoped>
.header-inventario { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
h2 { color: #334155; font-size: 1.3rem; font-weight: 600; margin: 0; }

.card-container {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.mt-4 { margin-top: 2rem; }

.btn-action { 
  background-color: #3b82f6; color: white; padding: 10px 16px; 
  border: none; border-radius: 6px; cursor: pointer; font-weight: 600; 
  transition: background-color 0.2s; font-size: 0.9rem;
}
.btn-action:hover { background-color: #2563eb; }
.btn-insumo { background-color: #10b981; }
.btn-insumo:hover { background-color: #059669; }

.clean-table { width: 100%; border-collapse: collapse; }
.clean-table th {
  text-align: left; color: #94a3b8; font-weight: 600; font-size: 0.85rem;
  padding: 12px 15px; border-bottom: 1px solid #f1f5f9;
}
.clean-table td {
  padding: 12px 15px; color: #475569; font-size: 0.9rem;
  border-bottom: 1px solid #f1f5f9; white-space: nowrap;
}

.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
.badge-success { background-color: #d1fae5; color: #065f46; }
.badge-warning { background-color: #fef3c7; color: #b45309; }
.badge-danger { background-color: #fee2e2; color: #991b1b; }

.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(15, 23, 42, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; 
}
.modal-content {
  background-color: white; padding: 30px; border-radius: 12px; width: 500px; max-width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.modal-content h2 { margin-top: 0; margin-bottom: 5px; font-size: 1.4rem; color: #334155; text-align: left; }
.modal-subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 20px; }

.form-group { margin-bottom: 1rem; }
.form-row { display: flex; gap: 15px; }
.form-group.half { flex: 1; }

.form-group label { display: block; margin-bottom: 5px; color: #64748b; font-size: 0.9rem; font-weight: 500; }
.form-group select, .form-group input {
  width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; color: #334155; outline: none;
}
.form-group select:focus, .form-group input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
.btn-submit { background-color: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-submit.btn-insumo { background-color: #10b981; }
.btn-cancel { background-color: white; color: #64748b; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.modal-error { background-color: #fee2e2; color: #b91c1c; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 0.9rem; text-align: center; }
.modal-success { background-color: #d1fae5; color: #065f46; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 0.9rem; text-align: center; }
</style>