<template>
  <!-- Overlay -->
  <Teleport to="body">
    <div class="modal-overlay" @click.self="cerrar">
      <div class="modal-split">

        <!-- ── LADO IZQUIERDO — Video + Info del rol ── -->
        <div class="split-left">
          <video
            class="split-video"
            autoplay muted loop playsinline
            :src="rolActivo.video"
            :key="rolActivo.video"
          />
          <div class="split-overlay" />

          <div class="split-content">
            <div class="split-badge">Portal de {{ rolActivo.nombre }}</div>
            <h2 class="split-title">{{ rolActivo.titulo }}</h2>
            <p class="split-sub">{{ rolActivo.subtitulo }}</p>

            <ul class="split-features">
              <li v-for="f in rolActivo.features" :key="f">
                <span class="feat-icon">{{ f.icon }}</span>
                {{ f.texto }}
              </li>
            </ul>
          </div>
        </div>

        <!-- ── LADO DERECHO — Formulario ── -->
        <div class="split-right">

          <!-- Botón cerrar -->
          <button class="btn-close" @click="cerrar">✕</button>

          <div class="form-wrapper">
            <h2 class="form-title">Iniciar sesión</h2>
            <p class="form-sub">Bienvenido de vuelta a FODEGAN</p>

            <!-- Selector de rol -->
            <div class="rol-selector">
              <p class="rol-label">ACCEDER COMO</p>
              <div class="rol-tabs">
                <button
                  v-for="r in roles"
                  :key="r.id"
                  class="rol-tab"
                  :class="{ active: rolSeleccionado === r.id }"
                  @click="rolSeleccionado = r.id"
                >
                  <span v-html="r.icon" />
                  {{ r.nombre }}
                </button>
              </div>
            </div>

            <!-- Error -->
            <div class="alert-error" v-if="auth.error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ auth.error }}
            </div>

            <!-- Formulario -->
            <form @submit.prevent="enviar" class="login-form">
              <div class="form-group">
                <label>CORREO ELECTRÓNICO</label>
                <input
                  v-model="form.email"
                  type="email"
                  :placeholder="rolActivo.placeholder"
                  required
                />
              </div>

              <div class="form-group">
                <label>CONTRASEÑA</label>
                <div class="input-pass">
                  <input
                    v-model="form.password"
                    :type="verPass ? 'text' : 'password'"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" @click="verPass = !verPass">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path v-if="!verPass" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle v-if="!verPass" cx="12" cy="12" r="3"/>
                      <path v-if="verPass" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line v-if="verPass" x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" class="btn-ingresar" :disabled="auth.cargando">
                {{ auth.cargando ? 'Ingresando...' : 'Iniciar sesión' }}
              </button>

              <p class="registro-link">
                ¿No tienes cuenta?
                <router-link to="/register" @click="cerrar">Regístrate aquí</router-link>
              </p>
            </form>

            <!-- Acceso Admin separado -->
            <div class="admin-access" @click="rolSeleccionado = 'admin'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Acceso Administrador
            </div>

          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth   = useAuthStore()

const verPass = ref(false)
const form    = reactive({ email: '', password: '' })

// ── Roles ─────────────────────────────────────────
const roles = [
  {
    id:     'inversionista',
    nombre: 'Inversionista',
    icon:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
  },
  {
    id:     'propietario',
    nombre: 'Propietario',
    icon:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
  },
  {
    id:     'zootecnista',
    nombre: 'Zootecnista',
    icon:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`
  },
  {
    id:     'admin',
    nombre: 'Admin',
    icon:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  },
]

const rolSeleccionado = ref('inversionista')

// ── Info por rol ──────────────────────────────────
const rolesInfo = {
  inversionista: {
    nombre:    'Inversionistas',
    titulo:    'Invierte en el campo.',
    subtitulo: 'Tus rendimientos crecen con cada kilo de ganado.',
    video:     '/video/VideoLoginInversor.mp4',
    placeholder: 'inversor@fodegan.com',
    features: [
      { icon: '📊', texto: 'Rendimientos proyectados 12–18% anual' },
      { icon: '🛡', texto: 'Cada ciclo respaldado por póliza de seguro' },
      { icon: '📈', texto: 'Monitoreo en tiempo real de su portafolio' },
    ]
  },
  propietario: {
    nombre:    'Propietarios',
    titulo:    'Tu finca, nuestra inversión.',
    subtitulo: 'Conectamos tu tierra con capital listo para trabajar.',
    video:     '/video/VideoLoginPropietario.mp4',
    placeholder: 'propietario@fodegan.com',
    features: [
      { icon: '💰', texto: 'Financiamiento del 100% del ganado' },
      { icon: '👨‍⚕️', texto: 'Asesoría zootécnica sin costo' },
      { icon: '📄', texto: 'Contratos transparentes y seguros' },
    ]
  },
  zootecnista: {
    nombre:    'Zootecnistas',
    titulo:    'Tu expertise, nuestro respaldo.',
    subtitulo: 'Gestiona lotes y reporta el progreso del ganado.',
    video:     '/video/VideoLoginZootecnista.mp4',
    placeholder: 'zootecnista@fodegan.com',
    features: [
      { icon: '🐄', texto: 'Gestión técnica de lotes ganaderos' },
      { icon: '📋', texto: 'Reportes mensuales digitales' },
      { icon: '⚕️', texto: 'Seguimiento sanitario completo' },
    ]
  },
  admin: {
    nombre:    'Administradores',
    titulo:    'Panel de control FODEGAN.',
    subtitulo: 'Supervisa, valida y controla toda la plataforma.',
    video:     '/video/VideoLoginAdm.mp4',
    placeholder: 'admin@fodegan.com',
    features: [
      { icon: '👥', texto: 'Gestión completa de usuarios' },
      { icon: '✅', texto: 'Aprobación de inversiones y registros' },
      { icon: '📊', texto: 'Reportes globales de la plataforma' },
    ]
  }
}

const rolActivo = computed(() => rolesInfo[rolSeleccionado.value])
const overlayColor = computed(() => {
  const colores = {
    inversionista: 'linear-gradient(160deg, rgba(27,67,50,0.88) 0%, rgba(27,67,50,0.6) 100%)',
    propietario:   'linear-gradient(160deg, rgba(92,51,23,0.88) 0%, rgba(120,72,35,0.6) 100%)',
    zootecnista:   'linear-gradient(160deg, rgba(12,74,110,0.88) 0%, rgba(14,116,144,0.6) 100%)',
    admin:         'linear-gradient(160deg, rgba(55,65,81,0.88) 0%, rgba(75,85,99,0.6) 100%)',
  }
  return colores[rolSeleccionado.value]
})

const colorPrimario = computed(() => {
  const colores = {
    inversionista: '#1B4332',
    propietario:   '#5C3317',
    zootecnista:   '#0C4A6E',
    admin:         '#374151',
  }
  return colores[rolSeleccionado.value]
})
// ── Acciones ──────────────────────────────────────
function cerrar() {
  router.push('/home')
}

async function enviar() {
  const result = await auth.login(form.email, form.password)
  if (result.ok) {
    const rutas = {
      inversionista: '/dashboard/inversor',
      propietario:   '/dashboard/propietario',
      zootecnista:   '/dashboard/zootecnista',
      administrador: '/dashboard/admin'
    }
    router.push(rutas[result.rol] || '/home')
  }
}
</script>

<style scoped>
/* ── Overlay ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}

/* ── Split container ── */
.modal-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%; max-width: 900px;
  height: 580px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.4);
}

/* ── Lado izquierdo ── */
.split-left {
  position: relative;
  overflow: hidden;
}
.split-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
}
.split-overlay {
  position: absolute; inset: 0;
  background: v-bind(overlayColor);
}
.split-content {
  position: relative; z-index: 1;
  padding: 2rem;
  height: 100%;
  display: flex; flex-direction: column; justify-content: flex-end;
  color: #fff;
}
.split-badge {
  display: inline-block;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.68rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #D4A373;
  border: 1px solid rgba(212,163,115,0.4);
  border-radius: 100px;
  padding: 0.3rem 0.8rem;
  margin-bottom: 1rem;
  width: fit-content;
}
.split-title {
  font-family: 'Anton', sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 400; line-height: 1.1;
  margin-bottom: 0.6rem;
}
.split-sub {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.85rem; color: rgba(255,255,255,0.75);
  margin-bottom: 1.4rem; line-height: 1.6;
}
.split-features {
  list-style: none; padding: 0;
  display: flex; flex-direction: column; gap: 0.6rem;
}
.split-features li {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.82rem; color: rgba(255,255,255,0.85);
  display: flex; align-items: center; gap: 0.6rem;
}
.feat-icon { font-size: 1rem; }

/* ── Lado derecho ── */
.split-right {
  background: #F5F0E8;
  position: relative;
  overflow-y: auto;
}
.btn-close {
  all: unset; cursor: pointer;
  position: absolute; top: 1rem; right: 1rem;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(0,0,0,0.08);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; color: #555;
  transition: background 0.2s;
}
.btn-close:hover { background: rgba(0,0,0,0.15); }

.form-wrapper {
  padding: 2rem 2rem 1.5rem;
}
.form-title {
  font-family: 'Anton', sans-serif;
  font-size: 1.6rem; font-weight: 400;
  color: #1B4332; margin-bottom: 0.2rem;
  letter-spacing: 0.02em;
}
.form-sub {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.82rem; color: #6b7280;
  margin-bottom: 1.4rem;
}

/* Selector de rol */
.rol-selector { margin-bottom: 1.2rem; }
.rol-label {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.68rem; font-weight: 600;
  letter-spacing: 0.12em; color: #6b7280;
  margin-bottom: 0.5rem;
}
.rol-tabs {
  display: flex; gap: 0.4rem; flex-wrap: wrap;
}
.rol-tab {
  all: unset; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.75rem; font-weight: 600;
  padding: 0.45rem 0.9rem; border-radius: 100px;
  border: 1.5px solid #d1d5db;
  color: #6b7280;
  transition: all 0.2s;
  -webkit-user-select: none; user-select: none;
}
.rol-tab.active {
  background: #1B4332; color: #fff; border-color: #1B4332;
}

/* Alerta */
.alert-error {
  display: flex; align-items: center; gap: 0.5rem;
  background: #fef2f2; color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px; padding: 0.7rem 0.9rem;
  font-family: 'Open Sans', sans-serif; font-size: 0.82rem;
  margin-bottom: 1rem;
}

/* Formulario */
.login-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.68rem; font-weight: 600;
  letter-spacing: 0.1em; color: #374151;
}
.form-group input {
  all: unset;
  border: 1.5px solid #e5e7eb; border-radius: 10px;
  padding: 0.72rem 0.9rem;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.88rem; color: #111;
  background: #fff;
  transition: border-color 0.2s;
  width: 100%; box-sizing: border-box;
}
.form-group input:focus { border-color: #1B4332; }
.form-group input::placeholder { color: #9ca3af; }

.input-pass { position: relative; }
.input-pass input { padding-right: 2.8rem; }
.input-pass button {
  all: unset; cursor: pointer;
  position: absolute; right: 0.8rem; top: 50%;
  transform: translateY(-50%); color: #9ca3af;
}

.btn-ingresar {
  all: unset; cursor: pointer;
  background: #1B4332; color: #fff;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.9rem; font-weight: 600;
  padding: 0.9rem; border-radius: 100px;
  text-align: center; margin-top: 0.4rem;
  transition: opacity 0.2s, transform 0.2s;
  -webkit-user-select: none; user-select: none;
}
.btn-ingresar:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.btn-ingresar:disabled { opacity: 0.6; cursor: not-allowed; }

.registro-link {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.8rem; color: #6b7280; text-align: center;
}
.registro-link a { color: #1B4332; font-weight: 600; text-decoration: none; }
.registro-link a:hover { text-decoration: underline; }

/* Acceso admin */
.admin-access {
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  margin-top: 1rem;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.75rem; color: #9ca3af;
  cursor: pointer; transition: color 0.2s;
}
.admin-access:hover { color: #1B4332; }

/* Responsive móvil */
@media (max-width: 640px) {
  .modal-split { grid-template-columns: 1fr; height: auto; }
  .split-left  { height: 200px; }
}
.btn-ingresar {
  background: v-bind(colorPrimario);
}
.rol-tab.active {
  background: v-bind(colorPrimario);
  border-color: v-bind(colorPrimario);
}
</style>