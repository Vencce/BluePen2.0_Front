<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute, RouterLink } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const fazerLogout = () => {
  authStore.logout()
}

const isActive = (path) => {
  return route.path === path
}
</script>

<template>
  <div class="dashboard-layout">
    <aside :class="['sidebar', { closed: !sidebarOpen }]">
      <div class="sidebar-header">
        <div class="logo-area">
          <span class="logo-icon">✒️</span>
          <h1 v-if="sidebarOpen">PenManager</h1>
        </div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li :class="{ active: isActive('/admin-dashboard') }">
            <RouterLink to="/admin-dashboard">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span v-if="sidebarOpen">Dashboard</span>
            </RouterLink>
          </li>
          <li :class="{ active: isActive('/inventario') }">
            <RouterLink to="/inventario">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span v-if="sidebarOpen">Inventário</span>
            </RouterLink>
          </li>

          <li class="section-title" v-if="sidebarOpen">RELATÓRIOS</li>

          <li :class="{ active: isActive('/relatorios') }">
            <RouterLink to="/relatorios">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span v-if="sidebarOpen">Financeiro</span>
            </RouterLink>
          </li>
          <li :class="{ active: isActive('/relatorios/produtos') }">
            <RouterLink to="/relatorios/produtos">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span v-if="sidebarOpen">Rel. Produtos</span>
            </RouterLink>
          </li>
          <li :class="{ active: isActive('/relatorios/insumos') }">
            <RouterLink to="/relatorios/insumos">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span v-if="sidebarOpen">Rel. Insumos</span>
            </RouterLink>
          </li>
          <li :class="{ active: isActive('/relatorios/custos-estoque') }">
            <RouterLink to="/relatorios/custos-estoque">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span v-if="sidebarOpen">Custos Estoque</span>
            </RouterLink>
          </li>

          <li class="section-title" v-if="sidebarOpen">ADMINISTRAÇÃO</li>

          <li :class="{ active: isActive('/admin/pedidos') }">
            <RouterLink to="/admin/pedidos">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span v-if="sidebarOpen">Pedidos</span>
            </RouterLink>
          </li>
          <li :class="{ active: isActive('/controle-qualidade') }">
            <RouterLink to="/controle-qualidade">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span v-if="sidebarOpen">Controle Qualidade</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/producao/qr-code">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              <span v-if="sidebarOpen">QR Code</span>
            </RouterLink>
          </li>
          <li>
            <a href="http://127.0.0.1:8000/admin/" target="_blank">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                />
              </svg>
              <span v-if="sidebarOpen">Django Admin</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button @click="fazerLogout" class="logout-btn">
          <span v-if="sidebarOpen">SAIR</span>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      <button class="toggle-btn" @click="toggleSidebar">
        <svg
          v-if="sidebarOpen"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="breadcrumb">
          <span class="home-icon">🏠</span> <span>/ {{ route.name }}</span>
        </div>
        <div class="user-area">
          <span>Admin: {{ authStore.user?.username }}</span>
        </div>
      </header>

      <div class="content-body">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  background-color: #f1f5f9;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background-color: #0f172a;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
}

.sidebar.closed {
  width: 80px;
}

.sidebar-header {
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #1e293b;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}
.logo-area h1 {
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 1px;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.sidebar-nav::-webkit-scrollbar {
  display: none;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 5px;
  position: relative;
}

.section-title {
  padding: 15px 24px 5px;
  font-size: 0.75rem;
  font-weight: bold;
  color: #475569;
  letter-spacing: 1px;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}

.sidebar-nav a:hover {
  color: white;
  background-color: #1e293b;
}

.sidebar-nav li.active a {
  color: #10b981;
  background-color: #1e293b;
  border-right: 3px solid #10b981;
}

.sidebar-nav a svg {
  margin-right: 12px;
}
.sidebar.closed .sidebar-nav a svg {
  margin-right: 0;
}

.sidebar.closed .sidebar-nav a {
  justify-content: center;
  padding: 12px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #1e293b;
}

.logout-btn {
  width: 100%;
  background: transparent;
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}
.logout-btn:hover {
  background-color: #ef4444;
  color: white;
  border-color: #ef4444;
}

.toggle-btn {
  position: absolute;
  right: -12px;
  top: 85px;
  background-color: #0f172a;
  color: white;
  border: 1px solid #1e293b;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.main-content::-webkit-scrollbar {
  display: none;
}

.top-bar {
  background-color: white;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-area {
  display: flex;
  align-items: center;
  background-color: #f8fafc;
  padding: 8px 15px;
  border-radius: 8px;
  width: 400px;
}
.search-area input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  margin-left: 10px;
  color: #64748b;
}

.breadcrumb {
  color: #64748b;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.user-area {
  color: #64748b;
  font-weight: 500;
}

.content-body {
  padding: 30px;
}

@media (max-width: 768px) {
  .search-area {
    display: none;
  }
  .sidebar {
    position: absolute;
    height: 100%;
    z-index: 100;
  }
  .sidebar.closed {
    transform: translateX(-100%);
    width: 260px;
  }
}
</style>
