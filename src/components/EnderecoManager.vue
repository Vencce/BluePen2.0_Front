<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import HeaderComponentLoja from '@/components/HeaderComponentLoja.vue'
import FooterComponent from '@/components/FooterComponent.vue'

const API_BASE = 'https://bluepen-back.onrender.com'

const authStore = useAuthStore()
const router = useRouter()

const enderecos = ref([])
const errorMessage = ref(null)
const loading = ref(false)

const novoEndereco = ref({
  apelido: '',
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  is_principal: false,
})

const isEditing = ref(false)
const editingEnderecoId = ref(null)
const showForm = ref(false)

const loadingCEP = ref(false)

const fetchViaCEP = async (cepValue) => {
  const cepLimpo = cepValue.replace(/\D/g, '')
  if (cepLimpo.length !== 8) {
    return
  }
  
  loadingCEP.value = true
  
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)
    
    if (response.data.erro) {
      errorMessage.value = "CEP não encontrado."
      novoEndereco.value.rua = ''
      novoEndereco.value.bairro = ''
      novoEndereco.value.cidade = ''
      novoEndereco.value.estado = ''
    } else {
      novoEndereco.value.rua = response.data.logradouro
      novoEndereco.value.bairro = response.data.bairro
      novoEndereco.value.cidade = response.data.localidade
      novoEndereco.value.estado = response.data.uf
      errorMessage.value = null
    }
  } catch (error) {
    errorMessage.value = "Não foi possível consultar o CEP."
  } finally {
    loadingCEP.value = false
  }
}

watch(() => novoEndereco.value.cep, (newCep) => {
  if (newCep.replace(/\D/g, '').length === 8) {
    fetchViaCEP(newCep)
  }
})

const fetchEnderecos = async () => {
  loading.value = true
  errorMessage.value = null
  
  try {
    const response = await axios.get(`${API_BASE}/api/enderecos/`, {
      headers: {
        'Authorization': `Token ${authStore.token}`
      }
    })
    enderecos.value = response.data
  } catch (error) {
    errorMessage.value = 'Erro ao carregar endereços.'
  } finally {
    loading.value = false
  }
}

const handleAddOrUpdateEndereco = async () => {
  errorMessage.value = null
  
  if (!authStore.token) {
    errorMessage.value = 'Usuário não autenticado.'
    return
  }

  if (!novoEndereco.value.apelido || !novoEndereco.value.cep || !novoEndereco.value.rua ||
      !novoEndereco.value.numero || !novoEndereco.value.bairro || !novoEndereco.value.cidade ||
      !novoEndereco.value.estado) {
    errorMessage.value = 'Por favor, preencha todos os campos obrigatórios.'
    return
  }

  try {
    if (isEditing.value) {
      await axios.put(`${API_BASE}/api/enderecos/${editingEnderecoId.value}/`, novoEndereco.value, {
        headers: {
          'Authorization': `Token ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })
    } else {
      await axios.post(`${API_BASE}/api/enderecos/`, novoEndereco.value, {
        headers: {
          'Authorization': `Token ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      })
    }

    await fetchEnderecos()
    resetForm()
    showForm.value = false
  } catch (error) {
    if (error.response?.data && typeof error.response.data === 'object') {
        const firstErrorKey = Object.keys(error.response.data)[0]
        errorMessage.value = `Erro: ${error.response.data[firstErrorKey][0]}`
    } else {
        errorMessage.value = 'Erro ao salvar o endereço.'
    }
  }
}

const editEndereco = (endereco) => {
  isEditing.value = true
  editingEnderecoId.value = endereco.id
  novoEndereco.value = { ...endereco }
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteEndereco = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este endereço?')) return
  
  errorMessage.value = null
  
  try {
    await axios.delete(`${API_BASE}/api/enderecos/${id}/`, {
      headers: {
        'Authorization': `Token ${authStore.token}`
      }
    })
    await fetchEnderecos()
  } catch (error) {
    errorMessage.value = 'Erro ao excluir o endereço.'
  }
}

const resetForm = () => {
  novoEndereco.value = {
    apelido: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    is_principal: false,
  }
  isEditing.value = false
  editingEnderecoId.value = null
  errorMessage.value = null
}

const goBack = () => {
  router.push('/conta')
}

onMounted(() => {
  if (authStore.token) {
    fetchEnderecos()
  } else {
    errorMessage.value = 'Faça login para gerenciar seus endereços.'
  }
})
</script>

<template>
  <div class="page-wrapper">
    <HeaderComponentLoja />
    
    <main class="endereco-container">
      <div class="header-section">
        <button @click="goBack" class="btn-back-profile">
          <span class="icon">&larr;</span> Voltar para Minha Conta
        </button>
        <h1>Gerenciar Endereços</h1>
      </div>

      <div v-if="errorMessage" class="alert-message error">
        {{ errorMessage }}
      </div>

      <div v-if="loading" class="loading-state">
        <span class="loader"></span>
        <p>Carregando seus endereços...</p>
      </div>

      <div v-if="!loading && enderecos.length === 0 && !showForm" class="empty-state">
        <div class="empty-icon">📍</div>
        <h2>Nenhum endereço cadastrado</h2>
        <p>Adicione um endereço para facilitar suas futuras compras.</p>
        <button @click="((showForm = true), resetForm())" class="btn-primary mt-3">
          Adicionar Primeiro Endereço
        </button>
      </div>

      <div v-if="!loading && !showForm && enderecos.length > 0" class="address-grid">
        <div
          v-for="endereco in enderecos"
          :key="endereco.id"
          :class="['address-card', { 'is-principal': endereco.is_principal }]"
        >
          <div class="card-header">
            <h3 class="card-title">
              <span class="tag-icon">{{ endereco.apelido.toLowerCase() === 'casa' ? '🏠' : (endereco.apelido.toLowerCase() === 'trabalho' ? '🏢' : '📍') }}</span>
              {{ endereco.apelido }}
            </h3>
            <span v-if="endereco.is_principal" class="badge-principal">Principal</span>
          </div>
          
          <div class="card-body">
            <p class="address-line"><strong>Rua:</strong> {{ endereco.rua }}, {{ endereco.numero }}</p>
            <p v-if="endereco.complemento" class="address-line"><strong>Complemento:</strong> {{ endereco.complemento }}</p>
            <p class="address-line"><strong>Bairro:</strong> {{ endereco.bairro }}</p>
            <p class="address-line"><strong>Cidade:</strong> {{ endereco.cidade }} - {{ endereco.estado }}</p>
            <p class="address-line"><strong>CEP:</strong> {{ endereco.cep }}</p>
          </div>

          <div class="card-footer">
            <button @click="editEndereco(endereco)" class="btn-action btn-edit">Editar</button>
            <button @click="deleteEndereco(endereco.id)" class="btn-action btn-delete">Excluir</button>
          </div>
        </div>
      </div>

      <div v-if="!loading && !showForm && enderecos.length > 0" class="actions-wrapper">
        <button @click="((showForm = true), resetForm())" class="btn-primary btn-add-new">
          + Adicionar Novo Endereço
        </button>
      </div>

      <div v-if="showForm" class="form-section">
        <div class="form-header">
          <h2>{{ isEditing ? 'Editar Endereço' : 'Adicionar Novo Endereço' }}</h2>
          <p>Preencha as informações abaixo para salvar na sua conta.</p>
        </div>

        <form @submit.prevent="handleAddOrUpdateEndereco" class="modern-form">
          <div class="form-row">
            <div class="input-group flex-2">
              <label for="apelido">Apelido do Endereço</label>
              <input type="text" id="apelido" v-model="novoEndereco.apelido" placeholder="Ex: Casa, Trabalho, Praia" required />
            </div>
            <div class="input-group flex-1">
              <label for="cep">CEP</label>
              <div class="input-with-icon">
                <input
                  type="text"
                  id="cep"
                  v-model="novoEndereco.cep"
                  placeholder="00000-000"
                  maxlength="9"
                  required
                  :disabled="loadingCEP"
                />
                <span v-if="loadingCEP" class="loading-cep-indicator">⏳</span>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="input-group flex-3">
              <label for="rua">Rua / Avenida</label>
              <input type="text" id="rua" v-model="novoEndereco.rua" placeholder="Nome da rua" required />
            </div>
            <div class="input-group flex-1">
              <label for="numero">Número</label>
              <input type="text" id="numero" v-model="novoEndereco.numero" placeholder="Nº" required />
            </div>
          </div>

          <div class="form-row">
            <div class="input-group flex-1">
              <label for="complemento">Complemento <span class="optional">(Opcional)</span></label>
              <input type="text" id="complemento" v-model="novoEndereco.complemento" placeholder="Apto, Bloco, etc." />
            </div>
            <div class="input-group flex-1">
              <label for="bairro">Bairro</label>
              <input type="text" id="bairro" v-model="novoEndereco.bairro" placeholder="Nome do bairro" required />
            </div>
          </div>

          <div class="form-row">
            <div class="input-group flex-2">
              <label for="cidade">Cidade</label>
              <input type="text" id="cidade" v-model="novoEndereco.cidade" placeholder="Sua cidade" required />
            </div>
            <div class="input-group flex-1">
              <label for="estado">Estado (UF)</label>
              <input
                type="text"
                id="estado"
                v-model="novoEndereco.estado"
                placeholder="Ex: SP"
                required
                maxlength="2"
                class="uppercase-input"
              />
            </div>
          </div>

          <div class="checkbox-wrapper">
            <label class="custom-checkbox">
              <input type="checkbox" v-model="novoEndereco.is_principal" />
              <span class="checkmark"></span>
              Definir como meu endereço principal de entrega
            </label>
          </div>

          <div class="form-buttons">
            <button type="button" @click="((showForm = false), resetForm())" class="btn-cancelar">
              Cancelar
            </button>
            <button type="submit" class="btn-salvar">
              {{ isEditing ? 'Salvar Alterações' : 'Cadastrar Endereço' }}
            </button>
          </div>
        </form>
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.endereco-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  flex-grow: 1;
  width: 100%;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2.5rem;
}

.header-section h1 {
  font-size: 2.2rem;
  color: #1e293b;
  font-weight: 700;
  margin-top: 1rem;
}

.btn-back-profile {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}

.btn-back-profile:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.btn-back-profile .icon {
  margin-right: 6px;
  font-size: 1.2rem;
}

.alert-message {
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 500;
}

.alert-message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #64748b;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #cbd5e1;
  border-bottom-color: #3b82f6;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  background-color: #fff;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px dashed #cbd5e1;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.empty-state h2 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 2rem;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.address-card {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.address-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.address-card.is-principal {
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.badge-principal {
  background-color: #dbeafe;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-body {
  flex-grow: 1;
  margin-bottom: 1.5rem;
}

.address-line {
  color: #475569;
  font-size: 0.95rem;
  margin: 0.35rem 0;
  line-height: 1.4;
}

.address-line strong {
  color: #1e293b;
  font-weight: 600;
}

.card-footer {
  display: flex;
  gap: 10px;
}

.btn-action {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.btn-edit {
  background-color: #f1f5f9;
  color: #334155;
}

.btn-edit:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.btn-delete {
  background-color: #fee2e2;
  color: #b91c1c;
}

.btn-delete:hover {
  background-color: #fecaca;
  color: #991b1b;
}

.actions-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-add-new {
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.form-section {
  background-color: #fff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-header h2 {
  font-size: 1.8rem;
  color: #0f172a;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: #64748b;
  font-size: 1rem;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }
.flex-3 { flex: 3; }

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.optional {
  font-weight: 400;
  color: #94a3b8;
  font-size: 0.8rem;
}

.input-group input {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  color: #1e293b;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  background-color: #fff;
}

.input-group input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.input-group input::placeholder {
  color: #94a3b8;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon input {
  width: 100%;
}

.loading-cep-indicator {
  position: absolute;
  right: 12px;
  font-size: 1.1rem;
}

.uppercase-input {
  text-transform: uppercase;
}

.checkbox-wrapper {
  margin: 1rem 0;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
  color: #334155;
  font-weight: 500;
  user-select: none;
}

.custom-checkbox input {
  margin-right: 10px;
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
  cursor: pointer;
}

.form-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.btn-salvar {
  flex: 2;
  background-color: #10b981;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-salvar:hover {
  background-color: #059669;
}

.btn-cancelar {
  flex: 1;
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  padding: 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancelar:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .form-section {
    padding: 1.5rem;
  }
  
  .form-buttons {
    flex-direction: column-reverse;
  }
  
  .btn-salvar, .btn-cancelar {
    width: 100%;
  }

  .endereco-container {
    padding: 1.5rem 1rem;
  }
}
</style>