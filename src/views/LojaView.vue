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
    const response = await axios.get('https://bluepen-back.onrender.com/api/produtos/')
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
    
    <section class="hero-banner">
        <div class="hero-content">
            <h1>Qualidade que inspira.</h1>
            <p>Encontre a caneta perfeita para cada traço da sua história.</p>
            <a href="#produtos" class="btn-hero">Ver Coleção</a>
        </div>
    </section>

    <main class="loja-container" id="produtos">
      <div class="section-header">
        <h2>Nossos Produtos</h2>
        <div class="line"></div>
      </div>

      <div v-if="erroCarregamento">
        <p class="erro-api">{{ erroCarregamento }}</p>
      </div>

      <div v-else-if="produtos.length === 0">
        <p class="loading-text">Carregando catálogo...</p>
      </div>

      <div class="produto-grid" v-else>
        <div class="produto-card" v-for="produto in produtos" :key="produto.id">
          
          <div class="card-image-wrapper">
            <img :src="produto.imagem" :alt="produto.nome" class="produto-img" />
            <div class="card-overlay" v-if="produto.estoque <= 0">
                <span class="badge-esgotado">Esgotado</span>
            </div>
          </div>

          <div class="produto-info">
            <div class="info-top">
                <h3 class="produto-nome">{{ produto.nome }}</h3>
                <span class="produto-categoria">Escritório</span>
            </div>

            <div class="info-bottom">
                <p class="produto-preco">
                R$ {{ parseFloat(produto.preco).toFixed(2).replace('.', ',') }}
                </p>

                <div v-if="produto.estoque > 0">
                    <button @click="cartStore.addItem(produto)" class="btn-add-cart">
                        Adicionar 
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    </button>
                    <p class="estoque-aviso">{{ produto.estoque }} unidades disponíveis</p>
                </div>

                <div v-else>
                    <button class="btn-esgotado" disabled>Indisponível</button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <FooterComponent />
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Inter', sans-serif;
}

.hero-banner {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    color: white;
    padding: 4rem 2rem;
    text-align: center;
    border-radius: 0 0 20px 20px;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2);
    margin-bottom: 3rem;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
}

.hero-banner h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
    letter-spacing: -1px;
}

.hero-banner p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.btn-hero {
    display: inline-block;
    background-color: white;
    color: #1d4ed8;
    padding: 12px 30px;
    border-radius: 50px;
    font-weight: 700;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
}
.btn-hero:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.loja-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
  flex-grow: 1;
  width: 100%;
}

.section-header {
    text-align: center;
    margin-bottom: 3rem;
}

.section-header h2 {
    font-size: 2rem;
    color: #1e293b;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.line {
    width: 60px;
    height: 4px;
    background-color: #3b82f6;
    margin: 0 auto;
    border-radius: 2px;
}

.produto-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  width: 100%;
}

.produto-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  width: 280px;
  flex-grow: 0;
}

.produto-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.card-image-wrapper {
    position: relative;
    height: 220px;
    background-color: #f1f5f9;
    overflow: hidden;
}

.produto-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 20px;
  transition: transform 0.3s ease;
}

.produto-card:hover .produto-img {
    transform: scale(1.05);
}

.card-overlay {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(255,255,255,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
}

.badge-esgotado {
    background-color: #ef4444;
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
}

.produto-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}

.produto-nome {
  font-size: 1.1rem;
  font-weight: 700;
  color: #334155;
  margin: 0 0 5px 0;
  line-height: 1.4;
}

.produto-categoria {
    font-size: 0.8rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-bottom {
    margin-top: 1.5rem;
}

.produto-preco {
  font-size: 1.5rem;
  font-weight: 800;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.btn-add-cart {
  width: 100%;
  padding: 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-add-cart:hover {
  background-color: #2563eb;
}

.btn-esgotado {
  width: 100%;
  padding: 12px;
  background-color: #e2e8f0;
  color: #94a3b8;
  border: none;
  border-radius: 8px;
  cursor: not-allowed;
  font-weight: 600;
}

.estoque-aviso {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  margin-top: 10px;
}

.erro-api { color: #ef4444; text-align: center; font-weight: 500; margin-top: 2rem; }
.loading-text { color: #64748b; text-align: center; margin-top: 2rem; }

@media (max-width: 768px) {
    .hero-banner h1 { font-size: 2rem; }
    .card-image-wrapper { height: 180px; }
    .produto-preco { font-size: 1.3rem; }
    .produto-card { width: 100%; max-width: 300px; }
}
</style>