import { defineStore } from 'pinia'
import axios from 'axios'
import { useCartStore } from '@/components/Cart' 
import router from '@/router'
import { BASE_URL } from '@/config/api' 

const fetchProfile = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/profile/`, {
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
    token: localStorage.getItem('authToken') || null,
    user: localStorage.getItem('authUser') 
          ? JSON.parse(localStorage.getItem('authUser')) 
          : null,
    profile: localStorage.getItem('authProfile') 
          ? JSON.parse(localStorage.getItem('authProfile')) 
          : null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperuser: (state) => state.user && state.user.is_superuser, 
  },

  actions: {
    async login(username, password) {
      try {
        const response = await axios.post(`${BASE_URL}/api/login/`, {
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
        
        localStorage.setItem('authToken', token)
        localStorage.setItem('authUser', JSON.stringify(user))
        localStorage.setItem('authProfile', JSON.stringify(profileData)) 
        
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

      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      localStorage.removeItem('authProfile') 
      
      this.token = null
      this.user = null
      this.profile = null 
      
      router.push('/');
    },
  },
  
  persist: false, 
})