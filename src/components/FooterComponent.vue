<script setup></script>

<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-section about">
        <div class="brand">
          <span class="logo-icon">✒️</span>
          <h3>BluePen</h3>
        </div>
        <p>
          Sua loja favorita de canetas de alta qualidade. Transformando ideias em realidade, uma
          linha de cada vez.
        </p>
      </div>

      <div class="footer-section links">
        <h3>Navegação</h3>
        <ul>
          <li><router-link to="/loja">Início</router-link></li>
          <li><router-link to="/carrinho">Meu Carrinho</router-link></li>
          <li><router-link to="/minha-conta">Minha Conta</router-link></li>
        </ul>
      </div>

      <div class="footer-section contact">
        <h3>Fale Conosco</h3>
        <p>📧 suporte@bluepen.com</p>
        <p>📞 (47) 3333-9999</p>
        <p>📍 Araquari, SC</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} BluePen Ltda. Todos os direitos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background-color: #1e293b;
  color: #cbd5e1;
  padding-top: 4rem;
  margin-top: auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
  color: white;
}

.brand h3 {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1;
  color: white;
}

.logo-icon {
  font-size: 1.5rem;
  margin-bottom: 1.2rem;
}

.footer-section h3 {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-section:not(.about) h3 {
  margin-top: 0.5rem;
}

.footer-section p {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
  color: #94a3b8;
}

.footer-section.links ul {
  list-style: none;
  padding: 0;
}

.footer-section.links li {
  margin-bottom: 0.8rem;
}

.footer-section.links a {
  color: #cbd5e1;
  text-decoration: none;
  transition:
    color 0.2s,
    padding-left 0.2s;
  display: inline-block;
}

.footer-section.links a:hover {
  color: #3b82f6;
  padding-left: 5px;
}

.footer-bottom {
  background-color: #0f172a;
  text-align: center;
  padding: 1.5rem;
  font-size: 0.85rem;
  color: #64748b;
  border-top: 1px solid #334155;
}
</style>
