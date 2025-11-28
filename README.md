# 🖥️ BluePen Frontend (E-commerce & Factory Dashboard)

Interface web moderna desenvolvida com **Vue.js 3** e **Vite**, servindo como o ponto de interação para o ecossistema BluePen. Este projeto é um "monolito modular" no front-end, contendo tanto a **Loja Virtual (B2C)** quanto o **Painel Administrativo (ERP/Industrial)** em uma única aplicação SPA (Single Page Application).

## 🚀 Visão Geral do Projeto

A aplicação consome a API do [BluePen Backend](https://github.com/Vencce/BluePen-Back) e gerencia dois fluxos de utilizadores distintos:

### 🛍️ Área da Loja (Cliente)
Uma experiência de e-commerce completa e responsiva.
-   **Catálogo de Produtos:** Visualização de canetas com stock em tempo real.
-   **Carrinho de Compras:** Gestão de itens com persistência local (Pinia).
-   **Checkout & Pagamento:** Fluxo de escolha de endereço (integrado com ViaCEP) e simulação de pagamento.
-   **Área do Cliente:** Histórico de pedidos e gestão de múltiplos endereços de entrega.

### 🏭 Área Fabril (Administrador)
Um dashboard robusto para gestão operacional da fábrica.
-   **Dashboard Gerencial:** Gráficos de vendas, status de pedidos e métricas financeiras.
-   **PCP (Planeamento e Controlo da Produção):** Criação de Ordens de Produção e alocação de máquinas.
-   **Controlo de Qualidade:** Interface para aprovar ou rejeitar lotes produzidos, integrando automaticamente com o stock.
-   **Gestão de Stock:** Compra de insumos (matéria-prima) e visualização de produtos acabados.
-   **Relatórios Financeiros:** Visão detalhada do Fluxo de Caixa (Entradas vs. Saídas).

## 🛠️ Tecnologias e Ferramentas

-   **Framework:** Vue.js 3 (Composition API com `<script setup>`).
-   **Build Tool:** Vite (para desenvolvimento rápido e build otimizado).
-   **State Management:** Pinia (com `pinia-plugin-persistedstate` para salvar carrinho e sessão).
-   **Routing:** Vue Router (com guardas de rota para proteger a área admin).
-   **HTTP Client:** Axios.
-   **Estilização:** CSS Scoped, layouts flexíveis e design responsivo.

## 📂 Estrutura do Projeto

O código está organizado para separar componentes visuais de lógicas de visualização:

-   `src/components/`: Componentes reutilizáveis (Header, Footer, Layouts de Admin).
-   `src/views/`: Páginas principais da aplicação (Loja, Login, Dashboard, Inventário).
-   `src/stores/`: Gerenciamento de estado global (Autenticação e Carrinho).
-   `src/assets/`: Recursos estáticos (Imagens, CSS global).

## 📦 Como Executar o Projeto

### Pré-requisitos
-   Node.js (versão 18+ recomendada).
-   NPM ou Yarn.

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/Vencce/BluePen2.0_Front.git](https://github.com/Vencce/BluePen2.0_Front.git)
    cd BluePen2.0_Front
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração da API:**
    O projeto está configurado para apontar para a API de produção (`https://bluepen-back.onrender.com`) ou local. Verifique os ficheiros de *views* ou *stores* se precisar alterar o endpoint base.

4.  **Execute em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```
    Acesse `http://localhost:5173` (ou a porta indicada).

5.  **Build para Produção:**
    ```bash
    npm run build
    ```

## 🔐 Controlo de Acesso

O sistema de rotas possui guardas inteligentes (`router.beforeEach`) que verificam:
1.  Se o utilizador está logado.
2.  Se o utilizador é **Superuser** (Admin) para permitir acesso às rotas `/admin-dashboard`, `/inventario`, etc.

---

Desenvolvido por [Vitor Ferreira](https://github.com/Vencce).
