<script setup></script>

<template>
  <footer class="site-footer">
    <div class="footer-container">
      <p class="footer-copyright">
        &copy; {{ new Date().getFullYear() }} BluePen. Todos os direitos reservados.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background-color: #37383c;
  color: #f9f9f9;
  padding: 2rem 1rem;
  text-align: center;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-copyright {
  font-size: 0.9rem;
  color: #aaa;
}
</style>
