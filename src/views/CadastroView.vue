<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import axios from 'axios'
import roboCanetaImg from '../assets/imagens/robocaneta.png' 

const username = ref('')
const email = ref('')
const password = ref('')
const password_confirm = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

const router = useRouter()

const fazerCadastro = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  if (password.value !== password_confirm.value) {
    errorMessage.value = 'As senhas não conferem.'
    loading.value = false
    return
  }

  try {
    const payload = {
      username: username.value,
      email: email.value,
      password: password.value,
      password_confirm: password_confirm.value,
    }

    await axios.post('http://127.0.0.1:8000/api/cadastro/', payload)

    successMessage.value = 'Cadastro realizado com sucesso! Redirecionando...'

    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (error) {
    console.error('Erro no cadastro:', error.response?.data)
    if (error.response && error.response.data) {
      const erros = error.response.data
      if (erros.username) {
        errorMessage.value = `Usuário: ${erros.username[0]}`
      } else if (erros.email) {
        errorMessage.value = `Email: ${erros.email[0]}`
      } else if (erros.password) {
        errorMessage.value = `Senha: ${erros.password[0]}`
      } else if (erros.password_confirm) {
        errorMessage.value = `Confirmação: ${erros.password_confirm[0]}`
      } else if (erros.non_field_errors) {
        errorMessage.value = erros.non_field_errors[0]
      } else {
        errorMessage.value = 'Ocorreu um erro. Verifique os dados.'
      }
    } else if (error.request) {
      errorMessage.value = 'Não foi possível conectar ao servidor.'
    } else {
      errorMessage.value = 'Ocorreu um erro inesperado.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="banner-side">
      <div class="banner-content">
        <img :src="roboCanetaImg" alt="BluePen Bot" class="banner-img" />
        <div class="banner-text">
          <h2>Junte-se à BluePen</h2>
          <p>Comece a gerenciar sua produção de forma inteligente hoje mesmo.</p>
        </div>
      </div>
      <div class="circle-bg"></div>
    </div>

    <div class="form-side">
      <div class="form-container">
        <div class="header-text">
          <h1>Crie sua conta</h1>
          <p class="subtitle">Preencha os dados abaixo para começar.</p>
        </div>

        <form @submit.prevent="fazerCadastro">
          
          <div class="input-group">
            <label for="username">Usuário</label>
            <div class="input-wrapper">
              <span class="icon">👤</span>
              <input 
                id="username"
                v-model="username" 
                type="text" 
                placeholder="Escolha um nome de usuário" 
                required 
              />
            </div>
          </div>

          <div class="input-group">
            <label for="email">Email</label>
            <div class="input-wrapper">
              <span class="icon">✉️</span>
              <input 
                id="email"
                v-model="email" 
                type="email" 
                placeholder="seu@email.com" 
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

          <div class="input-group">
            <label for="password_confirm">Confirmar Senha</label>
            <div class="input-wrapper">
              <span class="icon">🛡️</span>
              <input 
                id="password_confirm"
                v-model="password_confirm" 
                type="password" 
                placeholder="Repita a senha" 
                required 
              />
            </div>
          </div>

          <div v-if="errorMessage" class="alert-message error">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="alert-message success">
            {{ successMessage }}
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="!loading">Cadastrar</span>
            <span v-else class="loader"></span>
          </button>

          <p class="login-text">
            Já tem uma conta? 
            <RouterLink to="/" class="login-link">Fazer Login</RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
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
  max-height: 50vh; 
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
  overflow-y: auto; 
  height: 100vh; 
}

.form-container {
  width: 100%;
  max-width: 420px;
  margin: auto;
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
  margin-bottom: 0.75rem;
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

.alert-message {
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 500;
}
.alert-message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
.alert-message.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.btn-submit {
  width: 100%;
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

.btn-submit:hover {
  background-color: #1d4ed8;
}

.btn-submit:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.login-text {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: #64748b;
}

.login-link {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.login-link:hover {
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
    width: 100%;
    padding: 1.5rem;
  }
  
  .form-container {
    padding: 0 1rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
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
  
  .form-container {
    padding-bottom: 2rem;
  }
}
</style>