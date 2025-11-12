<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="page-wrapper">
    <div class="confirmation-container">
      <div class="stepper">
        <span class="step">1 - Carrinho</span>
        <span class="step-line"></span>
        <span class="step">2 - Pagamento</span>
        <span class="step-line"></span>
        <span class="step active">3 - Confirmação</span>
      </div>

      <div class="confirmation-box">
        <h1>Pedido Confirmado!</h1>
        <p class="success-message">Obrigado, {{ authStore.user?.username }}!</p>
        <p>
          Seu pedido foi recebido com sucesso. Você receberá um e-mail de confirmação em breve com
          todos os detalhes.
        </p>
        <RouterLink to="/loja" class="btn btn-primary"> Continuar Comprando </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  background-color: #f9f9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
.confirmation-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
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

.confirmation-box {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

h1 {
  font-size: 2.5rem;
  color: #28a745;
  margin-bottom: 1rem;
}

.success-message {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
}

p {
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 12px 25px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1rem;
}
.btn-primary:hover {
  background-color: #0056b3;
}
</style>
