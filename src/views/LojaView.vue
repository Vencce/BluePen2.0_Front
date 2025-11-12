<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/components/Cart'
import axios from 'axios'
import FooterComponent from '@/components/FooterComponent.vue'
import HeaderComponentLoja from '@/components/HeaderComponentLoja.vue'

const cartStore = useCartStore()

const produtos = ref([])
const erroCarregamento = ref(null)

const carregarProdutos = async () => {
  erroCarregamento.value = null
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/produtos/')
    produtos.value = response.data
  } catch (error) {
    console.error('Erro ao carregar produtos:', error)
    erroCarregamento.value = 'Não foi possível carregar os produtos.'
  }
}

onMounted(() => {
  carregarProdutos()
})
</script>

<template>
  <div class="page-wrapper">
    <HeaderComponentLoja />
    <main class="loja-container">
      <h1>Nosso Produto</h1>

      <div v-if="erroCarregamento">
        <p class="erro-api">{{ erroCarregamento }}</p>
      </div>

      <div v-else-if="produtos.length === 0">
        <p>Carregando produtos...</p>
      </div>

      <div class="produto-grid" v-else>
        <div class="produto-card" v-for="produto in produtos" :key="produto.id">
          <div class="produto-imagem">
            <img :src="produto.imagem" :alt="produto.nome" />
          </div>

          <div class="produto-info">
            <h3 class="produto-nome">{{ produto.nome }}</h3>

            <p class="produto-preco">
              R$ {{ parseFloat(produto.preco).toFixed(2).replace('.', ',') }}
            </p>

            <div v-if="produto.estoque > 0">
              <button @click="cartStore.addItem(produto)" class="btn btn-comprar">
                Adicionar ao Carrinho
              </button>
              <p class="estoque-aviso">Disponível: {{ produto.estoque }}</p>
            </div>

            <div v-else>
              <button class="btn btn-comprar btn-esgotado" disabled>Esgotado</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <FooterComponent />
  </div>
</template>

<style scoped>
.erro-api {
  color: #dc3545;
  font-size: 1.2rem;
  text-align: center;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.page-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
}

nav {
  display: flex;
  align-items: center;
}

.loja-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.produto-card {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.produto-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.produto-imagem img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.produto-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.produto-nome {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  min-height: 44px;
}

.produto-preco {
  font-size: 1.25rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 1rem;
  margin-top: auto;
}

.btn-comprar {
  width: 100%;
  font-size: 1rem;
  font-weight: bold;
  padding: 12px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-decoration: none;
  text-align: center;
}

.btn-comprar:hover {
  background-color: #0056b3;
}

.btn-esgotado {
  background-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}
.btn-esgotado:hover {
  background-color: #6c757d;
}
.estoque-aviso {
  font-size: 0.8rem;
  color: #555;
  text-align: center;
  margin-top: 8px;
}
</style>
