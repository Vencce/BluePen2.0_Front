<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import AdminLayout from '@/components/AdminLayout.vue'

const authStore = useAuthStore()

const ordens = ref([])
const inspecoes = ref([])
const loading = ref(true)
const errorMessage = ref(null)

// Modal
const showModal = ref(false)
const modalError = ref(null)
const modalSuccess = ref(null)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  ordem_producao: null,
  quantidade_aprovada: 0,
  quantidade_rejeitada: 0,
  observacoes: '',
  status: 'PENDENTE',
  inspetor: null
})

// Combina Ordens com suas Inspeções (se houver)
const ordensComStatus = computed(() => {
  return ordens.value.map(ordem => {
    const inspecao = inspecoes.value.find(i => i.ordem_producao === ordem.id)
    return {
      ...ordem,
      inspecao: inspecao || null
    }
  })
})

const carregarDados = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const [resOrdens, resInspecoes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/api/fabrica/ordens-producao/', { headers: { Authorization: `Token ${authStore.token}` } }),
      axios.get('http://127.0.0.1:8000/api/fabrica/controle-qualidade/', { headers: { Authorization: `Token ${authStore.token}` } })
    ])
    ordens.value = resOrdens.data.sort((a, b) => b.id - a.id)
    inspecoes.value = resInspecoes.data
  } catch (error) {
    console.error('Erro:', error)
    errorMessage.value = 'Erro ao carregar dados.'
  } finally {
    loading.value = false
  }
}

const openModal = (ordem, inspecaoExistente) => {
  modalError.value = null
  modalSuccess.value = null
  
  if (inspecaoExistente) {
    isEditing.value = true
    editingId.value = inspecaoExistente.id
    // Copia os dados existentes
    form.value = { ...inspecaoExistente }
    
    // Garante que os campos numéricos sejam números
    form.value.quantidade_aprovada = parseInt(form.value.quantidade_aprovada)
    form.value.quantidade_rejeitada = parseInt(form.value.quantidade_rejeitada)
    
    // Importante: O backend retorna objetos aninhados (ordem_producao: {id: 1...}), 
    // mas para salvar precisamos apenas do ID.
    if (typeof form.value.ordem_producao === 'object') {
        form.value.ordem_producao = form.value.ordem_producao.id;
    }
  } else {
    isEditing.value = false
    editingId.value = null
    form.value = {
      ordem_producao: ordem.id,
      quantidade_aprovada: ordem.quantidade_produzir, 
      quantidade_rejeitada: 0,
      observacoes: '',
      status: 'APROVADO',
      inspetor: authStore.user.id
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  modalError.value = null
  modalSuccess.value = null
  
  try {
    // Prepara o payload com os nomes de campo que o Serializer espera (_id)
    const payload = {
        ordem_producao_id: form.value.ordem_producao, // Mudou de ordem_producao para ordem_producao_id
        quantidade_aprovada: form.value.quantidade_aprovada,
        quantidade_rejeitada: form.value.quantidade_rejeitada,
        observacoes: form.value.observacoes,
        status: form.value.status,
        inspetor_id: authStore.user.id // Garante que envia inspetor_id
    }

    if (isEditing.value) {
      await axios.put(`http://127.0.0.1:8000/api/fabrica/controle-qualidade/${editingId.value}/`, payload, {
        headers: { Authorization: `Token ${authStore.token}` }
      })
      modalSuccess.value = "Inspeção atualizada com sucesso!"
    } else {
      await axios.post('http://127.0.0.1:8000/api/fabrica/controle-qualidade/', payload, {
        headers: { Authorization: `Token ${authStore.token}` }
      })
      modalSuccess.value = "Inspeção registrada e estoque atualizado!"
    }

    await carregarDados()
    setTimeout(() => closeModal(), 1500)

  } catch (error) {
    console.error("Erro no envio:", error.response?.data || error)
    // Mostra detalhes do erro se disponíveis
    if (error.response?.data) {
        modalError.value = "Erro: " + JSON.stringify(error.response.data)
    } else {
        modalError.value = "Erro ao salvar. Verifique os dados."
    }
  }
}

const formatDateTime = (date) => new Date(date).toLocaleDateString('pt-BR')

onMounted(carregarDados)
</script>

<template>
  <AdminLayout>
    <div class="page-header-flex">
      <h1>Controle de Qualidade</h1>
      <button @click="carregarDados" class="btn-refresh">↻ Atualizar</button>
    </div>

    <div v-if="loading" class="loading-message">Carregando...</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <div v-if="!loading && !errorMessage" class="card-container">
      <table class="clean-table">
        <thead>
          <tr>
            <th>Ordem #</th>
            <th>Produto</th>
            <th>Qtd. Prevista</th>
            <th>Status Ordem</th>
            <th>Inspeção</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ordem in ordensComStatus" :key="ordem.id">
            <td>#{{ ordem.id }}</td>
            <td>
                {{ typeof ordem.produto_acabado === 'object' ? ordem.produto_acabado.nome : 'Produto ' + ordem.produto_acabado }}
            </td>
            <td>{{ ordem.quantidade_produzir }}</td>
            <td>
               <span :class="['badge', ordem.status === 'CONCLUIDA' ? 'badge-success' : 'badge-warning']">
                 {{ ordem.status }}
               </span>
            </td>
            <td>
              <div v-if="ordem.inspecao">
                <span :class="['badge', ordem.inspecao.status === 'APROVADO' ? 'badge-success' : 'badge-danger']">
                  {{ ordem.inspecao.status }}
                </span>
                <small class="d-block">
                   {{ ordem.inspecao.percentual_aprovacao }}% Aprovado
                </small>
              </div>
              <span v-else class="text-muted">-</span>
            </td>
            <td>
              <button 
                class="btn-action" 
                @click="openModal(ordem, ordem.inspecao)"
                :class="ordem.inspecao ? 'btn-edit' : 'btn-create'"
              >
                {{ ordem.inspecao ? 'Editar' : 'Avaliar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Editar Inspeção' : 'Nova Avaliação' }}</h2>
        <p class="modal-subtitle">Ordem #{{ form.ordem_producao }}</p>

        <div v-if="modalError" class="modal-error">{{ modalError }}</div>
        <div v-if="modalSuccess" class="modal-success">{{ modalSuccess }}</div>

        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label>Status da Qualidade:</label>
            <select v-model="form.status" required>
              <option value="APROVADO">Aprovado (Atualiza Estoque)</option>
              <option value="REPROVADO">Reprovado (Lote perdido)</option>
              <option value="PENDENTE">Pendente</option>
            </select>
          </div>

          <div class="form-row">
             <div class="form-group half">
               <label>Qtd. Aprovada:</label>
               <input type="number" v-model.number="form.quantidade_aprovada" min="0" required>
             </div>
             <div class="form-group half">
               <label>Qtd. Rejeitada:</label>
               <input type="number" v-model.number="form.quantidade_rejeitada" min="0" required>
             </div>
          </div>
          
          <div class="form-group">
            <label>Observações:</label>
            <input type="text" v-model="form.observacoes" placeholder="Motivo da rejeição, etc.">
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn-submit">{{ isEditing ? 'Salvar Alterações' : 'Finalizar Inspeção' }}</button>
            <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

  </AdminLayout>
</template>

<style scoped>
.page-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
h1 { color: #334155; margin: 0; font-size: 1.8rem; font-weight: 600; }

.card-container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.btn-refresh { background: none; border: 1px solid #cbd5e1; padding: 8px 15px; border-radius: 6px; cursor: pointer; color: #64748b; font-weight: 600; }
.btn-refresh:hover { background: #f1f5f9; color: #334155; }

.clean-table { width: 100%; border-collapse: collapse; }
.clean-table th { text-align: left; color: #94a3b8; padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 0.85rem; font-weight: 600; }
.clean-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 0.9rem; vertical-align: middle; }
.d-block { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }
.text-muted { color: #cbd5e1; }

.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; }
.badge-success { background-color: #dcfce7; color: #166534; }
.badge-warning { background-color: #fef9c3; color: #854d0e; }
.badge-danger { background-color: #fee2e2; color: #991b1b; }

.btn-action { padding: 6px 12px; border: none; border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: background 0.2s; }
.btn-create { background-color: #3b82f6; color: white; }
.btn-create:hover { background-color: #2563eb; }
.btn-edit { background-color: #e2e8f0; color: #475569; }
.btn-edit:hover { background-color: #cbd5e1; }

/* Modal (Reutilizado) */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 450px; max-width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.modal-content h2 { margin: 0; color: #334155; font-size: 1.4rem; }
.modal-subtitle { color: #64748b; font-size: 0.9rem; margin: 5px 0 20px; }
.form-group { margin-bottom: 1rem; }
.form-row { display: flex; gap: 10px; }
.form-group.half { flex: 1; }
.form-group label { display: block; margin-bottom: 5px; color: #64748b; font-size: 0.9rem; font-weight: 500; }
.form-group select, .form-group input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; color: #334155; outline: none; }
.form-group select:focus, .form-group input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
.btn-submit { background-color: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-cancel { background: white; border: 1px solid #cbd5e1; color: #64748b; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.modal-success { background: #dcfce7; color: #166534; padding: 10px; border-radius: 6px; margin-bottom: 15px; text-align: center; }
.modal-error { background: #fee2e2; color: #b91c1c; padding: 10px; border-radius: 6px; margin-bottom: 15px; text-align: center; }
</style>