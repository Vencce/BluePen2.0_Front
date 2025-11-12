// src/stores/auth.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { useCartStore } from '@/components/Cart' 
import router from '@/router'

const fetchProfile = async (token) => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
      headers: { 'Authorization': `Token ${token}` }
    });
    // A API de profile retorna uma lista, pegamos o primeiro item
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('authToken') || null,
    user: localStorage.getItem('authUser') 
          ? JSON.parse(localStorage.getItem('authUser')) 
          : null,
    // --- ADICIONE O ESTADO DO PERFIL ---
    profile: localStorage.getItem('authProfile') 
          ? JSON.parse(localStorage.getItem('authProfile')) 
          : null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperuser: (state) => state.user && state.user.is_superuser, 
    // Getter para a URL do avatar
    avatarUrl: (state) => state.profile?.avatar || null
  },

  actions: {
    async login(username, password) {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/login/', {
          username: username,
          password: password,
        })
        
        const token = response.data.token
        const user = {
            id: response.data.user_id,
            username: response.data.username,
            email: response.data.email,
            is_superuser: response.data.is_superuser
        }
        
        // --- ATUALIZAÇÃO PÓS-LOGIN ---
        // 1. Busca o perfil associado
        const profileData = await fetchProfile(token);
        
        // 2. Salva tudo
        localStorage.setItem('authToken', token)
        localStorage.setItem('authUser', JSON.stringify(user))
        localStorage.setItem('authProfile', JSON.stringify(profileData)) // Salva o perfil
        
        this.token = token
        this.user = user
        this.profile = profileData // Salva no estado
        
        return user.is_superuser
        
      } catch (error) {
        console.error('Erro no login:', error.response?.data || error.message) 
        if (error.response && error.response.status === 400) {
          return { error: 'Usuário ou senha inválidos.' }
        } else {
          return { error: 'Erro ao tentar conectar.' }
        }
      }
    },

    logout() {
      const cartStore = useCartStore()
      cartStore.clearCart() 

      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      localStorage.removeItem('authProfile') // <-- LIMPA O PERFIL
      
      this.token = null
      this.user = null
      this.profile = null // <-- LIMPA O PERFIL
      
      router.push('/');
    },
    
    // --- NOVA AÇÃO PARA ATUALIZAR O PERFIL ---
    // (Usaremos isso na ContaView após o upload)
    async updateProfile(newProfileData) {
      this.profile = newProfileData;
      localStorage.setItem('authProfile', JSON.stringify(newProfileData));
    }
  },
  
  persist: false, // Vamos desabilitar o persist global e salvar manualmente
})