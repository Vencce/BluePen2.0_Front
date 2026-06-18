<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import roboCanetaImg from '../assets/imagens/robocaneta.png'

const step = ref(1)
const username = ref('')
const password = ref('')
const totpCode = ref('')
const errorMessage = ref('')
const loading = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const fazerLogin = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const loginResult = await authStore.login(username.value, password.value, step.value === 2 ? totpCode.value : null)

    if (loginResult && loginResult.requires_2fa) {
      step.value = 2
      errorMessage.value = ''
    } else if (loginResult && loginResult.error) {
      errorMessage.value = loginResult.error
    } else if (loginResult === true) {
      router.push('/admin-dashboard')
    } else {
      router.push('/loja')
    }
  } catch (error) {
    errorMessage.value = 'Ocorreu um erro inesperado. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="banner-side">
      <div class="banner-content">
        <img :src="roboCanetaImg" alt="BluePen Bot" class="banner-img" />
        <div class="banner-text">
          <h2>Gerencie com Eficiência</h2>
          <p>A solução completa para o controle da sua fábrica de canetas.</p>
        </div>
      </div>
      <div class="circle-bg"></div>
    </div>

    <div class="form-side">
      <div class="form-container">
        <div class="header-text">
          <h1>Bem-vindo de volta!</h1>
          <p class="subtitle" v-if="step === 1">Por favor, insira seus dados para entrar.</p>
          <p class="subtitle" v-if="step === 2">Insira o código gerado pelo seu aplicativo autenticador.</p>
        </div>

        <form @submit.prevent="fazerLogin">
          
          <div v-if="step === 1">
            <div class="input-group">
              <label for="username">Usuário</label>
              <div class="input-wrapper">
                <span class="icon">👤</span>
                <input 
                  id="username" 
                  v-model="username" 
                  type="text" 
                  placeholder="Seu nome de usuário" 
                  required 
                />
              </div>
            </div>

            <div class="input-group">
              <label for="password">Senha</label>
              <div class="input-wrapper">
                <span class="icon">🔒</span>
                <input 
                  id="password" 
                  v-model="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            <div class="form-actions">
              <router-link to="/recuperar-senha" class="forgot-link">
                Esqueceu a senha?
              </router-link>
            </div>
          </div>

          <div v-if="step === 2">
            <div class="input-group">
              <label for="totpCode">Código 2FA (6 dígitos)</label>
              <div class="input-wrapper">
                <span class="icon">🔐</span>
                <input 
                  id="totpCode" 
                  v-model="totpCode" 
                  type="text" 
                  placeholder="000000"
                  maxlength="6"
                  required 
                />
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="alert-error">
            {{ errorMessage }}
          </div>

          <div class="button-group">
            <button v-if="step === 2" type="button" class="btn-back" @click="step = 1; errorMessage = ''">
              Voltar
            </button>
            <button type="submit" class="btn-login" :disabled="loading" :class="{'full-width': step === 1}">
              <span v-if="!loading">{{ step === 1 ? 'Entrar' : 'Verificar' }}</span>
              <span v-else class="loader"></span>
            </button>
          </div>

          <p class="register-text" v-if="step === 1">
            Não tem uma conta? 
            <RouterLink to="/cadastro" class="register-link">Cadastre-se</RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #fff;
  overflow: hidden;
}

.banner-side {
  flex: 1.2;
  background: linear-gradient(135deg, #eef2f3 0%, #dbeafe 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
}

.banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  max-width: 600px;
}

.banner-img {
  width: auto;
  max-width: 90%;
  max-height: 55vh; 
  object-fit: contain;
  filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1));
  animation: float 6s ease-in-out infinite;
  margin-bottom: 2rem;
}

.banner-text {
  color: #1e293b;
}

.banner-text h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0f172a;
  line-height: 1.2;
}

.banner-text p {
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.5;
}

.circle-bg {
  position: absolute;
  width: 600px;
  height: 600px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 50%;
  bottom: -100px;
  right: -100px;
  z-index: 1;
}

.form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: white;
  position: relative;
  z-index: 10;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.header-text {
  margin-bottom: 2rem;
  text-align: left;
}

.header-text h1 {
  font-size: 2rem;
  color: #1e293b;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.input-group {
  margin-bottom: 1.25rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #334155;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .icon {
  position: absolute;
  left: 12px;
  font-size: 1.1rem;
  opacity: 0.6;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  font-size: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #fff;
  color: #334155;
  transition: all 0.2s ease;
  outline: none;
}

.input-wrapper input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.input-wrapper input::placeholder {
  color: #94a3b8;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.forgot-link {
  font-size: 0.9rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.alert-error {
  background-color: #fee2e2;
  color: #991b1b;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-align: center;
  border: 1px solid #fecaca;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn-login {
  flex: 1;
  padding: 12px;
  background-color: #2563eb;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}

.btn-login.full-width {
  width: 100%;
}

.btn-back {
  padding: 12px;
  background-color: #f1f5f9;
  color: #334155;
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 48px;
  min-width: 100px;
}

.btn-back:hover {
  background-color: #e2e8f0;
}

.btn-login:hover {
  background-color: #1d4ed8;
}

.btn-login:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.register-text {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: #64748b;
}

.register-link {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@media (max-width: 960px) {
  .banner-side {
    display: none;
  }
  
  .form-side {
    padding: 1.5rem;
    width: 100%;
  }
  
  .form-container {
    max-width: 100%;
    padding: 0 1rem;
  }

  .header-text h1 {
    font-size: 1.8rem;
  }
}

@media (max-height: 700px) {
  .banner-img {
    max-height: 65vh;
    margin-bottom: 1rem;
  }
  
  .banner-text h2 {
    font-size: 1.5rem;
  }
}
</style>