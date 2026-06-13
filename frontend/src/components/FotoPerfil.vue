<template>
  <div class="foto-perfil-wrap" @click="$refs.fileInput.click()">
    <img v-if="fotoActual" :src="fotoActual" class="foto-img" alt="Foto de perfil" />
    <div v-else class="foto-placeholder" :style="{ background: color }">
      <span class="foto-iniciales">{{ iniciales }}</span>
    </div>
    <div class="foto-overlay">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 0 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    </div>
    <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" style="display:none" />
    <div class="foto-exito" v-if="exito">✓</div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  color: { type: String, default: '#1B4332' }
})

const auth    = useAuthStore()
const API     = 'http://localhost:3000/api'
const headers = computed(() => ({ Authorization: `Bearer ${auth.token}` }))
const exito   = ref(false)

const fotoLocal = ref(null)

const fotoActual = computed(() => fotoLocal.value || auth.usuario?.foto_perfil || null)

async function cargarFoto() {
  try {
    const { data } = await axios.get(`${API}/auth/perfil`, { headers: headers.value })
    if (data.foto_perfil) fotoLocal.value = data.foto_perfil
  } catch {}
}

onMounted(cargarFoto)
const iniciales = computed(() => {
  const n = auth.usuario?.nombre?.charAt(0) || ''
  const a = auth.usuario?.apellido?.charAt(0) || ''
  return (n + a).toUpperCase()
})

async function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  
  // Comprimir imagen antes de subir
  const canvas = document.createElement('canvas')
  const img    = new Image()
  const reader = new FileReader()
  
  reader.onload = (ev) => {
    img.onload = async () => {
      // Redimensionar a máximo 150x150
      const MAX = 150
      let w = img.width
      let h = img.height
      if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX } }
      else        { if (h > MAX) { w = w * MAX / h; h = MAX } }
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      const base64 = canvas.toDataURL('image/jpeg', 0.7)

      try {
        await axios.post(`${API}/auth/foto-perfil`, {
          foto_base64: base64
        }, { headers: headers.value })
        auth.actualizarFoto(base64)
        exito.value = true
        setTimeout(() => { exito.value = false }, 2000)
      } catch (err) {
        console.error('Error subiendo foto:', err)
      }
    }
    img.src = ev.target.result
  }
  reader.readAsDataURL(file)
}

</script>

<style scoped>
.foto-perfil-wrap {
  position: relative; cursor: pointer;
  width: 52px; height: 52px; border-radius: 50%;
  flex-shrink: 0;
}
.foto-img {
  width: 100%; height: 100%; border-radius: 50%;
  object-fit: cover; display: block;
}
.foto-placeholder {
  width: 100%; height: 100%; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.foto-iniciales {
  font-family: 'Anton', sans-serif; font-size: 1rem; color: #fff;
}
.foto-overlay {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.foto-perfil-wrap:hover .foto-overlay { opacity: 1; }
.foto-exito {
  position: absolute; inset: 0; border-radius: 50%;
  background: rgba(22,163,74,0.85);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 1rem;
}
</style>