import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' 

import LoginView from '../views/LoginView.vue'
import AdminDashboard from '../views/AdminDashboard.vue' 
import LojaView from '../views/LojaView.vue'
import CarrinhoView from '../views/CarrinhoView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('../views/CadastroView.vue'),
    },
    {
      path: '/loja',
      name: 'loja',
      component: LojaView,
      meta: { requiresAuth: true } 
    },
    {
      path: '/admin-dashboard',
      name: 'adminDashboard',
      component: AdminDashboard,
      meta: { 
        requiresAuth: true, 
        requiresAdmin: true 
      }
    },
    {
      path: '/carrinho',
      name: 'carrinho',
      component: CarrinhoView,
      meta: { requiresAuth: true } 
    },
    {
      path: '/pagamento',
      name: 'pagamento',
      component: () => import('../views/PagamentoView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/confirmacao',
      name: 'confirmacao',
      component: () => import('../views/ConfirmacaoView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: () => import('../views/ProdutoInventarioView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/meus-enderecos',
      name: 'MeusEnderecos',
      component: () => import('../views/EnderecoManagerView.vue'),
    },
    {
      path: '/minha-conta',
      name: 'MinhaConta',
      component: () => import('../views/ContaView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/relatorios',
      name: 'Relatorios',
      component: () => import('../views/RelatoriosView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/pedidos',
      name: 'AdminPedidos',
      component: () => import('../views/OrderManagementView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/relatorios/produtos',
      name: 'RelatoriosProdutos',
      component: () => import('../views/RelatorioProdutosView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/relatorios/insumos',
      name: 'RelatoriosInsumos',
      component: () => import('../views/RelatorioInsumosView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/relatorios/custos-estoque',
      name: 'CustosEstoque',
      component: () => import('../views/CustosEstoqueView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/controle-qualidade',
      name: 'ControleQualidade',
      component: () => import('../views/ControleQualidadeView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/producao/qr-code',
      name: 'QRCode',
      component: () => import('../views/QRCView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  console.log('---------------------------------');
  console.log('router.beforeEach: Para:', to.path);
  console.log('router.beforeEach: De:', from.path);
  console.log('router.beforeEach: authStore.isAuthenticated:', authStore.isAuthenticated);
  console.log('router.beforeEach: authStore.isSuperuser:', authStore.isSuperuser);
  console.log('router.beforeEach: to.meta.requiresAuth:', to.meta.requiresAuth);
  console.log('router.beforeEach: to.meta.requiresAdmin:', to.meta.requiresAdmin);

  if (to.meta.requiresAdmin) {
    if (authStore.isAuthenticated && authStore.isSuperuser) { 
      console.log('router.beforeEach: Permitido para admin-dashboard.');
      next() 
    } else {
      console.log('router.beforeEach: NEGADO para admin-dashboard. Redirecionando para /.');
      next('/') 
    }
  } else if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      console.log('router.beforeEach: Permitido para rota protegida (loja).');
      next() 
    } else {
      console.log('router.beforeEach: NEGADO para rota protegida. Redirecionando para /.');
      next('/') 
    }
  } else {
    console.log('router.beforeEach: Rota pública, permitindo.');
    next() 
  }
  console.log('---------------------------------');
})

export default router