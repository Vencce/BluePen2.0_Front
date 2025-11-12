<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import roboCanetaImg from '../assets/imagens/robocaneta.png'; 

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const authStore = useAuthStore()
const router = useRouter()

const fazerLogin = async () => {
  errorMessage.value = ''

  const loginResult = await authStore.login(username.value, password.value)

  if (loginResult.error) {
    errorMessage.value = loginResult.error
  } else if (loginResult === true) {
    console.log('LoginView: Redirecionando para /admin-dashboard');
    router.push('/admin-dashboard')
  } else {
    console.log('LoginView: Redirecionando para /loja');
    router.push('/loja')
  }
}
</script>

<template>
  <div class="container">
    <div class="container__imagem">
      <img :src="roboCanetaImg" alt="Robô assistente" />
    </div>
    <div class="container__login">
      <h1>Login</h1>
      <form @submit.prevent="fazerLogin">
        <input v-model="username" type="text" placeholder="Usuário" required />
        <input v-model="password" type="password" placeholder="Senha" required />

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div class="container__login__botoes">
          <button type="submit" class="btn btn-primary">Entrar</button>
          <router-link to="/cadastro" class="btn btn-secondary">
            Cadastrar
          </router-link>
        </div>
        
        <router-link to="/recuperar-senha" class="forgot-password">
          Esqueceu a senha?
        </router-link>
      </form>
    </div>
  </div>
</template>

<style scoped>
.forgot-password {
  text-align: center;
  margin-top: 1.5rem;
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.container {
  display: flex;
  flex-direction: row; 
  height: 100vh;
  width: 100vw;
  background-color: white;
  overflow: hidden;
}
.container__imagem {
  flex: 1; 
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-color: #e6ecea; 
  border-radius: 0 5vh 5vh 0;
}
.container__imagem img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}
.container__login {
  flex: 1; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
h1 {
  font-size: 4.5rem;
  font-weight: bold;
  font-family: Arial, sans-serif;
  color: #333;
  margin-bottom: 2rem;
}
form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
}
input {
  font-size: 1rem;
  padding: 12px 15px;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: Arial, sans-serif;
}
.error-message {
  color: #dc3545;
  text-align: center;
  margin-bottom: 1rem;
}
.container__login__botoes {
  display: flex;
  gap: 1rem; 
  margin-top: 1rem;
}
.btn {
  font-size: 1rem;
  font-weight: bold;
  padding: 12px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-decoration: none;
  text-align: center;
  flex: 1; 
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-primary:hover {
  background-color: #0056b3;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-secondary:hover {
  background-color: #5a6268;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column; 
  }
  .container__imagem {
    display: none; 
  }
  .container__login {
    width: 100%;
    min-height: 100vh; 
  }
  .container__login__botoes {
    flex-direction: column; 
  }
}
</style>