<script setup>
import AdminLayout from '@/components/AdminLayout.vue'

const linkProjeto = 'https://bluepen.vercel.app/'
</script>

<template>
  <AdminLayout>
    <div class="qr-code-page">
      <div class="qr-card">
        <h1>Link de Apresentação do Projeto</h1>
        <p class="subtitle">Este link leva à versão final da loja online.</p>

        <div class="qr-placeholder">
          <img src="../assets/imagens/qrcode.png" class="qr-image" />
        </div>

        <a :href="linkProjeto" target="_blank" class="btn-link-externo">
          Abrir Loja: {{ linkProjeto }}
        </a>

        <p class="final-note">Obrigado por avaliar o projeto!</p>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.qr-code-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}
.qr-card {
  background-color: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 500px;
}
h1 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 1rem;
}
.subtitle {
  color: #64748b;
  margin-bottom: 2rem;
}
.qr-placeholder {
  width: 100%;
  height: 300px;
  background-color: #f1f5f9;
  margin: 2rem auto;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}
.btn-link-externo {
  display: block;
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 1.5rem;
  transition: background-color 0.2s;
}
.btn-link-externo:hover {
  background-color: #0056b3;
}
.final-note {
  margin-top: 2rem;
  font-style: italic;
  color: #94a3b8;
}
</style>
