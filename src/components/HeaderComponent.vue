<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const fazerLogout = () => {
  authStore.logout()
}
</script>

<template>
  <header class="app-header">
    <div class="container">
      <div class="brand">
        <span class="logo-icon">✒️</span>
        <h1>PenManager</h1>
      </div>

      <nav class="nav-links">
        <ul>
          <li>
            <router-link to="/admin-dashboard">Dashboard</router-link>
          </li>
          <li>
            <router-link to="/inventario">Inventário</router-link>
          </li>
          <li>
            <RouterLink to="/relatorios">Financeiro</RouterLink>
          </li>
          <li>
            <RouterLink to="/relatorios/produtos">Produtos</RouterLink>
          </li>
          <li>
            <RouterLink to="/relatorios/insumos">Insumos</RouterLink>
          </li>
          <li>
            <router-link to="/admin/pedidos" class="link-card"> Gerenciar Pedidos </router-link>
          </li>
        </ul>
      </nav>

      <div class="header-right">
        <span class="header-user">Olá, {{ authStore.user?.username }}</span>
        <button @click="fazerLogout" class="btn btn-logout">Sair</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #ffffff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-logout {
  background-color: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.btn-logout:hover {
  background-color: #c82333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-user {
  font-size: 1rem;
  font-weight: 500;
  color: #5a6a7a;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand .logo-icon {
  font-size: 1.8rem;
}

.brand h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.nav-links ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  text-decoration: none;
  color: #5a6a7a;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: #3498db;
}

.nav-links a.active::after,
.nav-links a:hover::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #3498db;
}

.login-btn {
  background-color: #3498db;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-btn:hover {
  background-color: #2980b9;
}
</style>