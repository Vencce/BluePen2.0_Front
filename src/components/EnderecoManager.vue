<script setup>
import { ref, onMounted, watch } from 'vue'; 
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import {  useRouter } from 'vue-router'; 

const authStore = useAuthStore();
const router = useRouter();

const enderecos = ref([]);
const errorMessage = ref(null);
const loading = ref(false);

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
});
const isEditing = ref(false);
const editingEnderecoId = ref(null);
const showForm = ref(false);

const loadingCEP = ref(false);
const fetchViaCEP = async (cepValue) => {
  const cepLimpo = cepValue.replace(/\D/g, '');
  if (cepLimpo.length !== 8) {
    return;
  }
  loadingCEP.value = true;
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (response.data.erro) {
      errorMessage.value = "CEP não encontrado.";
      novoEndereco.value.rua = '';
      novoEndereco.value.bairro = '';
      novoEndereco.value.cidade = '';
      novoEndereco.value.estado = '';
    } else {
      novoEndereco.value.rua = response.data.logradouro;
      novoEndereco.value.bairro = response.data.bairro;
      novoEndereco.value.cidade = response.data.localidade;
      novoEndereco.value.estado = response.data.uf;
    }
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    errorMessage.value = "Não foi possível consultar o CEP.";
  } finally {
    loadingCEP.value = false;
  }
};

watch(() => novoEndereco.value.cep, (newCep) => {
  if (newCep.replace(/\D/g, '').length === 8) {
    fetchViaCEP(newCep);
  }
});

const fetchEnderecos = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const response = await axios.get('https://bluepen-back.onrender.com/api/enderecos/', {
      headers: {
        'Authorization': `Token ${authStore.token}`
      }
    });
    enderecos.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar endereços:', error.response?.data || error.message);
    errorMessage.value = 'Erro ao carregar endereços.';
  } finally {
    loading.value = false;
  }
};

const handleAddOrUpdateEndereco = async () => {
  errorMessage.value = null;
  if (!authStore.token) {
    errorMessage.value = 'Usuário não autenticado.';
    return;
  }

  if (!novoEndereco.value.apelido || !novoEndereco.value.cep || !novoEndereco.value.rua ||
      !novoEndereco.value.numero || !novoEndereco.value.bairro || !novoEndereco.value.cidade ||
      !novoEndereco.value.estado) {
    errorMessage.value = 'Por favor, preencha todos os campos obrigatórios do endereço.';
    return;
  }

  try {
    let response;
    if (isEditing.value) {
      response = await axios.put(`https://bluepen-back.onrender.com/api/enderecos/${editingEnderecoId.value}/`, novoEndereco.value, {
        headers: {
          'Authorization': `Token ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Endereço atualizado:', response.data);
    } else {
      response = await axios.post('https://bluepen-back.onrender.com/api/enderecos/', novoEndereco.value, {
        headers: {
          'Authorization': `Token ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Novo endereço adicionado:', response.data);
    }

    await fetchEnderecos();
    resetForm();
    showForm.value = false;
  } catch (error) {
    console.error('Erro ao salvar endereço:', error.response?.data || error.message);
    if (error.response?.data && typeof error.response.data === 'object') {
        const firstErrorKey = Object.keys(error.response.data)[0];
        errorMessage.value = `Erro: ${error.response.data[firstErrorKey][0]}`;
    } else {
        errorMessage.value = 'Erro ao salvar o endereço.';
    }
  }
};

const editEndereco = (endereco) => {
  isEditing.value = true;
  editingEnderecoId.value = endereco.id;
  novoEndereco.value = { ...endereco };
  showForm.value = true;
};

const deleteEndereco = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este endereço?')) return;
  errorMessage.value = null;
  try {
    await axios.delete(`https://bluepen-back.onrender.com/api/enderecos/${id}/`, {
      headers: {
        'Authorization': `Token ${authStore.token}`
      }
    });
    console.log('Endereço excluído:', id);
    await fetchEnderecos();
  } catch (error) {
    console.error('Erro ao excluir endereço:', error.response?.data || error.message);
    errorMessage.value = 'Erro ao excluir o endereço.';
  }
};

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
  };
  isEditing.value = false;
  editingEnderecoId.value = null;
};

const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  if (authStore.token) {
    fetchEnderecos();
  } else {
    errorMessage.value = 'Faça login para gerenciar seus endereços.';
  }
});
</script>

<template>
  <div class="endereco-manager">
    <h2>Meus Endereços</h2>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="loading" class="loading-message">Carregando endereços...</div>

    <div v-if="!loading && enderecos.length === 0 && !showForm" class="no-enderecos">
      <p>Você ainda não tem endereços cadastrados.</p>
      <button @click="((showForm = true), resetForm())" class="btn btn-primary">
        Adicionar Primeiro Endereço
      </button>
    </div>

    <div v-if="enderecos.length > 0">
      <div class="endereco-list">
        <div
          v-for="endereco in enderecos"
          :key="endereco.id"
          :class="['endereco-card', { 'is-principal': endereco.is_principal }]"
        >
          <div class="endereco-info">
            <h3>
              {{ endereco.apelido }}
              <span v-if="endereco.is_principal" class="tag-principal">Principal</span>
            </h3>
            <p>
              {{ endereco.rua }}, {{ endereco.numero }}
              {{ endereco.complemento ? `- ${endereco.complemento}` : '' }}
            </p>
            <p>{{ endereco.bairro }}, {{ endereco.cidade }} - {{ endereco.estado }}</p>
            <p>CEP: {{ endereco.cep }}</p>
          </div>
          <div class="endereco-actions">
            <button @click="editEndereco(endereco)" class="btn btn-sm btn-edit">Editar</button>
            <button @click="deleteEndereco(endereco.id)" class="btn btn-sm btn-delete">
              Excluir
            </button>
          </div>
        </div>
      </div>
      <div class="endereco-actions">
        <button
          v-if="!showForm"
          @click="((showForm = true), resetForm())"
          class="btn btn-primary add-more-btn"
        >
          Adicionar Novo Endereço
        </button>
        <button @click="goBack" class="btn-back-profile">Voltar</button>
      </div>
    </div>

    <div v-if="showForm" class="endereco-form-section">
      <h3>{{ isEditing ? 'Editar Endereço' : 'Adicionar Novo Endereço' }}</h3>
      <form @submit.prevent="handleAddOrUpdateEndereco" class="endereco-form">
        <div class="form-group">
          <label for="apelido">Apelido (ex: Casa, Trabalho)</label>
          <input type="text" id="apelido" v-model="novoEndereco.apelido" required />
        </div>
        <div class="form-group">
          <label for="cep">CEP</label>
          <input
            type="text"
            id="cep-form"
            v-model="novoEndereco.cep"
            placeholder="00000-000"
            required
            :disabled="loadingCEP"
          />
          <span v-if="loadingCEP" class="cep-loading-form">Buscando CEP...</span>
        </div>
        <div class="form-group">
          <label for="rua">Rua / Avenida</label>
          <input type="text" id="rua-form" v-model="novoEndereco.rua" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="numero">Número</label>
            <input type="text" id="numero-form" v-model="novoEndereco.numero" required />
          </div>
          <div class="form-group">
            <label for="complemento">Complemento</label>
            <input type="text" id="complemento-form" v-model="novoEndereco.complemento" />
          </div>
        </div>
        <div class="form-group">
          <label for="bairro">Bairro</label>
          <input type="text" id="bairro-form" v-model="novoEndereco.bairro" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cidade">Cidade</label>
            <input type="text" id="cidade-form" v-model="novoEndereco.cidade" required />
          </div>
          <div class="form-group">
            <label for="estado">Estado</label>
            <input
              type="text"
              id="estado-form"
              v-model="novoEndereco.estado"
              required
              maxlength="2"
            />
          </div>
        </div>
        <div class="form-group checkbox-group">
          <input type="checkbox" id="is_principal" v-model="novoEndereco.is_principal" />
          <label for="is_principal">Marcar como endereço principal</label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-green">
            {{ isEditing ? 'Salvar Alterações' : 'Adicionar Endereço' }}
          </button>
          <button
            type="button"
            @click="((showForm = false), resetForm())"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.endereco-actions {
  display: flex;
}
.btn-back-profile {
  margin: 1rem 0;
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
  text-decoration: none;
}

.btn-back-profile:hover {
  background-color: #0056b3;
}

.endereco-manager {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 1rem;
  text-align: center;
}

h3 {
  font-size: 1.5rem;
  color: #555;
  margin-top: 2rem;
  margin-bottom: 1rem;
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

.loading-message,
.no-enderecos {
  text-align: center;
  padding: 2rem 0;
  color: #777;
}

.endereco-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.endereco-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.2s ease;
}

.endereco-card.is-principal {
  border-color: #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.1);
  background-color: #e9f5ff;
}

.endereco-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}
.endereco-info h3 .tag-principal {
  margin-left: 10px;
  background-color: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: normal;
}

.endereco-info p {
  margin: 0.3rem 0;
  color: #666;
}

.endereco-actions button {
  margin-left: 0.5rem;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-primary:hover {
  background-color: #0056b3;
}
.add-more-btn {
  display: block;
  width: fit-content;
  margin: 1rem auto;
}

.btn-green {
  background-color: #28a745;
  color: white;
}
.btn-green:hover {
  background-color: #218838;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 0.85rem;
}
.btn-edit {
  background-color: #ffc107;
  color: #333;
}
.btn-edit:hover {
  background-color: #e0a800;
}
.btn-delete {
  background-color: #dc3545;
  color: white;
}
.btn-delete:hover {
  background-color: #c82333;
}

.endereco-form-section {
  margin-top: 3rem;
  padding: 2rem;
  background-color: #fefefe;
  border: 1px solid #eee;
  border-radius: 8px;
}

.endereco-form .form-group {
  margin-bottom: 1rem;
  position: relative;
}
.endereco-form .form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}
.endereco-form .form-group input[type='text'],
.endereco-form .form-group input[type='number'] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
}

.endereco-form .form-row {
  display: flex;
  gap: 1rem;
}
.endereco-form .form-row .form-group {
  flex: 1;
}

.endereco-form .checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
.endereco-form .checkbox-group input[type='checkbox'] {
  margin-right: 0.5rem;
  transform: scale(1.2);
}
.endereco-form .checkbox-group label {
  margin-bottom: 0;
  font-weight: normal;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cep-loading-form {
  position: absolute;
  right: 10px;
  top: 60%;
  transform: translateY(-50%);
  color: #007bff;
  font-size: 0.8rem;
}
</style>