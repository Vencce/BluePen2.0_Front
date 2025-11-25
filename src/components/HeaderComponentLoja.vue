<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/components/Cart'

const authStore = useAuthStore()
const cartStore = useCartStore()

const fazerLogout = () => {
  authStore.logout()
}

const setDefaultAvatar = (event) => {
  event.target.src = 'https://bluepen-back.onrender.com/media/avatars/default.png'
}
</script>

<template>
  <header class="loja-header">
    <div class="header-container">
      <div class="brand-area">
        <RouterLink to="/loja" class="logo-link">
          <img class="logo" src="../assets/imagens/logo.png" alt="Logo da PenStore" />
        </RouterLink>
      </div>

      <nav class="header-nav">
        <RouterLink to="/carrinho" class="nav-item cart-container">
          <div class="icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
          </div>
          <span class="nav-label">Carrinho</span>
        </RouterLink>

        <div class="divider"></div>

        <div class="user-menu">
          <RouterLink to="/minha-conta" class="user-profile">
            <img
              :src="authStore.avatarUrl"
              @error="setDefaultAvatar"
              alt="Perfil"
              class="avatar-img"
            />
            <span class="username">Minha Conta</span>
          </RouterLink>
          
          <button @click="fazerLogout" class="btn-logout" title="Sair">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.loja-header {
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0.8rem 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  height: 45px;
  width: auto;
  transition: transform 0.2s;
}

.logo:hover {
  transform: scale(1.02);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #475569;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
  padding: 8px 12px;
  border-radius: 8px;
}

.nav-item:hover {
  color: #3b82f6;
  background-color: #eff6ff;
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #e2e8f0;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #334155;
  font-weight: 500;
  padding: 6px 12px 6px 6px;
  border-radius: 30px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.user-profile:hover {
  background-color: #f8fafc;
  border-color: #e2e8f0;
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3b82f6;
}

.btn-logout {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-logout:hover {
  color: #ef4444;
  background-color: #fef2f2;
}

@media (max-width: 768px) {
  .nav-label, .username {
    display: none;
  }
  .header-container {
    padding: 0 1rem;
  }
  .header-nav {
    gap: 1rem;
  }
}
</style>