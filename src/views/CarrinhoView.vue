<script setup>
import { useCartStore } from '@/components/Cart'
import { RouterLink } from 'vue-router'

const cartStore = useCartStore()

const formatCurrency = (value) => {
  return parseFloat(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const removerItem = (id) => {
  cartStore.removeItem(id)
}

const atualizarQuantidade = (id, event) => {
  cartStore.updateQuantity(id, event.target.value)
}
</script>

<template>
  <div class="page-wrapper">
    <div class="cart-container">
      <div class="stepper">
        <span class="step active">1 - Carrinho</span>
        <span class="step-line"></span>
        <span class="step">2 - Pagamento</span>
        <span class="step-line"></span>
        <span class="step">3 - Confirmação</span>
      </div>

      <h1>MEU CARRINHO</h1>

      <div class="cart-layout">
        <div class="cart-items-column">
          <div v-if="cartStore.itemCount === 0" class="cart-empty">
            <h2 class="ifvazio">Seu carrinho está vazio.</h2>
            <RouterLink to="/loja" class="btn btn-gray">Voltar à Loja</RouterLink>
          </div>

          <div v-else>
            <div class="cart-header">
              <span class="header-produto">Produto</span>
              <span class="header-preco">Preço</span>
              <span class="header-qtd">Quantidade</span>
              <span class="header-total">Total</span>
            </div>

            <div class="cart-item" v-for="item in cartStore.items" :key="item.id">
              <div class="item-produto">
                <img :src="item.imagem" :alt="item.nome" class="item-img" />
                <div class="item-details">
                  <span class="item-name">{{ item.nome }}</span>
                  <a @click.prevent="removerItem(item.id)" class="item-remove">remover</a>
                </div>
              </div>
              <div class="item-preco">{{ formatCurrency(item.preco) }}</div>
              <div class="item-qtd">
                <input
                  type="number"
                  :value="item.quantity"
                  @change="atualizarQuantidade(item.id, $event)"
                  min="1"
                  class="quantity-input"
                />
              </div>
              <div class="item-total">
                {{ formatCurrency(item.preco * item.quantity) }}
              </div>
            </div>

            <div class="cart-actions">
              <div class="cupom-desconto">
                <label for="cupom">CUPOM DE DESCONTO</label>
                <div class="cupom-input-group">
                  <input type="text" id="cupom" placeholder="Código" />
                  <button class="btn btn-primary">Adicionar</button>
                </div>
              </div>
              <RouterLink to="/loja" class="btn btn-gray">Escolher mais produtos</RouterLink>
            </div>
          </div>
        </div>

        <div class="cart-summary-column" v-if="cartStore.itemCount > 0">
          <div class="summary-box">
            <div class="summary-line">
              <span>Subtotal</span>
              <span>{{ formatCurrency(cartStore.subtotal) }}</span>
            </div>
            <div class="summary-line">
              <span>Entrega</span>
              <a href="#" class="calcular-entrega">calcular</a>
            </div>
            <div class="summary-line total">
              <span>Total</span>
              <span>{{ formatCurrency(cartStore.subtotal) }}</span>
            </div>

            <RouterLink to="/pagamento" class="btn btn-green btn-full"> FECHAR PEDIDO </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
}
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.ifvazio {
  margin-bottom: 2rem;
  color: #555;
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

.cart-layout {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}
.cart-items-column {
  flex: 3; 
}
.cart-summary-column {
  flex: 1; 
  position: sticky;
  top: 2rem; 
}

.cart-header {
  display: flex;
  background-color: #007bff;
  color: white;
  padding: 0.75rem 1rem;
  font-weight: bold;
  border-radius: 4px 4px 0 0;
}
.header-produto {
  flex: 3;
}
.header-preco {
  flex: 2;
  text-align: right;
}
.header-qtd {
  flex: 1;
  text-align: center;
}
.header-total {
  flex: 2;
  text-align: right;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #ddd;
  background: white;
}
.item-produto {
  flex: 3;
  display: flex;
  align-items: center;
}
.item-preco {
  flex: 2;
  text-align: right;
  font-weight: bold;
  color: #555;
}
.item-qtd {
  flex: 1;
  text-align: center;
}
.item-total {
  flex: 2;
  text-align: right;
  font-weight: bold;
  color: #333;
}

.item-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 1px solid #eee;
  margin-right: 1rem;
}
.item-name {
  font-weight: bold;
  display: block;
  color: #333;
}
.item-remove {
  font-size: 0.9rem;
  color: #dc3545;
  cursor: pointer;
  text-decoration: underline;
}
.quantity-input {
  width: 60px;
  padding: 8px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: white;
  padding: 1.5rem 1rem;
  border-top: 1px solid #eee;
}
.cupom-desconto label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #555;
  display: block;
  margin-bottom: 0.5rem;
}
.cupom-input-group {
  display: flex;
}
.cupom-input-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-right: none;
  border-radius: 4px 0 0 4px;
}
.cupom-input-group button {
  border-radius: 0 4px 4px 0;
}

.summary-box {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1.5rem;
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
.calcular-entrega {
  text-decoration: underline;
  color: #007bff;
  cursor: pointer;
}

.btn {
  padding: 12px 20px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1rem;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-primary:hover {
  background-color: #004b9c;
}
.btn-gray {
  background-color: #f0f0f0;
  color: #555;
  border: 1px solid #ddd;
}
.btn-gray:hover {
  background-color: #e0e0e0;
}
.btn-green {
  background-color: #28a745;
  color: white;
}
.btn-green:hover {
  background-color: #218838;
}
.btn-full {
  width: 100%;
}

@media (max-width: 992px) {
  .cart-layout {
    flex-direction: column;
  }
  .cart-summary-column {
    position: static;
    flex: 1;
  }
  .cart-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
}
@media (max-width: 600px) {
  .cart-header {
    display: none;
  }
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .item-produto {
    width: 100%;
  }
  .item-preco,
  .item-qtd,
  .item-total {
    flex: none;
    width: 100%;
    text-align: left;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed #eee;
  }
  .item-preco::before,
  .item-qtd::before,
  .item-total::before {
    content: attr(data-label);
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 0.5rem;
  }
  .item-preco::before {
    content: 'Preço:';
  }
  .item-qtd::before {
    content: 'Quantidade:';
  }
  .item-total::before {
    content: 'Total:';
  }
}
</style>
