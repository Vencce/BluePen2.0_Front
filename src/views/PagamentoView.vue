<script setup>
import { ref, watch, onMounted } from 'vue'
import EnderecoManager from '@/components/EnderecoManager.vue'
import { useCartStore } from '@/components/Cart'
import { useAuthStore } from '@/stores/auth'
import { useRouter, RouterLink } from 'vue-router'
import axios from 'axios'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const selectedEnderecoId = ref(null)
const enderecosDisponiveis = ref([])

const cep = ref('')
const rua = ref('')
const numero = ref('')
const complemento = ref('')
const bairro = ref('')
const cidade = ref('')
const estado = ref('')

const paymentMethod = ref('pix')
const errorMessage = ref(null)
const loading = ref(true)
const loadingCEP = ref(false)

const frete = ref(0.0)
const total = ref(cartStore.subtotal + frete.value)

const formatCurrency = (value) => {
  const numericValue = parseFloat(value) || 0
  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const fetchViaCEP = async (cepValue) => {
  const cepLimpo = cepValue.replace(/\D/g, '')
  if (cepLimpo.length !== 8) {
    return
  }
  loadingCEP.value = true
  errorMessage.value = null
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)

    if (response.data.erro) {
      errorMessage.value = 'CEP não encontrado.'
      rua.value = ''
      bairro.value = ''
      cidade.value = ''
      estado.value = ''
    } else {
      rua.value = response.data.logradouro
      bairro.value = response.data.bairro
      cidade.value = response.data.localidade
      estado.value = response.data.uf
      document.getElementById('numero').focus()
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    errorMessage.value = 'Não foi possível consultar o CEP.'
  } finally {
    loadingCEP.value = false
  }
}

watch(cep, (newCep) => {
  if (newCep.replace(/\D/g, '').length === 8) {
    fetchViaCEP(newCep)
  }
})

const fetchEnderecosDoUsuario = async () => {
  if (!authStore.token) {
    errorMessage.value = 'Usuário não autenticado.'
    loading.value = false
    return
  }
  loading.value = true
  try {
    const response = await axios.get('https://bluepen-back.onrender.com/api/enderecos/', {
      headers: { Authorization: `Token ${authStore.token}` },
    })
    enderecosDisponiveis.value = response.data
    if (enderecosDisponiveis.value.length > 0) {
      const principal = enderecosDisponiveis.value.find((end) => end.is_principal)
      if (principal) {
        selectedEnderecoId.value = principal.id
      } else {
        selectedEnderecoId.value = enderecosDisponiveis.value[0].id
      }
    }
  } catch (error) {
    console.error('Erro ao carregar endereços do usuário:', error.response?.data || error.message)
    errorMessage.value = 'Erro ao carregar seus endereços salvos.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEnderecosDoUsuario()
})

const handleConfirmarPedido = async () => {
  errorMessage.value = null

  let enderecoParaPedido = {}

  if (selectedEnderecoId.value) {
    const enderecoSelecionado = enderecosDisponiveis.value.find(
      (end) => end.id === selectedEnderecoId.value,
    )
    if (!enderecoSelecionado) {
      errorMessage.value = 'Por favor, selecione um endereço de entrega válido.'
      return
    }
    enderecoParaPedido = {
      endereco_cep: enderecoSelecionado.cep,
      endereco_rua: enderecoSelecionado.rua,
      endereco_numero: enderecoSelecionado.numero,
      endereco_complemento: enderecoSelecionado.complemento,
      endereco_bairro: enderecoSelecionado.bairro,
      endereco_cidade: enderecoSelecionado.cidade,
      endereco_estado: enderecoSelecionado.estado,
    }
  } else {
    if (
      !cep.value ||
      !rua.value ||
      !numero.value ||
      !bairro.value ||
      !cidade.value ||
      !estado.value
    ) {
      errorMessage.value =
        'Por favor, preencha todos os campos do endereço obrigatórios ou selecione um endereço salvo.'
      return
    }
    enderecoParaPedido = {
      endereco_cep: cep.value,
      endereco_rua: rua.value,
      endereco_numero: numero.value,
      endereco_complemento: complemento.value,
      endereco_bairro: bairro.value,
      endereco_cidade: cidade.value,
      endereco_estado: estado.value,
    }
  }

  if (!authStore.token) {
    errorMessage.value = 'FATAL: Token de autenticação não encontrado! Faça login novamente.'
    return
  }

  const itensParaAPI = cartStore.items.map((item) => ({
    produto_id: item.id,
    quantidade: item.quantity,
  }))

  const orderData = {
    metodo_pagamento: paymentMethod.value,
    ...enderecoParaPedido,
    itens: itensParaAPI,
  }

  try {
    await axios.post('https://bluepen-back.onrender.com/api/pedidos/', orderData, {
      headers: {
        Authorization: `Token ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    cartStore.clearCart()
    router.push('/confirmacao')
  } catch (error) {
    console.error('Erro ao criar pedido:', error.response?.data || error.message)
    if (error.response?.status === 403) {
      errorMessage.value = 'Erro de permissão (403). Verifique o login.'
    } else if (error.response?.data) {
      const errors = error.response.data
      if (
        errors.non_field_errors &&
        Array.isArray(errors.non_field_errors) &&
        errors.non_field_errors.length > 0
      ) {
        errorMessage.value = errors.non_field_errors[0]
      } else if (errors.itens && Array.isArray(errors.itens) && errors.itens.length > 0) {
        const itemError = errors.itens[0]
        if (typeof itemError === 'object' && Object.keys(itemError).length > 0) {
          const firstErrorKey = Object.keys(itemError)[0]
          errorMessage.value = `Erro no item (campo '${firstErrorKey}'): ${itemError[firstErrorKey][0]}`
        } else {
          errorMessage.value = `Erro no item: ${itemError}`
        }
      } else if (typeof errors === 'string') {
        errorMessage.value = errors
      } else if (typeof errors === 'object' && Object.keys(errors).length > 0) {
        const firstErrorKey = Object.keys(errors)[0]
        errorMessage.value = `Erro no campo '${firstErrorKey}': ${errors[firstErrorKey][0]}`
      } else {
        errorMessage.value = 'Ocorreu um erro inesperado ao processar seu pedido.'
      }
    } else {
      errorMessage.value = 'Não foi possível conectar ao servidor.'
    }
  }
}
</script>

<template>
  <div class="page-wrapper">
    <div class="payment-container">
      <div class="stepper">
        <RouterLink to="/carrinho" class="step">1 - Carrinho</RouterLink>
        <span class="step-line"></span>
        <span class="step active">2 - Pagamento</span>
        <span class="step-line"></span>
        <span class="step">3 - Confirmação</span>
      </div>
      <h1>PAGAMENTO</h1>
      <form @submit.prevent="handleConfirmarPedido" class="payment-layout">
        <div class="payment-details-column">
          <div class="address-selection-section">
            <h2>Selecione o Endereço de Entrega</h2>
            <p v-if="loading">Carregando seus endereços...</p>
            <p v-if="errorMessage && !loading" class="error-message">{{ errorMessage }}</p>

            <div v-if="enderecosDisponiveis.length > 0 && !loading">
              <div class="saved-address-list">
                <label
                  v-for="endereco in enderecosDisponiveis"
                  :key="endereco.id"
                  class="address-option"
                >
                  <input
                    type="radio"
                    :value="endereco.id"
                    v-model="selectedEnderecoId"
                    name="selectedAddress"
                  />
                  <div
                    :class="[
                      'address-card-option',
                      { selected: selectedEnderecoId === endereco.id },
                    ]"
                  >
                    <span class="address-title"
                      >{{ endereco.apelido }}
                      <span v-if="endereco.is_principal" class="tag-principal-option"
                        >Principal</span
                      ></span
                    >
                    <p>
                      {{ endereco.rua }}, {{ endereco.numero }}
                      {{ endereco.complemento ? `- ${endereco.complemento}` : '' }}
                    </p>
                    <p>{{ endereco.bairro }}, {{ endereco.cidade }} - {{ endereco.estado }}</p>
                    <p>CEP: {{ endereco.cep }}</p>
                  </div>
                </label>
              </div>
              <p class="manage-addresses-link-container">
                <RouterLink to="/meus-enderecos" class="manage-addresses-link"
                  >Gerenciar meus endereços salvos</RouterLink
                >
              </p>
            </div>

            <div v-else-if="!loading && enderecosDisponiveis.length === 0">
              <p class="no-saved-addresses">
                Você não tem endereços salvos. Por favor, adicione um novo endereço abaixo:
              </p>
              <div class="new-address-form-payment">
                <div class="form-group">
                  <label for="cep">CEP</label>
                  <input
                    type="text"
                    id="cep"
                    v-model="cep"
                    placeholder="00000-000"
                    required
                    :disabled="loadingCEP"
                  />
                  <span v-if="loadingCEP" class="cep-loading">Buscando...</span>
                </div>
                <div class="form-group">
                  <label for="rua">Rua / Avenida</label>
                  <input type="text" id="rua" v-model="rua" placeholder="Nome da rua" required />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for="numero">Número</label>
                    <input type="text" id="numero" v-model="numero" placeholder="123" required />
                  </div>
                  <div class="form-group">
                    <label for="complemento">Complemento</label>
                    <input
                      type="text"
                      id="complemento"
                      v-model="complemento"
                      placeholder="Apto, Bloco, etc."
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label for="bairro">Bairro</label>
                  <input
                    type="text"
                    id="bairro"
                    v-model="bairro"
                    placeholder="Seu bairro"
                    required
                  />
                </div>
                <div class="form-row">
                  <div class="form-group" style="flex: 2">
                    <label for="cidade">Cidade</label
                    ><input
                      type="text"
                      id="cidade"
                      v-model="cidade"
                      placeholder="Sua cidade"
                      required
                    />
                  </div>
                  <div class="form-group" style="flex: 1">
                    <label for="estado">Estado</label
                    ><input type="text" id="estado" v-model="estado" placeholder="UF" required />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="payment-options-section">
            <h2>Método de Pagamento</h2>
            <div class="payment-options">
              <label class="payment-method">
                <input type="radio" v-model="paymentMethod" value="pix" name="payment" />
                <div class="method-box">
                  <span class="method-title">PIX</span>
                  <span class="method-desc">Aprovação imediata.</span>
                </div>
              </label>
              <label class="payment-method">
                <input type="radio" v-model="paymentMethod" value="boleto" name="payment" />
                <div class="method-box">
                  <span class="method-title">Boleto Bancário</span>
                  <span class="method-desc">Até 3 dias úteis.</span>
                </div>
              </label>
              <label class="payment-method">
                <input type="radio" v-model="paymentMethod" value="cartao" name="payment" />
                <div class="method-box">
                  <span class="method-title">Cartão de Crédito</span>
                  <span class="method-desc">Pague em até 12x.</span>
                </div>
              </label>
            </div>

            <div v-if="paymentMethod === 'cartao'" class="card-details">
              <h3>Dados do Cartão</h3>
              <div class="form-group">
                <label for="card-number">Número do Cartão</label>
                <input type="text" id="card-number" placeholder="0000 0000 0000 0000" />
              </div>
              <div class="form-group">
                <label for="card-name">Nome no Cartão</label>
                <input type="text" id="card-name" placeholder="Como está escrito no cartão" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="card-expiry">Validade (MM/AA)</label>
                  <input type="text" id="card-expiry" placeholder="MM/AA" />
                </div>
                <div class="form-group">
                  <label for="card-cvv">CVV</label>
                  <input type="text" id="card-cvv" placeholder="123" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="payment-summary-column">
          <div class="summary-box">
            <h2>Resumo do Pedido</h2>
            <div class="summary-line">
              <span>Subtotal</span><span>{{ formatCurrency(cartStore.subtotal) }}</span>
            </div>
            <div class="summary-line">
              <span>Frete</span><span>{{ formatCurrency(frete) }}</span>
            </div>
            <div class="summary-line total">
              <span>Total</span><span>{{ formatCurrency(total) }}</span>
            </div>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <button type="submit" class="btn btn-green btn-full">FINALIZAR E PAGAR</button>
            <RouterLink to="/carrinho" class="back-link"> Voltar ao Carrinho </RouterLink>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.address-selection-section {
  margin-bottom: 2.5rem;
}

.no-saved-addresses {
  color: #333;
}

.saved-address-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.address-option {
  display: block;
  cursor: pointer;
}

.address-option input[type='radio'] {
  display: none;
}

.address-card-option {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fefefe;
  transition: all 0.2s ease;
}

.address-card-option:hover {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.1);
}

.address-card-option.selected {
  border: 2px solid #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.2);
  background-color: #e9f5ff;
}

.address-card-option .address-title {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.address-card-option p {
  margin: 0.2rem 0;
  color: #666;
  font-size: 0.9rem;
}

.tag-principal-option {
  margin-left: 10px;
  background-color: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: normal;
}

.manage-addresses-link-container {
  text-align: center;
  margin-top: 1rem;
}
.manage-addresses-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}
.manage-addresses-link:hover {
  text-decoration: underline;
}

.new-address-form-payment {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #ddd;
}
.cep-loading {
  position: absolute;
  right: 15px;
  top: 40px;
  color: #007bff;
  font-size: 0.9rem;
  font-weight: bold;
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

.page-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
}
.payment-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 2rem;
  color: #aaa;
  font-weight: bold;
}
.step {
  padding: 0 1rem;
  text-decoration: none;
  color: #aaa;
}
.step.active {
  color: #333;
}
.step-line {
  flex-grow: 1;
  height: 2px;
  background-color: #ddd;
  max-width: 150px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: left;
  color: #333;
}
h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

h3 {
  color: #333;
}

.payment-layout {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}
.payment-details-column {
  flex: 2;
  background: white;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.payment-summary-column {
  flex: 1;
  position: sticky;
  top: 2rem;
}

.address-section {
  margin-bottom: 2.5rem;
}
.form-group {
  margin-bottom: 1rem;
  color: #333;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.form-row .form-group {
  flex: 1;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.payment-method {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.payment-method input[type='radio'] {
  display: none;
}
.payment-method .method-box {
  padding: 1.5rem;
  width: 100%;
}
.method-title {
  font-weight: bold;
  font-size: 1.1rem;
  display: block;
  color: #333;
}
.method-desc {
  font-size: 0.9rem;
  color: #666;
}
.payment-method input[type='radio']:checked + .method-box {
  border: 2px solid #007bff;
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.2);
  border-radius: 6px;
  background-color: #f8faff;
}

.card-details {
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.summary-box {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1.5rem;
}
.summary-box h2 {
  font-size: 1.25rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}
.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #555;
}
.summary-line.total {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}
.back-link {
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}
.back-link:hover {
  text-decoration: underline;
}

.btn-green {
  background-color: #28a745;
  color: white;
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-green:hover {
  background-color: #218838;
}

@media (max-width: 768px) {
  .payment-layout {
    flex-direction: column-reverse;
  }
  .payment-summary-column {
    position: static;
  }
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
