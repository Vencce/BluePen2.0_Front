import { defineStore } from 'pinia'
import axios from 'axios'
import { useCartStore } from '@/components/Cart' 
import router from '@/router'

const API_BASE = 'https://bluepan-back.onrender.com'

const fetchProfile = async (token) => {
  try {
    const response = await axios.get(`${API_BASE}/api/profile/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return null;
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    profile: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperuser: (state) => state.user && state.user.is_superuser, 
  },

  actions: {
    async login(username, password) {
      try {
        const response = await axios.post(`${API_BASE}/api/login/`, {
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
        
        const profileData = await fetchProfile(token);
        
        this.token = token
        this.user = user
        this.profile = profileData 
        
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

      this.token = null
      this.user = null
      this.profile = null 
      
      router.push('/');
    },
  },
  
  persist: true, 
})