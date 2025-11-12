<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import roboCanetaImg from '../assets/imagens/robocaneta.png' 

const username = ref('')
const email = ref('')
const password = ref('')
const password_confirm = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const router = useRouter()

const fazerCadastro = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (password.value !== password_confirm.value) {
    errorMessage.value = 'As senhas não conferem.'
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

    successMessage.value = 'Cadastro realizado com sucesso! Redirecionando para o login...'

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
        errorMessage.value = `Confirmação de Senha: ${erros.password_confirm[0]}`
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
  }
}
</script>

<template>
  <div class="container">
    <div class="container__imagem">
      <img :src="roboCanetaImg" alt="Robô assistente" />
    </div>
    <div class="container__cadastro">
      <h1>Cadastro</h1>
      <form @submit.prevent="fazerCadastro">
        <input v-model="username" type="text" placeholder="Nome de Usuário" required />
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Senha" required />

        <input v-model="password_confirm" type="password" placeholder="Confirmar Senha" required />

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

        <button type="submit" class="btn btn-primary">Cadastrar</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
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
  background-color: #f4f7f6;
}
.container__imagem img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}
.container__cadastro {
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
}
.btn-primary {
  font-size: 1rem;
  font-weight: bold;
  padding: 12px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-decoration: none;
  text-align: center;
}
.btn-primary:hover {
  background-color: #0056b3;
}
.error-message {
  color: #dc3545;
  text-align: center;
  margin-bottom: 1rem;
}
.success-message {
  color: #28a745;
  text-align: center;
  margin-bottom: 1rem;
}
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  .container__imagem {
    display: none;
  }
  .container__cadastro {
    width: 100%;
    min-height: 100vh;
  }
}
</style>
