<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import AdminLayout from '@/components/AdminLayout.vue'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()

const todosPedidos = ref([])
const pedidosRecentes = ref([])
const loading = ref(true)
const errorMessage = ref(null)

const dataFinalFiltro = ref(new Date().toISOString().split('T')[0])

const statusColors = {
  pendente: '#f59e0b',
  aprovado: '#10b981',
  enviado: '#3b82f6',
  entregue: '#6366f1',
  cancelado: '#ef4444',
}

const vendasUltimos7Dias = computed(() => {
  const dias = []
  const [ano, mes, dia] = dataFinalFiltro.value.split('-').map(Number)
  const dataBase = new Date(ano, mes - 1, dia)

  for (let i = 6; i >= 0; i--) {
    const d = new Date(dataBase)
    d.setDate(dataBase.getDate() - i)
    dias.push({
      data: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total: 0,
    })
  }

  todosPedidos.value.forEach((pedido) => {
    const dataPedido = pedido.created_at.split('T')[0]
    const diaEncontrado = dias.find((d) => d.data === dataPedido)
    if (diaEncontrado && pedido.status !== 'cancelado') {
      diaEncontrado.total += parseFloat(pedido.total_pedido)
    }
  })

  const maxTotal = Math.max(...dias.map((d) => d.total)) || 1

  return dias.map((d) => ({
    ...d,
    height: `${(d.total / maxTotal) * 100}%`,
  }))
})

const totalVendasPeriodo = computed(() => {
  return vendasUltimos7Dias.value.reduce((acc, dia) => acc + dia.total, 0)
})

const mediaVendasDiaria = computed(() => {
  return totalVendasPeriodo.value / 7
})

const distribuicaoStatus = computed(() => {
  const counts = {
    pendente: 0,
    aprovado: 0,
    enviado: 0,
    entregue: 0,
    cancelado: 0,
  }

  let total = 0
  todosPedidos.value.forEach((p) => {
    if (counts[p.status] !== undefined) {
      counts[p.status]++
      total++
    }
  })

  if (total === 0) return []

  let currentAngle = 0
  const segments = []

  for (const [status, count] of Object.entries(counts)) {
    if (count > 0) {
      const percentage = (count / total) * 100
      const angle = (count / total) * 360
      segments.push({
        status,
        count,
        percentage: Math.round(percentage),
        color: statusColors[status],
        style: `${statusColors[status]} 0 ${angle}deg`,
      })
      currentAngle += angle
    }
  }

  let gradientString = ''
  let accumulatedDeg = 0
  segments.forEach((seg, index) => {
    const endDeg = accumulatedDeg + (seg.count / total) * 360
    gradientString += `${seg.color} ${accumulatedDeg}deg ${endDeg}deg`
    if (index < segments.length - 1) gradientString += ', '
    accumulatedDeg = endDeg
  })

  return { segments, gradient: gradientString || '#e2e8f0 0 360deg' }
})

const carregarPedidos = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/pedidos/', {
      headers: {
        Authorization: `Token ${authStore.token}`,
      },
    })
    todosPedidos.value = response.data
    pedidosRecentes.value = response.data.slice(0, 5)
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error.response?.data || error.message)
    if (error.response?.status === 403) {
      errorMessage.value = 'Acesso negado.'
    } else {
      errorMessage.value = 'Não foi possível carregar os pedidos.'
    }
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }
  return new Date(dateTimeString).toLocaleDateString('pt-BR', options)
}

const formatCurrency = (value) => {
  const numericValue = parseFloat(value) || 0
  return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

onMounted(() => {
  if (authStore.isSuperuser) {
    carregarPedidos()
  } else {
    loading.value = false
    errorMessage.value = 'Acesso não autorizado.'
  }
})
</script>

<template>
  <AdminLayout>
    <div class="widgets-grid">
      <RouterLink to="/admin/pedidos" class="card widget-card">
        <h3>Pedidos</h3>
        <div class="chart-placeholder green-bg">
          <span>{{ todosPedidos.length }}</span>
          <small>total</small>
        </div>
      </RouterLink>
      <RouterLink to="/inventario" class="card widget-card">
        <h3>Inventário</h3>
        <div class="chart-placeholder blue-bg">
          <span>Estoque</span>
        </div>
      </RouterLink>
      <RouterLink to="/relatorios" class="card widget-card">
        <h3>Financeiro</h3>
        <div class="chart-placeholder orange-bg">
          <span>Caixa</span>
        </div>
      </RouterLink>
    </div>

    <div class="charts-row">
      <div class="card chart-card">
        <div class="chart-header-flex">
          <h3>Vendas (Semana)</h3>
          <div class="date-control">
            <small>Até:</small>
            <input type="date" v-model="dataFinalFiltro" class="date-filter" />
          </div>
        </div>
        <div class="bar-chart-container">
          <div v-for="dia in vendasUltimos7Dias" :key="dia.date" class="bar-group">
            <div class="bar" :style="{ height: dia.height }" :title="formatCurrency(dia.total)">
              <span class="bar-tooltip">{{ formatCurrency(dia.total) }}</span>
            </div>
            <span class="bar-label">{{ dia.label }}</span>
          </div>
        </div>

        <div class="chart-footer">
          <div class="footer-metric">
            <span>Total no Período</span>
            <strong>{{ formatCurrency(totalVendasPeriodo) }}</strong>
          </div>
          <div class="footer-divider"></div>
          <div class="footer-metric">
            <span>Média Diária</span>
            <strong>{{ formatCurrency(mediaVendasDiaria) }}</strong>
          </div>
        </div>
      </div>

      <div class="card chart-card">
        <h3>Status dos Pedidos</h3>
        <div class="donut-chart-container">
          <div
            class="donut-chart"
            :style="{ background: `conic-gradient(${distribuicaoStatus.gradient})` }"
          >
            <div class="donut-hole">
              <span>{{ todosPedidos.length }}</span>
              <small>Pedidos</small>
            </div>
          </div>
          <div class="chart-legend">
            <div v-for="item in distribuicaoStatus.segments" :key="item.status" class="legend-item">
              <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
              <span class="legend-label">{{ item.status }}</span>
              <span class="legend-value">{{ item.count }} ({{ item.percentage }}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card table-card">
      <div class="card-header">
        <h3>Últimos 5 Pedidos</h3>
        <RouterLink to="/admin/pedidos" class="btn-ver-todos">Ver todos</RouterLink>
      </div>
      <div v-if="loading" class="loading">Carregando...</div>
      <div v-else-if="pedidosRecentes.length === 0" class="no-data">Sem vendas recentes.</div>
      <table v-else class="clean-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pedido in pedidosRecentes" :key="pedido.id">
            <td>#{{ pedido.id }}</td>
            <td>{{ pedido.user?.username || 'Visitante' }}</td>
            <td>{{ formatDateTime(pedido.created_at) }}</td>
            <td>{{ formatCurrency(pedido.total_pedido) }}</td>
            <td>
              <span :class="['status-dot', pedido.status]"></span>
              {{ pedido.status }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminLayout>
</template>

<style scoped>
.no-data {
  padding: 20px;
  color: #64748b;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.widget-card {
  cursor: pointer;
  transition: transform 0.2s;
  display: block;
  text-decoration: none;
  color: inherit;
}
.widget-card:hover {
  transform: translateY(-3px);
}
.widget-card h3 {
  margin-top: 0;
  color: #64748b;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-placeholder {
  height: 80px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
}
.chart-placeholder small {
  font-size: 0.8rem;
  font-weight: normal;
  opacity: 0.9;
}
.green-bg {
  background: linear-gradient(135deg, #10b981, #059669);
}
.blue-bg {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.orange-bg {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}
@media (max-width: 1024px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

.chart-card h3 {
  margin-top: 0;
  margin-bottom: 0;
  color: #334155;
  font-size: 1.1rem;
}

.chart-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.date-control {
  display: flex;
  align-items: center;
  gap: 10px;
}
.date-control small {
  color: #64748b;
  font-weight: 500;
}

.date-filter {
  padding: 5px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
}
.date-filter:focus {
  border-color: #3b82f6;
}

.bar-chart-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding-top: 20px;
  margin-bottom: 20px;
}
.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: flex-end;
}
.bar {
  width: 40%;
  background-color: #3b82f6;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
  position: relative;
  min-height: 4px;
}
.bar:hover {
  background-color: #2563eb;
}
.bar-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1e293b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  white-space: nowrap;
  margin-bottom: 5px;
}
.bar:hover .bar-tooltip {
  opacity: 1;
}
.bar-label {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #64748b;
}

.chart-footer {
  border-top: 1px solid #f1f5f9;
  padding-top: 15px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.footer-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.footer-metric span {
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.footer-metric strong {
  font-size: 1.1rem;
  color: #334155;
}
.footer-divider {
  width: 1px;
  height: 30px;
  background-color: #e2e8f0;
}

.donut-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.donut-chart {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  position: relative;
  margin-bottom: 20px;
}
.donut-hole {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 110px;
  height: 110px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #334155;
  font-weight: bold;
  font-size: 1.5rem;
}
.donut-hole small {
  font-size: 0.8rem;
  font-weight: normal;
  color: #64748b;
}
.chart-legend {
  width: 100%;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #475569;
}
.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 8px;
}
.legend-label {
  flex: 1;
  text-transform: capitalize;
}
.legend-value {
  font-weight: 600;
}

.table-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.table-card h3 {
  margin: 0;
  color: #334155;
}
.btn-ver-todos {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
}
.btn-ver-todos:hover {
  text-decoration: underline;
}

.clean-table {
  width: 100%;
  border-collapse: collapse;
}
.clean-table th {
  text-align: left;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.85rem;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}
.clean-table td {
  padding: 15px 0;
  color: #475569;
  font-size: 0.9rem;
  border-bottom: 1px solid #f1f5f9;
}
.clean-table tr:last-child td {
  border-bottom: none;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.status-dot.pendente {
  background-color: #f59e0b;
}
.status-dot.aprovado {
  background-color: #10b981;
}
.status-dot.enviado {
  background-color: #3b82f6;
}
.status-dot.entregue {
  background-color: #6366f1;
}
.status-dot.cancelado {
  background-color: #ef4444;
}
</style>
