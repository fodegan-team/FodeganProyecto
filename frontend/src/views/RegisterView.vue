<template>
  <div class="register-root">

    <!-- Video de fondo según rol -->
    <video autoplay muted loop playsinline class="register-video" :key="videoSrc">
      <source :src="videoSrc" type="video/mp4" />
    </video>
    <div class="register-overlay" />

    <!-- Contenido centrado -->
    <div class="register-wrapper">

      <!-- Logo arriba -->
      <div class="register-logo">
        <img src="/images/LogoFodegan.png" alt="FODEGAN" class="logo-img" />
      </div>

      <!-- Tarjeta glass -->
      <div class="register-card">

        <!-- Título según rol -->
        <div class="card-header">
          <h1 class="card-title">{{ rolInfo.titulo }}</h1>
          <p class="card-sub">{{ rolInfo.subtitulo }}</p>
        </div>

        <!-- Mensaje de éxito -->
        <div class="alert-success" v-if="exitoso">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ mensajeExito }}
        </div>

        <!-- Mensaje de error -->
        <div class="alert-error" v-if="auth.error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ auth.error }}
        </div>

        <!-- FORMULARIO -->
        <form class="register-form" @submit.prevent="enviar" v-if="!exitoso">

          <div class="form-row">
            <div class="form-group">
              <label>Nombre</label>
              <input v-model="form.nombre" type="text" placeholder="Tu nombre" required />
            </div>
            <div class="form-group">
              <label>Apellido</label>
              <input v-model="form.apellido" type="text" placeholder="Tu apellido" required />
            </div>
          </div>

          <div class="form-group">
            <label>Correo electrónico</label>
            <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Contraseña</label>
              <div class="input-icon">
                <input
                  v-model="form.password"
                  :type="verPassword ? 'text' : 'password'"
                  placeholder="Mínimo 8 caracteres"
                  :class="{ error: passwordError }"
                  @blur="validarPassword"
                  required
                />
                <button type="button" class="toggle-pass" @click="verPassword = !verPassword">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="!verPassword" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle v-if="!verPassword" cx="12" cy="12" r="3"/>
                    <path v-if="verPassword" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line v-if="verPassword" x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <div v-if="form.password.length > 0">
                <p class="field-error" v-if="form.password.length < 8">✗ Mínimo 8 caracteres</p>
                <p class="field-error" v-else-if="!/[A-Z]/.test(form.password)">✗ Debe tener al menos una mayúscula</p>
                <p class="field-error" v-else-if="!/[0-9]/.test(form.password)">✗ Debe tener al menos un número</p>
                <p class="field-hint" v-else style="color: #86efac;">✓ Contraseña válida</p>
              </div>
              <p class="field-hint" v-else>Mínimo 8 caracteres, una mayúscula y un número</p>
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="form.telefono" type="tel" placeholder="+57 300 000 0000" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Cédula</label>
              <input v-model="form.cedula" type="text" placeholder="Número de cédula" required />
            </div>
            <div class="form-group" v-if="rolId === 1">
              <label>Ciudad</label>
              <input v-model="form.ciudad" type="text" placeholder="Tu ciudad" />
            </div>
          </div>

          <!-- Campos INVERSOR -->
          <template v-if="rolId === 1">
            <div class="form-section-title">Información financiera</div>
            <div class="form-group">
              <label>Monto disponible para invertir (COP)</label>
              <input v-model="montoFormateado" type="text" placeholder="Ej: 5.000.000" inputmode="numeric" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Banco</label>
                <input v-model="form.banco" type="text" placeholder="Nombre del banco" required />
              </div>
              <div class="form-group">
                <label>Tipo de cuenta</label>
                <select v-model="form.tipo_cuenta" required>
                  <option value="">Selecciona</option>
                  <option value="ahorros">Ahorros</option>
                  <option value="corriente">Corriente</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Número de cuenta</label>
              <input v-model="form.numero_cuenta" type="text" placeholder="Número de cuenta bancaria" required />
            </div>
          </template>

          <!-- Campos PROPIETARIO -->
          <template v-if="rolId === 2">
            <div class="form-section-title">Información de la finca</div>
            <div class="form-group">
              <label>Nombre de la finca</label>
              <input v-model="form.nombre_finca" type="text" placeholder="Nombre de tu finca" required />
            </div>
            <div class="form-group">
              <label>Ubicación</label>
              <input v-model="form.ubicacion" type="text" placeholder="Municipio, Departamento" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Hectáreas</label>
                <input v-model="form.hectareas" type="number" placeholder="Ej: 50" required />
              </div>
              <div class="form-group">
                <label>Capacidad de bovinos</label>
                <input v-model="form.capacidad_bovinos" type="number" placeholder="Ej: 100" required />
              </div>
            </div>
          </template>

          <!-- Campos ZOOTECNISTA -->
          <template v-if="rolId === 3">
            <div class="form-section-title">Información profesional</div>
            <div class="form-group">
              <label>Tarjeta profesional</label>
              <input v-model="form.tarjeta_profesional" type="text" placeholder="Número de tarjeta profesional" required />
            </div>
            <div class="form-group">
              <label>Universidad</label>
              <input v-model="form.universidad" type="text" placeholder="Universidad donde te graduaste" required />
            </div>
          </template>

          <button type="submit" class="btn-submit" :disabled="auth.cargando">
            <span v-if="auth.cargando">Registrando...</span>
            <span v-else>{{ rolInfo.btnTexto }}</span>
          </button>

          <p class="login-link">
            ¿Ya tienes cuenta?
            <router-link to="/login">Inicia sesión aquí</router-link>
          </p>

        </form>
      </div>

      <!-- Volver -->
      <router-link to="/home" class="back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Volver al inicio
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const rolId       = computed(() => parseInt(route.query.rol) || 1)
const verPassword = ref(false)
const exitoso     = ref(false)
const mensajeExito = ref('')
const montoFormateado = ref('')
const passwordError   = ref(false)

const form = reactive({
  nombre: '', apellido: '', email: '', password: '',
  telefono: '', cedula: '', ciudad: '',
  monto_disponible: '', banco: '', tipo_cuenta: '', numero_cuenta: '',
  nombre_finca: '', ubicacion: '', hectareas: '', capacidad_bovinos: '',
  tarjeta_profesional: '', universidad: ''
})

const rolesInfo = {
  1: {
    titulo:   'Quiero Invertir',
    subtitulo: 'Crea tu cuenta como inversor y empieza a generar rentabilidad',
    btnTexto:  'Crear cuenta de inversor',
  },
  2: {
    titulo:   'Soy Propietario de Finca',
    subtitulo: 'Registra tu finca y empieza a recibir inversiones ganaderas',
    btnTexto:  'Registrar mi finca',
  },
  3: {
    titulo:   'Soy Zootecnista',
    subtitulo: 'Únete a la red de profesionales técnicos de FODEGAN',
    btnTexto:  'Crear cuenta profesional',
  }
}

const rolInfo = computed(() => rolesInfo[rolId.value] || rolesInfo[1])

const videoSrc = computed(() => {
  const videos = {
    1: '/video/VideoRegisterInversor.mp4',
    2: '/video/VideoRegisterPropietario.mp4',
    3: '/video/VideoRegisterZootecnista.mp4'
  }
  return videos[rolId.value] || videos[1]
})

async function enviar() {
  const datos = { ...form, rol_id: rolId.value }
  const result = await auth.register(datos)
  if (result.ok) {
    exitoso.value      = true
    mensajeExito.value = result.message
    if (result.aprobado) {
      setTimeout(() => router.push('/login'), 2500)
    }
  }
}

function validarPassword() {
  passwordError.value = form.password.length < 8 ||
    !/[A-Z]/.test(form.password) ||
    !/[0-9]/.test(form.password)
}

watch(montoFormateado, (val) => {
  const solo = val.replace(/\D/g, '')
  form.monto_disponible = solo
  montoFormateado.value = solo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
})
</script>

<style scoped>
.register-root {
  --verde:  #1B4332;
  --dorado: #D4A373;
  --blanco: #FFFFFF;
  --texto:  #1a1a1a;
  --muted:  #6b7280;
  --border: rgba(255,255,255,0.2);
  --error:  #dc2626;

  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Open Sans', sans-serif;
  position: relative; overflow: hidden;
}

/* Video fondo */
.register-video {
  position: fixed; inset: 0; z-index: 0;
  width: 100%; height: 100%;
  object-fit: cover;
}
.register-overlay {
  position: fixed; inset: 0; z-index: 1;
  background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(27,67,50,0.7) 100%);
}

/* Wrapper */
.register-wrapper {
  position: relative; z-index: 2;
  width: 100%; max-width: 580px;
  padding: 1.5rem 1rem 2rem;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}

/* Logo */
.register-logo { margin-bottom: 0.5rem; }
.logo-img { width: 140px; filter: brightness(0) invert(1); }

/* Card glass */
.register-card {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 20px;
  padding: 2rem;
  width: 100%; box-sizing: border-box;
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
}

/* Card header */
.card-header { margin-bottom: 1.5rem; }
.card-title {
  font-family: 'Anton', sans-serif;
  font-size: 1.5rem; color: #fff;
  letter-spacing: 0.04em; margin: 0 0 0.3rem;
}
.card-sub { font-size: 0.8rem; color: rgba(255,255,255,0.65); margin: 0; }

/* Alertas */
.alert-success, .alert-error {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.8rem 1rem; border-radius: 10px;
  font-size: 0.82rem; margin-bottom: 1rem;
}
.alert-success { background: rgba(16,185,129,0.2); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.3); }
.alert-error   { background: rgba(220,38,38,0.2);  color: #fca5a5; border: 1px solid rgba(220,38,38,0.3); }

/* Form */
.register-form { display: flex; flex-direction: column; gap: 0.9rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label {
  font-size: 0.75rem; font-weight: 600;
  color: rgba(255,255,255,0.85); letter-spacing: 0.02em;
}
.form-group input,
.form-group select {
  all: unset;
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.85rem; color: #fff;
  background: rgba(255,255,255,0.1);
  transition: border-color 0.2s, background 0.2s;
  width: 100%; box-sizing: border-box;
}
.form-group input:focus,
.form-group select:focus {
  border-color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.15);
}
.form-group input::placeholder { color: rgba(255,255,255,0.4); }
.form-group input.error { border-color: #fca5a5; }

.input-icon { position: relative; }
.input-icon input { padding-right: 2.5rem; }
.toggle-pass {
  all: unset; cursor: pointer;
  position: absolute; right: 0.7rem; top: 50%;
  transform: translateY(-50%);
  color: rgba(255,255,255,0.5);
}

.form-section-title {
  font-family: 'Anton', sans-serif;
  font-size: 0.78rem; letter-spacing: 0.1em;
  color: var(--dorado); text-transform: uppercase;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  margin-top: 0.3rem;
}

.btn-submit {
  all: unset; cursor: pointer;
  background: var(--dorado); color: #fff;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.9rem; font-weight: 700;
  padding: 0.9rem; border-radius: 100px;
  text-align: center; margin-top: 0.5rem;
  transition: opacity 0.2s, transform 0.2s;
  -webkit-user-select: none; user-select: none;
}
.btn-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.login-link {
  font-size: 0.8rem; color: rgba(255,255,255,0.6);
  text-align: center; margin-top: 0.3rem;
}
.login-link a { color: var(--dorado); font-weight: 600; text-decoration: none; }
.login-link a:hover { text-decoration: underline; }

/* Volver */
.back-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  color: rgba(255,255,255,0.6); font-size: 0.82rem; font-weight: 600;
  text-decoration: none; transition: color 0.2s;
}
.back-btn:hover { color: #fff; }

.field-hint  { font-size: 0.7rem; color: rgba(255,255,255,0.45); margin-top: 0.2rem; }
.field-error { font-size: 0.7rem; color: #fca5a5; margin-top: 0.2rem; }

@media (max-width: 500px) {
  .form-row { grid-template-columns: 1fr; }
  .register-card { padding: 1.4rem; }
}
</style>