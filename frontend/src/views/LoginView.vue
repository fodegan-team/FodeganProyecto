<template>
  <div class="login-root">

    <div class="login-bg" />

    <div class="login-wrapper">

      <!-- Header -->
      <div class="login-header">
        <router-link to="/home" class="back-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver
        </router-link>
        <div class="logo-login">
          <span class="logo-text">FODEGAN</span>
          <span class="logo-sub">INVERSIONES GANADERAS</span>
        </div>
      </div>

      <!-- Tarjeta -->
      <div class="login-card">

        <div class="card-header">
          <div class="login-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <div>
            <h1 class="card-title">Iniciar Sesión</h1>
            <p class="card-sub">Bienvenido de vuelta a FODEGAN</p>
          </div>
        </div>

        <!-- Error -->
        <div class="alert-error" v-if="auth.error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ auth.error }}
        </div>

        <!-- Formulario -->
        <form class="login-form" @submit.prevent="enviar">

          <div class="form-group">
            <label>Correo electrónico</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              autofocus
            />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <div class="input-icon">
              <input
                v-model="form.password"
                :type="verPassword ? 'text' : 'password'"
                placeholder="Tu contraseña"
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
          </div>

          <button type="submit" class="btn-submit" :disabled="auth.cargando">
            <span v-if="auth.cargando">Ingresando...</span>
            <span v-else>Ingresar</span>
          </button>

          <p class="register-link">
            ¿No tienes cuenta?
            <router-link to="/home">Regístrate aquí</router-link>
          </p>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth   = useAuthStore()

const verPassword = ref(false)
const form = reactive({ email: '', password: '' })

async function enviar() {
  const result = await auth.login(form.email, form.password)
  if (result.ok) {
    // Redirigir según el rol
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
.login-root {
  --verde:  #1B4332;
  --dorado: #D4A373;
  --crema:  #F5F0E8;
  --blanco: #FFFFFF;
  --texto:  #1a1a1a;
  --muted:  #6b7280;
  --border: #e5e7eb;
  --error:  #dc2626;

  min-height: 100vh;
  background: var(--crema);
  font-family: 'Open Sans', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-bg {
  position: fixed; inset: 0; z-index: 0;
  background: linear-gradient(135deg, var(--verde) 0%, #2D6A4F 50%, var(--crema) 100%);
  opacity: 0.08;
}

.login-wrapper {
  position: relative; z-index: 1;
  width: 100%; max-width: 460px;
  padding: 1.5rem 1rem;
}

/* Header */
.login-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.5rem;
}
.back-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  color: var(--verde); font-size: 0.85rem; font-weight: 600;
  text-decoration: none; transition: opacity 0.2s;
}
.back-btn:hover { opacity: 0.7; }
.logo-text {
  font-family: 'Anton', sans-serif;
  font-size: 1rem; letter-spacing: 0.15em; color: var(--verde);
}
.logo-sub {
  font-size: 0.5rem; letter-spacing: 0.12em;
  color: var(--muted); text-transform: uppercase;
  display: block; text-align: right;
}

/* Tarjeta */
.login-card {
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
.login-badge {
  width: 48px; height: 48px; border-radius: 14px;
  background: var(--verde);
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

/* Alerta */
.alert-error {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.9rem 1rem; border-radius: 10px;
  font-size: 0.85rem; margin-bottom: 1.2rem;
  background: #fef2f2; color: var(--error);
  border: 1px solid #fecaca;
}

/* Formulario */
.login-form { display: flex; flex-direction: column; gap: 1.2rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label {
  font-size: 0.78rem; font-weight: 600;
  color: var(--texto); letter-spacing: 0.02em;
}
.form-group input {
  all: unset;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 0.75rem 0.9rem;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.88rem; color: var(--texto);
  background: var(--blanco);
  transition: border-color 0.2s;
  width: 100%; box-sizing: border-box;
}
.form-group input:focus { border-color: var(--verde); }
.form-group input::placeholder { color: #9ca3af; }

.input-icon { position: relative; }
.input-icon input { padding-right: 2.5rem; }
.toggle-pass {
  all: unset; cursor: pointer;
  position: absolute; right: 0.7rem; top: 50%;
  transform: translateY(-50%); color: var(--muted);
}

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

.register-link {
  font-size: 0.82rem; color: var(--muted);
  text-align: center;
}
.register-link a {
  color: var(--verde); font-weight: 600; text-decoration: none;
}
.register-link a:hover { text-decoration: underline; }
</style>