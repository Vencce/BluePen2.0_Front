import { defineStore } from 'pinia'
import penImage from '@/assets/imagens/canetasimples.png'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [], 
  }),

  getters: {
    subtotal: (state) => {
      return state.items.reduce((total, item) => {
        return total + (parseFloat(item.preco) * item.quantity)
      }, 0)
    },
    itemCount: (state) => {
      return state.items.length
    }
  },

  actions: {
    addItem(produto) {
      const existingItem = this.items.find(item => item.id === produto.id)

      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({ ...produto, imagem: penImage, quantity: 1 })
      }
    },
    
    removeItem(produtoId) {
      this.items = this.items.filter(item => item.id !== produtoId)
    },
    
    updateQuantity(produtoId, quantity) {
      const item = this.items.find(item => item.id === produtoId)
      
      const newQuantity = parseInt(quantity)
      if (item && newQuantity > 0) {
        item.quantity = newQuantity
      } else if (item && newQuantity <= 0) {
        this.removeItem(produtoId)
      }
    },
    clearCart() {
      this.items = []
    },
  },

  persist: true, 
})