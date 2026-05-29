<template>
  <div class="dashboard-root">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-text">FODEGAN</span>
        <span class="logo-sub">INVERSIONES GANADERAS</span>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems" :key="item.id"
          class="nav-item"
          :class="{ active: seccionActiva === item.id }"
          @click="seccionActiva = item.id"
        >
          <span v-html="item.icon" />
          {{ item.label }}
        </button>
      </nav>

      <button class="btn-logout" @click="cerrarSesion">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Cerrar sesión
      </button>
    </aside>

    <!-- CONTENIDO -->
    <main class="main-content">

      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1 class="dash-title">Bienvenido, {{ auth.usuario?.nombre }} 👋</h1>
          <p class="dash-sub">Panel de Inversionista · FODEGAN</p>
        </div>
        <div class="header-badge">
          <span class="badge-dot" />
          Cuenta activa
        </div>
      </div>

      <!-- ══ SECCIÓN: RESUMEN ══ -->
      <section v-if="seccionActiva === 'resumen'">
        <div class="stats-grid">
          <div class="stat-card" v-for="s in statsResumen" :key="s.label">
            <div class="stat-icon" v-html="s.icon" />
            <div>
              <p class="stat-val">{{ s.valor }}</p>
              <p class="stat-label">{{ s.label }}</p>
            </div>
          </div>
        </div>

        <div class="section-title">Mis Inversiones</div>

        <div class="empty-state" v-if="misInversiones.length === 0">
          <p>Aún no tienes inversiones activas.</p>
          <button class="btn-primary" @click="seccionActiva = 'invertir'">
            Comenzar a invertir
          </button>
        </div>

        <div class="inversiones-list" v-else>
          <div class="inversion-card" v-for="inv in misInversiones" :key="inv.id">
            <div class="inv-header">
              <div>
                <p class="inv-finca">{{ inv.nombre_ficticio }}</p>
                <p class="inv-fecha">Desde {{ formatFecha(inv.fecha_inicio) }}</p>
              </div>
              <span class="inv-badge activa">Activa</span>
            </div>
            <div class="inv-body">
              <div class="inv-stat">
                <p class="inv-stat-val">{{ formatCOP(inv.monto_cop) }}</p>
                <p class="inv-stat-lbl">Monto invertido</p>
              </div>
              <div class="inv-stat">
                <p class="inv-stat-val">{{ inv.cabezas }}</p>
                <p class="inv-stat-lbl">Cabezas</p>
              </div>
              <div class="inv-stat">
                <p class="inv-stat-val">{{ inv.dias_ciclo }} días</p>
                <p class="inv-stat-lbl">Duración ciclo</p>
              </div>
              <div class="inv-stat">
                <p class="inv-stat-val green">{{ inv.dias_restantes }} días</p>
                <p class="inv-stat-lbl">Días restantes</p>
              </div>
            </div>
            <div class="inv-progress-bar">
              <div class="inv-progress-fill" :style="{ width: Math.min(inv.progreso, 100) + '%' }" />
            </div>
            <p class="inv-progress-label">{{ Math.min(inv.progreso, 100) }}% del ciclo completado</p>
          </div>
        </div>
      </section>

      <!-- ══ SECCIÓN: INVERTIR ══ -->
      <section v-if="seccionActiva === 'invertir'">
        <div class="section-title">Encontrar Oportunidades de Inversión</div>

        <!-- Paso 1: Ingresar monto -->
        <div class="invertir-card" v-if="pasoActivo === 1">
          <h3 class="paso-title">
            <span class="paso-num">01</span>
            ¿Cuánto deseas invertir?
          </h3>
          <p class="paso-desc">
            Ingresa el monto disponible y te mostraremos las fincas que se ajustan a tu inversión.
          </p>

          <div class="monto-info" v-if="config">
            <div class="info-item">
              <span class="info-lbl">Precio del kilo</span>
              <span class="info-val">{{ formatCOP(config.precio_kilo) }}</span>
            </div>
            <div class="info-item">
              <span class="info-lbl">Peso del animal</span>
              <span class="info-val">{{ config.peso_animal_kg }} kg</span>
            </div>
            <div class="info-item">
              <span class="info-lbl">Costo por animal</span>
              <span class="info-val green">{{ formatCOP(config.precio_kilo * config.peso_animal_kg) }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Monto a invertir (COP)</label>
            <input
              v-model="montoInput"
              type="text"
              placeholder="Ej: 10.000.000"
              inputmode="numeric"
              @input="formatearMonto"
            />
            <p class="field-hint" v-if="cabezasCalculadas > 0">
              Con este monto puedes comprar aproximadamente
              <strong>{{ cabezasCalculadas }} cabezas</strong> de ganado
            </p>
          </div>

          <button class="btn-primary" @click="buscarFincas" :disabled="cargandoFincas">
            {{ cargandoFincas ? 'Buscando...' : 'Buscar fincas disponibles →' }}
          </button>

          <div class="alert-error" v-if="errorFincas">{{ errorFincas }}</div>
        </div>

        <!-- Paso 2: Seleccionar finca -->
        <div v-if="pasoActivo === 2">
          <div class="paso-header">
            <button class="btn-back" @click="pasoActivo = 1">← Volver</button>
            <h3 class="paso-title">
              <span class="paso-num">02</span>
              Selecciona una finca
            </h3>
          </div>
          <p class="paso-desc">
            Encontramos <strong>{{ fincasDisponibles.length }}</strong> fincas disponibles
            para tu inversión de <strong>{{ montoInput }}</strong>
          </p>

          <div class="fincas-grid">
            <div
              class="finca-card"
              v-for="finca in fincasDisponibles" :key="finca.id"
              :class="{ selected: fincaSeleccionada?.id === finca.id }"
              @click="fincaSeleccionada = finca"
            >
              <div class="finca-header">
                <span class="finca-nombre">{{ finca.nombre_ficticio }}</span>
                <svg v-if="fincaSeleccionada?.id === finca.id"
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#1B4332" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div class="finca-stats">
                <div class="finca-stat">
                  <span class="finca-stat-val">{{ finca.capacidad_total }}</span>
                  <span class="finca-stat-lbl">Capacidad bovinos</span>
                </div>
                <div class="finca-stat">
                  <span class="finca-stat-val">{{ finca.hectareas }} ha</span>
                  <span class="finca-stat-lbl">Hectáreas</span>
                </div>
              </div>
            </div>
          </div>

          <button
            class="btn-primary"
            @click="pasoActivo = 3"
            :disabled="!fincaSeleccionada"
          >
            Continuar →
          </button>
        </div>

        <!-- Paso 3: Elegir duración y confirmar -->
        <div class="invertir-card" v-if="pasoActivo === 3">
          <div class="paso-header">
            <button class="btn-back" @click="pasoActivo = 2">← Volver</button>
            <h3 class="paso-title">
              <span class="paso-num">03</span>
              Confirma tu inversión
            </h3>
          </div>

          <div class="resumen-inversion">
            <div class="resumen-item">
              <span class="resumen-lbl">Finca</span>
              <span class="resumen-val">{{ fincaSeleccionada?.nombre_ficticio }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-lbl">Monto a invertir</span>
              <span class="resumen-val green">{{ montoInput }}</span>
            </div>
            <div class="resumen-item">
              <span class="resumen-lbl">Cabezas de ganado</span>
              <span class="resumen-val">{{ cabezasCalculadas }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Duración del ciclo</label>
            <div class="dias-options">
              <button
                v-for="dias in [120, 150, 180]" :key="dias"
                class="dias-btn"
                :class="{ active: diasCiclo === dias }"
                @click="diasCiclo = dias"
              >
                {{ dias }} días
              </button>
            </div>
          </div>

          <div class="rendimiento-est">
            <p class="rend-label">Rendimiento estimado</p>
            <p class="rend-val">12% – 18%</p>
            <p class="rend-sub">Al finalizar el ciclo de {{ diasCiclo }} días</p>
          </div>

          <button class="btn-primary" @click="confirmarInversion" :disabled="cargandoInversion">
            {{ cargandoInversion ? 'Procesando...' : '✓ Confirmar inversión' }}
          </button>

          <div class="alert-error"  v-if="errorInversion">{{ errorInversion }}</div>
          <div class="alert-success" v-if="exitoInversion">{{ exitoInversion }}</div>
        </div>
      </section>

      <!-- ══ SECCIÓN: PERFIL ══ -->
      <section v-if="seccionActiva === 'perfil'">
        <div class="perfil-card">
          <div class="perfil-avatar">
            {{ auth.usuario?.nombre?.charAt(0) }}{{ auth.usuario?.apellido?.charAt(0) }}
          </div>
          <h2 class="perfil-nombre">{{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</h2>
          <p class="perfil-rol">Inversionista FODEGAN</p>
          <div class="perfil-info">
            <div class="perfil-item">
              <span class="perfil-lbl">Correo</span>
              <span class="perfil-val">{{ auth.usuario?.email }}</span>
            </div>
            <div class="perfil-item">
              <span class="perfil-lbl">Rol</span>
              <span class="perfil-val">Inversionista</span>
            </div>
            <div class="perfil-item">
              <span class="perfil-lbl">Estado</span>
              <span class="perfil-val green">✓ Cuenta verificada</span>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'

const router = useRouter()
const auth   = useAuthStore()

const API = 'http://localhost:3000/api'
const headers = computed(() => ({ Authorization: `Bearer ${auth.token}` }))

// ── Navegación ────────────────────────────────────
const seccionActiva = ref('resumen')
const navItems = [
  { id: 'resumen',  label: 'Resumen',   icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id: 'invertir', label: 'Invertir',  icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>` },
  { id: 'perfil',   label: 'Mi Perfil', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
]

// ── Datos ─────────────────────────────────────────
const config          = ref(null)
const misInversiones  = ref([])
const fincasDisponibles = ref([])
const fincaSeleccionada = ref(null)

// ── Formulario ────────────────────────────────────
const pasoActivo      = ref(1)
const montoInput      = ref('')
const montoNumerico   = ref(0)
const diasCiclo       = ref(120)
const cargandoFincas  = ref(false)
const cargandoInversion = ref(false)
const errorFincas     = ref('')
const errorInversion  = ref('')
const exitoInversion  = ref('')

const cabezasCalculadas = computed(() => {
  if (!config.value || !montoNumerico.value) return 0
  const costo = config.value.precio_kilo * config.value.peso_animal_kg
  return Math.floor(montoNumerico.value / costo)
})

// ── Stats resumen ─────────────────────────────────
const statsResumen = computed(() => [
  {
    icon:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    valor: formatCOP(misInversiones.value.reduce((a, i) => a + parseFloat(i.monto_cop), 0)),
    label: 'Total invertido'
  },
  {
    icon:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>`,
    valor: misInversiones.value.length > 0 ? '12% – 18%' : '—',
    label: 'Rendimiento estimado'
  },
  {
    icon:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
    valor: misInversiones.value.length,
    label: 'Inversiones activas'
  },
  {
    icon:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    valor: misInversiones.value.reduce((a, i) => a + i.cabezas, 0),
    label: 'Cabezas totales'
  },
])

// ── Funciones ─────────────────────────────────────
function formatCOP(val) {
  if (!val) return '$0'
  return '$' + Math.round(val).toLocaleString('es-CO')
}

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatearMonto(e) {
  const solo = e.target.value.replace(/\D/g, '')
  montoNumerico.value = parseInt(solo) || 0
  montoInput.value    = solo ? parseInt(solo).toLocaleString('es-CO') : ''
}

async function buscarFincas() {
  errorFincas.value   = ''
  cargandoFincas.value = true
  try {
    const { data } = await axios.get(`${API}/inversiones/fincas-disponibles`, {
      params:  { monto: montoNumerico.value },
      headers: headers.value
    })
    fincasDisponibles.value = data.fincas
    pasoActivo.value        = 2
  } catch (err) {
    errorFincas.value = err.response?.data?.error || 'Error buscando fincas'
  } finally {
    cargandoFincas.value = false
  }
}

async function confirmarInversion() {
  errorInversion.value  = ''
  exitoInversion.value  = ''
  cargandoInversion.value = true
  try {
    await axios.post(`${API}/inversiones`, {
      finca_id:  fincaSeleccionada.value.id,
      monto:     montoNumerico.value,
      dias_ciclo: diasCiclo.value
    }, { headers: headers.value })

    exitoInversion.value = '✓ Inversión creada exitosamente'
    await cargarMisInversiones()
    setTimeout(() => {
      seccionActiva.value = 'resumen'
      pasoActivo.value    = 1
      montoInput.value    = ''
      fincaSeleccionada.value = null
    }, 2000)
  } catch (err) {
    errorInversion.value = err.response?.data?.error || 'Error creando inversión'
  } finally {
    cargandoInversion.value = false
  }
}

async function cargarMisInversiones() {
  try {
    const { data } = await axios.get(`${API}/inversiones/mias`, { headers: headers.value })
    misInversiones.value = data
  } catch {}
}

async function cargarConfig() {
  try {
    const { data } = await axios.get(`${API}/inversiones/configuracion`)
    config.value = data
  } catch {}
}

async function cerrarSesion() {
  await auth.logout()
  router.push('/')
}

onMounted(async () => {
  await Promise.all([cargarConfig(), cargarMisInversiones()])
})
</script>

<style scoped>
.dashboard-root {
  --verde:    #1B4332;
  --verde-mid:#2D6A4F;
  --verde-cl: #D1FAE5;
  --dorado:   #D4A373;
  --crema:    #F5F0E8;
  --blanco:   #FFFFFF;
  --texto:    #111827;
  --muted:    #6B7280;
  --border:   #E5E7EB;

  display: flex; min-height: 100vh;
  background: #F0FDF4;
  font-family: 'Open Sans', sans-serif;
}

/* SIDEBAR */
.sidebar {
  width: 240px; flex-shrink: 0;
  background: var(--verde);
  display: flex; flex-direction: column;
  padding: 1.8rem 1.2rem;
  position: sticky; top: 0; height: 100vh;
}
.sidebar-logo { margin-bottom: 2.5rem; }
.logo-text {
  font-family: 'Anton', sans-serif;
  font-size: 1.1rem; letter-spacing: 0.16em;
  color: var(--dorado); display: block;
}
.logo-sub {
  font-size: 0.5rem; letter-spacing: 0.12em;
  color: rgba(255,255,255,0.5); text-transform: uppercase;
}
.sidebar-nav { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
.nav-item {
  all: unset; cursor: pointer;
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.7rem 0.9rem; border-radius: 10px;
  font-size: 0.85rem; color: rgba(255,255,255,0.7);
  transition: all 0.2s; -webkit-user-select: none; user-select: none;
}
.nav-item:hover  { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active { background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; }
.btn-logout {
  all: unset; cursor: pointer;
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.7rem 0.9rem; border-radius: 10px;
  font-size: 0.82rem; color: rgba(255,255,255,0.5);
  transition: all 0.2s;
}
.btn-logout:hover { color: #fff; background: rgba(255,0,0,0.15); }

/* MAIN */
.main-content { flex: 1; padding: 2rem; overflow-y: auto; }
.dash-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 2rem;
}
.dash-title {
  font-family: 'Anton', sans-serif;
  font-size: 1.6rem; font-weight: 400;
  color: var(--verde); letter-spacing: 0.02em;
}
.dash-sub { font-size: 0.82rem; color: var(--muted); margin-top: 0.2rem; }
.header-badge {
  display: flex; align-items: center; gap: 0.5rem;
  background: var(--verde-cl); color: var(--verde-mid);
  font-size: 0.75rem; font-weight: 600;
  padding: 0.4rem 1rem; border-radius: 100px;
}
.badge-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #16a34a;
  animation: pulso 2s ease-in-out infinite;
}
@keyframes pulso { 0%,100%{opacity:1}50%{opacity:0.4} }

/* Stats */
.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
  gap: 1rem; margin-bottom: 2rem;
}
.stat-card {
  background: var(--blanco); border-radius: 14px;
  padding: 1.2rem; display: flex; gap: 1rem; align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid var(--border);
}
.stat-icon { color: var(--verde); flex-shrink: 0; }
.stat-val  { font-family: 'Anton', sans-serif; font-size: 1.3rem; font-weight: 400; color: var(--verde); }
.stat-label { font-size: 0.72rem; color: var(--muted); margin-top: 0.1rem; }

/* Inversiones */
.section-title {
  font-family: 'Anton', sans-serif; font-size: 1.1rem;
  color: var(--verde); margin-bottom: 1rem; letter-spacing: 0.02em;
}
.inversiones-list { display: flex; flex-direction: column; gap: 1rem; }
.inversion-card {
  background: var(--blanco); border-radius: 14px; padding: 1.4rem;
  border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.inv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.inv-finca  { font-weight: 700; color: var(--texto); font-size: 0.95rem; }
.inv-fecha  { font-size: 0.75rem; color: var(--muted); margin-top: 0.2rem; }
.inv-badge  { font-size: 0.72rem; font-weight: 600; padding: 0.3rem 0.8rem; border-radius: 100px; }
.inv-badge.activa { background: #D1FAE5; color: #065F46; }
.inv-body   { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1rem; }
.inv-stat-val { font-weight: 700; color: var(--texto); font-size: 0.95rem; }
.inv-stat-val.green { color: #16a34a; }
.inv-stat-lbl { font-size: 0.7rem; color: var(--muted); margin-top: 0.2rem; }
.inv-progress-bar { height: 6px; background: #E5E7EB; border-radius: 100px; overflow: hidden; }
.inv-progress-fill { height: 100%; background: var(--verde); border-radius: 100px; transition: width 1s ease; }
.inv-progress-label { font-size: 0.72rem; color: var(--muted); margin-top: 0.4rem; }

/* Empty state */
.empty-state {
  text-align: center; padding: 3rem;
  background: var(--blanco); border-radius: 14px;
  border: 1px solid var(--border); color: var(--muted);
}
.empty-state p { margin-bottom: 1rem; }

/* Invertir */
.invertir-card {
  background: var(--blanco); border-radius: 16px; padding: 2rem;
  border: 1px solid var(--border); max-width: 600px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.paso-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.paso-title {
  font-family: 'Anton', sans-serif; font-size: 1.2rem;
  color: var(--verde); display: flex; align-items: center; gap: 0.6rem;
}
.paso-num {
  background: var(--verde); color: #fff;
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
}
.paso-desc { font-size: 0.85rem; color: var(--muted); margin-bottom: 1.5rem; line-height: 1.6; }

.monto-info {
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 1rem; margin-bottom: 1.5rem;
  background: #F0FDF4; border-radius: 10px; padding: 1rem;
}
.info-item { display: flex; flex-direction: column; gap: 0.2rem; }
.info-lbl { font-size: 0.7rem; color: var(--muted); }
.info-val { font-weight: 700; color: var(--texto); font-size: 0.9rem; }
.info-val.green { color: #16a34a; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.2rem; }
.form-group label { font-size: 0.78rem; font-weight: 600; color: var(--texto); }
.form-group input {
  all: unset; border: 1.5px solid var(--border); border-radius: 10px;
  padding: 0.75rem 0.9rem; font-size: 0.9rem; color: var(--texto);
  background: var(--blanco); transition: border-color 0.2s;
  width: 100%; box-sizing: border-box;
}
.form-group input:focus { border-color: var(--verde); }
.field-hint { font-size: 0.75rem; color: var(--verde-mid); margin-top: 0.3rem; }

/* Fincas grid */
.fincas-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.finca-card {
  background: var(--blanco); border-radius: 12px; padding: 1.2rem;
  border: 2px solid var(--border); cursor: pointer; transition: all 0.2s;
}
.finca-card:hover   { border-color: var(--verde-mid); }
.finca-card.selected { border-color: var(--verde); background: #F0FDF4; }
.finca-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
.finca-nombre { font-weight: 700; color: var(--verde); font-size: 0.9rem; }
.finca-stats  { display: flex; gap: 1rem; }
.finca-stat-val { font-weight: 700; color: var(--texto); font-size: 1rem; display: block; }
.finca-stat-lbl { font-size: 0.7rem; color: var(--muted); }

/* Resumen inversión */
.resumen-inversion {
  background: #F0FDF4; border-radius: 10px; padding: 1.2rem;
  margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.8rem;
}
.resumen-item { display: flex; justify-content: space-between; }
.resumen-lbl  { font-size: 0.8rem; color: var(--muted); }
.resumen-val  { font-size: 0.88rem; font-weight: 700; color: var(--texto); }
.resumen-val.green { color: #16a34a; }

/* Días opciones */
.dias-options { display: flex; gap: 0.6rem; }
.dias-btn {
  all: unset; cursor: pointer;
  padding: 0.6rem 1.2rem; border-radius: 100px;
  border: 1.5px solid var(--border);
  font-size: 0.85rem; color: var(--muted);
  transition: all 0.2s; -webkit-user-select: none; user-select: none;
}
.dias-btn.active { background: var(--verde); color: #fff; border-color: var(--verde); }

/* Rendimiento */
.rendimiento-est {
  background: linear-gradient(135deg, var(--verde), var(--verde-mid));
  color: #fff; border-radius: 12px; padding: 1.2rem;
  text-align: center; margin-bottom: 1.5rem;
}
.rend-label { font-size: 0.72rem; opacity: 0.8; margin-bottom: 0.3rem; }
.rend-val   { font-family: 'Anton', sans-serif; font-size: 2rem; letter-spacing: 0.04em; }
.rend-sub   { font-size: 0.72rem; opacity: 0.7; margin-top: 0.3rem; }

/* Botones */
.btn-primary {
  all: unset; cursor: pointer;
  background: var(--verde); color: #fff;
  font-size: 0.88rem; font-weight: 600;
  padding: 0.85rem 1.8rem; border-radius: 100px;
  display: inline-block; text-align: center;
  transition: opacity 0.2s, transform 0.2s;
  -webkit-user-select: none; user-select: none;
}
.btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-back {
  all: unset; cursor: pointer;
  font-size: 0.82rem; color: var(--muted);
  display: flex; align-items: center; gap: 0.3rem;
  transition: color 0.2s;
}
.btn-back:hover { color: var(--verde); }

/* Alertas */
.alert-error {
  display: flex; align-items: center; gap: 0.5rem;
  background: #fef2f2; color: #dc2626;
  border: 1px solid #fecaca; border-radius: 8px;
  padding: 0.7rem 0.9rem; font-size: 0.82rem; margin-top: 1rem;
}
.alert-success {
  background: #f0fdf4; color: #16a34a;
  border: 1px solid #bbf7d0; border-radius: 8px;
  padding: 0.7rem 0.9rem; font-size: 0.82rem; margin-top: 1rem;
}

/* Perfil */
.perfil-card {
  background: var(--blanco); border-radius: 16px; padding: 2rem; max-width: 500px;
  border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
}
.perfil-avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--verde); color: #fff;
  font-family: 'Anton', sans-serif; font-size: 1.6rem;
  display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem;
}
.perfil-nombre { font-family: 'Anton', sans-serif; font-size: 1.3rem; color: var(--verde); }
.perfil-rol    { font-size: 0.82rem; color: var(--muted); }
.perfil-info   { width: 100%; margin-top: 1rem; display: flex; flex-direction: column; gap: 0.8rem; }
.perfil-item   { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
.perfil-lbl    { font-size: 0.78rem; color: var(--muted); }
.perfil-val    { font-size: 0.82rem; font-weight: 600; color: var(--texto); }
.perfil-val.green { color: #16a34a; }

/* Responsive */
@media (max-width: 768px) {
  .dashboard-root { flex-direction: column; }
  .sidebar { width: 100%; height: auto; }
  .inv-body { grid-template-columns: repeat(2,1fr); }
  .monto-info { grid-template-columns: 1fr; }
}
</style>