<template>
  <div class="register-root">

    <!-- Fondo -->
    <div class="register-bg" />

    <!-- Contenido -->
    <div class="register-wrapper">

      <!-- Header -->
      <div class="register-header">
        <router-link to="/home" class="back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver
        </router-link>
        <div class="logo-register">
          <span class="logo-text">FODEGAN</span>
          <span class="logo-sub">INVERSIONES GANADERAS</span>
        </div>
      </div>

      <!-- Tarjeta del formulario -->
      <div class="register-card">

        <!-- Título según rol -->
        <div class="card-header">
          <div class="rol-badge" :style="{ background: rolInfo.color }">
            <span v-html="rolInfo.icon" />
          </div>
          <div>
            <h1 class="card-title">{{ rolInfo.titulo }}</h1>
            <p class="card-sub">{{ rolInfo.subtitulo }}</p>
          </div>
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

          <!-- Campos base — todos los roles -->
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
                <!-- Hints dinámicos -->
                <div v-if="form.password.length > 0">
                    <p class="field-error" v-if="form.password.length < 8">
                    ✗ Mínimo 8 caracteres
                    </p>
                    <p class="field-error" v-else-if="!/[A-Z]/.test(form.password)">
                    ✗ Debe tener al menos una mayúscula
                    </p>
                    <p class="field-error" v-else-if="!/[0-9]/.test(form.password)">
                    ✗ Debe tener al menos un número
                    </p>
                    <p class="field-hint" v-else style="color: #16a34a;">
                    ✓ Contraseña válida
                    </p>
                </div>
                <p class="field-hint" v-else>
                    Mínimo 8 caracteres, una mayúscula y un número
                </p>
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
                <input
                v-model="montoFormateado"
                type="text"
                placeholder="Ej: 5.000.000"
                inputmode="numeric"
                required
                />
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

          <!-- Botón submit -->
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { watch } from 'vue'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()
const rolId = computed(() => parseInt(route.query.rol) || 1)
const verPassword = ref(false)
const exitoso     = ref(false)
const mensajeExito = ref('')
const montoFormateado = ref('')
const passwordError = ref(false)

const form = reactive({
  nombre: '', apellido: '', email: '', password: '',
  telefono: '', cedula: '', ciudad: '',
  // Inversor
  monto_disponible: '', banco: '', tipo_cuenta: '', numero_cuenta: '',
  // Propietario
  nombre_finca: '', ubicacion: '', hectareas: '', capacidad_bovinos: '',
  // Zootecnista
  tarjeta_profesional: '', universidad: ''
})





const rolesInfo = {
  1: {
    titulo:    'Quiero Invertir',
    subtitulo: 'Crea tu cuenta como inversor y empieza a generar rentabilidad',
    color:     '#D4A373',
    btnTexto:  'Crear cuenta de inversor',
    icon:      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
  },
  2: {
    titulo:    'Soy Propietario de Finca',
    subtitulo: 'Registra tu finca y empieza a recibir inversiones ganaderas',
    color:     '#2D6A4F',
    btnTexto:  'Registrar mi finca',
    icon:      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
  },
  3: {
    titulo:    'Soy Zootecnista',
    subtitulo: 'Únete a la red de profesionales técnicos de FODEGAN',
    color:     '#52796F',
    btnTexto:  'Crear cuenta profesional',
    icon:      `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`
  }
}

const rolInfo = computed(() => rolesInfo[rolId.value] || rolesInfo[1])

async function enviar() {
  const datos = { ...form, rol_id: rolId.value }
  const result = await auth.register(datos)
  if (result.ok) {
    exitoso.value     = true
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
  --verde:   #1B4332;
  --dorado:  #D4A373;
  --crema:   #F5F0E8;
  --blanco:  #FFFFFF;
  --texto:   #1a1a1a;
  --muted:   #6b7280;
  --border:  #e5e7eb;
  --error:   #dc2626;
  --success: #16a34a;

  min-height: 100vh;
  background: var(--crema);
  font-family: 'Open Sans', sans-serif;
}

.register-bg {
  position: fixed; inset: 0; z-index: 0;
  background: linear-gradient(135deg, var(--verde) 0%, #2D6A4F 50%, var(--crema) 100%);
  opacity: 0.08;
}

.register-wrapper {
  position: relative; z-index: 1;
  max-width: 640px; margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

/* Header */
.register-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.5rem;
}
.back-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  color: var(--verde); font-size: 0.85rem; font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}
.back-btn:hover { opacity: 0.7; }
.logo-text {
  font-family: 'Anton', sans-serif;
  font-size: 1rem; letter-spacing: 0.15em; color: var(--verde);
}
.logo-sub {
  font-size: 0.5rem; letter-spacing: 0.12em;
  color: var(--muted); text-transform: uppercase; display: block;
  text-align: right;
}

/* Tarjeta */
.register-card {
  background: var(--blanco);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.card-header {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.8rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}
.rol-badge {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.card-title {
  font-family: 'Anton', sans-serif;
  font-size: 1.4rem; font-weight: 400;
  color: var(--verde); margin: 0; letter-spacing: 0.02em;
}
.card-sub {
  font-size: 0.8rem; color: var(--muted); margin: 0.2rem 0 0;
}

/* Alertas */
.alert-success, .alert-error {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.9rem 1rem; border-radius: 10px;
  font-size: 0.85rem; margin-bottom: 1.2rem;
}
.alert-success { background: #f0fdf4; color: var(--success); border: 1px solid #bbf7d0; }
.alert-error   { background: #fef2f2; color: var(--error);   border: 1px solid #fecaca; }

/* Formulario */
.register-form { display: flex; flex-direction: column; gap: 1rem; }

.form-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }

.form-group label {
  font-size: 0.78rem; font-weight: 600;
  color: var(--texto); letter-spacing: 0.02em;
}

.form-group input,
.form-group select {
  all: unset;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 0.7rem 0.9rem;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.88rem; color: var(--texto);
  background: var(--blanco);
  transition: border-color 0.2s;
  width: 100%; box-sizing: border-box;
}
.form-group input:focus,
.form-group select:focus {
  border-color: var(--verde);
  outline: none;
}
.form-group input::placeholder { color: #9ca3af; }

.input-icon { position: relative; }
.input-icon input { padding-right: 2.5rem; width: 100%; box-sizing: border-box; }
.toggle-pass {
  all: unset; cursor: pointer;
  position: absolute; right: 0.7rem; top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
}

.form-section-title {
  font-family: 'Anton', sans-serif;
  font-size: 0.85rem; letter-spacing: 0.08em;
  color: var(--verde); text-transform: uppercase;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
  margin-top: 0.5rem;
}

/* Botón submit */
.btn-submit {
  all: unset; cursor: pointer;
  background: var(--verde); color: var(--blanco);
  font-family: 'Open Sans', sans-serif;
  font-size: 0.9rem; font-weight: 600;
  padding: 0.95rem; border-radius: 100px;
  text-align: center; margin-top: 0.5rem;
  transition: opacity 0.2s, transform 0.2s;
  -webkit-user-select: none; user-select: none;
}
.btn-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.login-link {
  font-size: 0.82rem; color: var(--muted);
  text-align: center; margin-top: 0.5rem;
}
.login-link a { color: var(--verde); font-weight: 600; text-decoration: none; }
.login-link a:hover { text-decoration: underline; }

/* Responsive */
@media (max-width: 500px) {
  .form-row { grid-template-columns: 1fr; }
  .register-card { padding: 1.5rem; }
}

/* ── Validación visual ── */
.form-group input.error,
.form-group select.error {
  border-color: #dc2626;
  background: #fef2f2;
}

.field-hint {
  font-size: 0.72rem;
  color: #6b7280;
  margin-top: 0.2rem;
}

.field-error {
  font-size: 0.72rem;
  color: #dc2626;
  margin-top: 0.2rem;
}
</style>