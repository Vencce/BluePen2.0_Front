<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/components/Cart'

const authStore = useAuthStore()
const cartStore = useCartStore()

const fazerLogout = () => {
  authStore.logout()
}
</script>

<template>
  <header class="loja-header">
    <div class="header-container">
      <RouterLink to="/loja">
        <img class="logo" src="../assets/imagens/logo.png" alt="Logo da PenStore" />
      </RouterLink>
      <nav>
        <RouterLink to="/minha-conta" class="avatar-link">
          <img
            :src="authStore.avatarUrl"
            @error="($event) => ($event.target.src = 'URL_PARA_UM_DEFAULT_ICON.png')"
            alt="Meu Perfil"
            class="header-avatar"
          />
        </RouterLink>
        <RouterLink to="/carrinho" class="btn btn-cart">
          Carrinho ({{ cartStore.itemCount }})
        </RouterLink>
        <button @click="fazerLogout" class="btn btn-logout">Sair</button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.avatar-link {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  border: 2px solid #007bff;
  transition: transform 0.2s ease;
}
.avatar-link:hover {
  transform: scale(1.1);
}
.header-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.loja-header {
  background-color: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  max-width: 200px;
  height: auto;
}

.btn-cart {
  font-size: 0.9rem;
  font-weight: bold;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-decoration: none;
  margin-right: 10px;
}
.btn-cart:hover {
  background-color: #0056b3;
}

.btn-logout {
  font-size: 0.9rem;
  font-weight: bold;
  padding: 11px 20px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-decoration: none;
}

.btn-logout:hover {
  background-color: #c82333;
}
</style>
