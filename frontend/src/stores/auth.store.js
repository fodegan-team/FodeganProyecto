import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API = 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', () => {
  const usuario  = ref(JSON.parse(localStorage.getItem('usuario')) || null)
  const token    = ref(localStorage.getItem('token') || null)
  const cargando = ref(false)
  const error    = ref(null)

  const estaAutenticado = computed(() => !!token.value)
  const rol = computed(() => usuario.value?.rol || null)

  async function login(email, password) {
    cargando.value = true
    error.value    = null
    try {
      const { data } = await axios.post(`${API}/auth/login`,
        { email, password },
        { withCredentials: true }
      )
      token.value   = data.accessToken
      usuario.value = data.usuario
      localStorage.setItem('token',   data.accessToken)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      return { ok: true, rol: data.usuario.rol }
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al iniciar sesión'
      return { ok: false }
    } finally {
      cargando.value = false
    }
  }

  async function register(datos) {
    cargando.value = true
    error.value    = null
    try {
      const { data } = await axios.post(`${API}/auth/register`,
        datos,
        { withCredentials: true }
      )
      return { ok: true, aprobado: data.aprobado, message: data.message }
    } catch (err) {
      error.value = err.response?.data?.error || 'Error al registrarse'
      return { ok: false }
    } finally {
      cargando.value = false
    }
  }

  async function logout() {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token.value}` }
      })
    } finally {
      token.value   = null
      usuario.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }

  return { usuario, token, cargando, error, estaAutenticado, rol, login, register, logout }
})