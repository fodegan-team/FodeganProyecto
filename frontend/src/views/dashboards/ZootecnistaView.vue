<template>
  <div class="dashboard-root">

    <!-- ══ SIDEBAR ══ -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="sidebar-logo">
          <span class="logo-icon">🐄</span>
          <div class="logo-texts">
            <span class="logo-text">FODEGAN</span>
            <span class="logo-sub">ZOOTECNISTA</span>
          </div>
        </div>
      </div>

      <div class="sidebar-user">
        <div class="user-avatar">
          {{ auth.usuario?.nombre?.charAt(0) }}{{ auth.usuario?.apellido?.charAt(0) }}
        </div>
        <div class="user-info">
          <p class="user-name">{{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</p>
          <p class="user-rol">Zootecnista</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button v-for="item in navItems" :key="item.id"
          class="nav-item" :class="{ active: seccionActiva === item.id }"
          @click="seccionActiva = item.id; limpiarSeleccion()">
          <span class="nav-icon" v-html="item.icon" />
          <span class="nav-label">{{ item.label }}</span>
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

    <!-- ══ CONTENIDO ══ -->
    <main class="main-content">

      <!-- ══ MIS FINCAS ══ -->
      <section v-if="seccionActiva === 'fincas'" class="seccion">

        <!-- Vista: Lista de fincas -->
        <div v-if="!fincaSeleccionada">
          <div class="dash-header">
            <h1 class="dash-title">Mis Fincas</h1>
            <p class="dash-sub">Fincas bajo tu responsabilidad técnica</p>
          </div>

          <div class="empty-state" v-if="misFincas.length === 0">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="1.2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            <p class="empty-title">Sin fincas asignadas</p>
            <p class="empty-sub">El administrador aún no te ha asignado ninguna finca.</p>
          </div>

          <div class="fincas-grid" v-else>
            <div class="finca-card" v-for="finca in misFincas" :key="finca.id"
              @click="seleccionarFinca(finca)">
              <div class="finca-card-top">
                <div class="finca-icon-wrap">🌿</div>
                <span class="finca-estado-badge">{{ finca.inversiones_activas }} inversión(es) activa(s)</span>
              </div>
              <h3 class="finca-nombre">{{ finca.nombre_ficticio }}</h3>
              <p class="finca-real">{{ finca.nombre_real }}</p>
              <div class="finca-stats">
                <div class="finca-stat">
                  <span class="finca-stat-val">{{ finca.hectareas }} ha</span>
                  <span class="finca-stat-lbl">Hectáreas</span>
                </div>
                <div class="finca-stat">
                  <span class="finca-stat-val">{{ finca.capacidad_disponible }}/{{ finca.capacidad_total }}</span>
                  <span class="finca-stat-lbl">Disponible</span>
                </div>
                <div class="finca-stat">
                  <span class="finca-stat-val">{{ finca.propietario_nombre }}</span>
                  <span class="finca-stat-lbl">Propietario</span>
                </div>
              </div>
              <p class="finca-ver">Ver inversiones →</p>
            </div>
          </div>
        </div>

        <!-- Vista: Inversiones de la finca -->
        <div v-else-if="fincaSeleccionada && !inversionSeleccionada">
          <div class="dash-header">
            <button class="btn-back" @click="fincaSeleccionada = null">← Volver</button>
            <div>
              <h1 class="dash-title">{{ fincaSeleccionada.nombre_ficticio }}</h1>
              <p class="dash-sub">{{ fincaSeleccionada.nombre_real }} · Inversiones activas</p>
            </div>
          </div>

          <div class="empty-state" v-if="inversionesFinca.length === 0">
            <p class="empty-title">Sin inversiones activas</p>
            <p class="empty-sub">Esta finca no tiene inversiones activas en este momento.</p>
          </div>

          <div class="inversiones-list" v-else>
            <div class="inversion-row" v-for="inv in inversionesFinca" :key="inv.id"
              @click="seleccionarInversion(inv)">
              <div class="inv-row-left">
                <p class="inv-row-finca">{{ inv.nombre_ficticio }}</p>
                <p class="inv-row-fecha">Inicio: {{ formatFecha(inv.fecha_inicio_ciclo) }} · Fin: {{ formatFecha(inv.fecha_fin_ciclo) }}</p>
              </div>
              <div class="inv-row-stats">
                <div class="inv-row-stat">
                  <span class="inv-row-val">{{ inv.cantidad_animales }}</span>
                  <span class="inv-row-lbl">Animales</span>
                </div>
                <div class="inv-row-stat">
                  <span class="inv-row-val">{{ inv.dias_ciclo }}d</span>
                  <span class="inv-row-lbl">Ciclo</span>
                </div>
                <div class="inv-row-stat">
                  <span class="inv-row-val green">{{ Math.max(inv.dias_restantes, 0) }}d</span>
                  <span class="inv-row-lbl">Restantes</span>
                </div>
                <div class="inv-row-stat">
                  <span class="inv-row-val">{{ Math.min(inv.progreso || 0, 100) }}%</span>
                  <span class="inv-row-lbl">Progreso</span>
                </div>
              </div>
              <span class="inv-row-ver">Registrar datos →</span>
            </div>
          </div>
        </div>

        <!-- Vista: Animales de la inversión -->
        <div v-else-if="inversionSeleccionada">
          <div class="dash-header">
            <button class="btn-back" @click="inversionSeleccionada = null; animalesList = []">← Volver</button>
            <div>
              <h1 class="dash-title">Registro de Animales</h1>
              <p class="dash-sub">{{ fincaSeleccionada.nombre_ficticio }} · {{ inversionSeleccionada.cantidad_animales }} animales</p>
            </div>
          </div>

          <!-- Selector de mes -->
          <div class="mes-selector">
            <label class="mes-label">Mes a registrar:</label>
            <div class="mes-options">
              <button v-for="m in mesesDisponibles" :key="m"
                class="mes-btn" :class="{ active: mesActivo === m }"
                @click="mesActivo = m">
                Mes {{ m }}
              </button>
            </div>
          </div>

          <!-- Tabla de animales -->
          <div class="animales-tabla-wrap">
            <div class="animales-tabla-header">
              <span>Código</span>
              <span>Peso inicial</span>
              <span>Peso Mes {{ mesActivo }} (kg)</span>
              <span>Estado</span>
              <span>Acción</span>
            </div>

            <div class="animales-tabla-row" v-for="animal in animalesList" :key="animal.id">
              <span class="animal-cod">{{ animal.codigo }}</span>
              <span>{{ animal.peso_inicial }} kg</span>
              <div class="peso-input-wrap">
                <input
                  type="number"
                  :placeholder="animal.ultimo_peso || animal.peso_inicial"
                  v-model="pesosForm[animal.id]"
                  class="peso-input"
                  min="0"
                />
              </div>
              <div>
                <select v-model="estadosForm[animal.id]" class="estado-select">
                  <option value="buen_estado">Buen estado</option>
                  <option value="excelente">Excelente</option>
                  <option value="enfermo">Enfermo</option>
                  <option value="mal_estado">Mal estado</option>
                </select>
              </div>
              <button class="btn-guardar-animal"
                @click="guardarPeso(animal)"
                :disabled="!pesosForm[animal.id]">
                Guardar
              </button>
            </div>
          </div>

          <!-- Resumen seguimiento -->
          <div class="seguimiento-resumen" v-if="animalesList.some(a => a.ultimo_peso)">
            <h3 class="resumen-titulo">Último registro</h3>
            <div class="resumen-grid">
              <div class="resumen-item" v-for="animal in animalesList.filter(a => a.ultimo_peso)" :key="animal.id">
                <p class="resumen-cod">{{ animal.codigo }}</p>
                <p class="resumen-peso">{{ animal.ultimo_peso }} kg</p>
                <p class="resumen-ganancia green">+{{ (animal.ultimo_peso - animal.peso_inicial).toFixed(1) }} kg</p>
                <span class="estado-animal" :class="animal.ultimo_estado">
                  {{ animal.ultimo_estado?.replace('_', ' ') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Comentarios -->
          <div class="comentarios-section">
            <h3 class="comentarios-titulo">Comentarios al inversor</h3>
            <div class="comentario-form">
              <select v-model="comentarioAnimal" class="estado-select">
                <option value="">Comentario general</option>
                <option v-for="animal in animalesList" :key="animal.id" :value="animal.id">
                  {{ animal.codigo }}
                </option>
              </select>
              <textarea
                v-model="comentarioTexto"
                placeholder="Escribe un comentario para el inversor sobre el estado del ganado..."
                rows="3"
                class="comentario-textarea"
              />
              <button class="btn-primary" @click="enviarComentario" :disabled="!comentarioTexto.trim()">
                Enviar comentario
              </button>
            </div>

            <!-- Lista de comentarios -->
            <div class="comentarios-lista" v-if="comentariosList.length > 0">
              <div class="comentario-item" v-for="c in comentariosList" :key="c.id">
                <div class="comentario-header">
                  <span class="comentario-autor">{{ c.zootecnista_nombre }}</span>
                  <span class="comentario-fecha">{{ formatFecha(c.created_at) }}</span>
                </div>
                <p class="comentario-texto">{{ c.contenido }}</p>
              </div>
            </div>
          </div>

          <div class="alert-success" v-if="exitoRegistro">{{ exitoRegistro }}</div>
          <div class="alert-error"   v-if="errorRegistro">{{ errorRegistro }}</div>
        </div>

      </section>

      <!-- ══ HISTORIAL ══ -->
      <section v-if="seccionActiva === 'historial'" class="seccion">
        <div class="dash-header">
          <h1 class="dash-title">Historial de Fincas</h1>
          <p class="dash-sub">Inversiones finalizadas bajo tu responsabilidad</p>
        </div>

        <div class="empty-state" v-if="historial.length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="1.2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p class="empty-title">Sin historial</p>
          <p class="empty-sub">Aún no hay inversiones finalizadas en tus fincas.</p>
        </div>

        <div class="tabla-container" v-else>
          <table class="tabla">
            <thead>
              <tr>
                <th>Finca</th>
                <th>Inversor</th>
                <th>Animales</th>
                <th>Ciclo</th>
                <th>Inicio</th>
                <th>Fin</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historial" :key="h.id">
                <td>{{ h.nombre_ficticio }}</td>
                <td>{{ h.inversor_nombre }}</td>
                <td>{{ h.cantidad_animales }}</td>
                <td>{{ h.dias_ciclo }}d</td>
                <td>{{ formatFecha(h.fecha_inicio_ciclo) }}</td>
                <td>{{ formatFecha(h.fecha_fin_ciclo) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'

const router  = useRouter()
const auth    = useAuthStore()
const API     = 'http://localhost:3000/api'
const headers = computed(() => ({ Authorization: `Bearer ${auth.token}` }))

const seccionActiva = ref('fincas')
const navItems = [
  { id: 'fincas',    label: 'Mis Fincas', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { id: 'historial', label: 'Historial',  icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
]

// ── Datos ─────────────────────────────────────────
const misFincas          = ref([])
const inversionesFinca   = ref([])
const animalesList       = ref([])
const comentariosList    = ref([])
const historial          = ref([])

const fincaSeleccionada    = ref(null)
const inversionSeleccionada = ref(null)

const mesActivo       = ref(1)
const pesosForm       = reactive({})
const estadosForm     = reactive({})
const comentarioAnimal = ref('')
const comentarioTexto  = ref('')
const exitoRegistro   = ref('')
const errorRegistro   = ref('')

const mesesDisponibles = computed(() => {
  if (!inversionSeleccionada.value) return [1]
  const diasTranscurridos = Math.max(
    1,
    Math.ceil((new Date() - new Date(inversionSeleccionada.value.fecha_inicio_ciclo)) / (1000 * 60 * 60 * 24))
  )
  const meses = Math.ceil(diasTranscurridos / 30)
  return Array.from({ length: Math.max(meses, 1) }, (_, i) => i + 1)
})

// ── Funciones ─────────────────────────────────────
function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function limpiarSeleccion() {
  fincaSeleccionada.value     = null
  inversionSeleccionada.value = null
  animalesList.value          = []
  comentariosList.value       = []
}

async function cargarMisFincas() {
  try {
    const { data } = await axios.get(`${API}/zootecnista/fincas`, { headers: headers.value })
    misFincas.value = data
  } catch (err) {
    console.error('Error cargando fincas:', err)
  }
}

async function seleccionarFinca(finca) {
  fincaSeleccionada.value = finca
  try {
    const { data } = await axios.get(`${API}/zootecnista/fincas/${finca.id}/inversiones`, { headers: headers.value })
    inversionesFinca.value = data
  } catch (err) {
    console.error('Error cargando inversiones:', err)
  }
}

async function seleccionarInversion(inv) {
  inversionSeleccionada.value = inv
  try {
    const [animalesRes, comentariosRes] = await Promise.all([
      axios.get(`${API}/zootecnista/inversiones/${inv.id}/animales`, { headers: headers.value }),
      axios.get(`${API}/zootecnista/comentarios/${inv.id}`, { headers: headers.value })
    ])
    animalesList.value    = animalesRes.data
    comentariosList.value = comentariosRes.data

    // Inicializar formularios
    animalesList.value.forEach(animal => {
      pesosForm[animal.id]   = ''
      estadosForm[animal.id] = animal.ultimo_estado || 'buen_estado'
    })
  } catch (err) {
    console.error('Error cargando animales:', err)
  }
}

async function guardarPeso(animal) {
  exitoRegistro.value = ''
  errorRegistro.value = ''
  try {
    await axios.post(`${API}/zootecnista/peso`, {
      animal_id:    animal.id,
      inversion_id: inversionSeleccionada.value.id,
      mes_numero:   mesActivo.value,
      peso_kg:      pesosForm[animal.id],
      estado:       estadosForm[animal.id]
    }, { headers: headers.value })

    exitoRegistro.value = `✓ Peso de ${animal.codigo} registrado en Mes ${mesActivo.value}`
    pesosForm[animal.id] = ''

    // Recargar animales
    const { data } = await axios.get(
      `${API}/zootecnista/inversiones/${inversionSeleccionada.value.id}/animales`,
      { headers: headers.value }
    )
    animalesList.value = data

    setTimeout(() => { exitoRegistro.value = '' }, 3000)
  } catch (err) {
    errorRegistro.value = err.response?.data?.error || 'Error registrando peso'
  }
}

async function enviarComentario() {
  try {
    await axios.post(`${API}/zootecnista/comentario`, {
      inversion_id: inversionSeleccionada.value.id,
      animal_id:    comentarioAnimal.value || null,
      contenido:    comentarioTexto.value
    }, { headers: headers.value })

    comentarioTexto.value  = ''
    comentarioAnimal.value = ''
    exitoRegistro.value    = '✓ Comentario enviado al inversor'

    // Recargar comentarios
    const { data } = await axios.get(
      `${API}/zootecnista/comentarios/${inversionSeleccionada.value.id}`,
      { headers: headers.value }
    )
    comentariosList.value = data
    setTimeout(() => { exitoRegistro.value = '' }, 3000)
  } catch (err) {
    errorRegistro.value = err.response?.data?.error || 'Error enviando comentario'
  }
}

async function cargarHistorial() {
  try {
    const { data } = await axios.get(`${API}/zootecnista/historial`, { headers: headers.value })
    historial.value = data
  } catch {}
}

async function cerrarSesion() {
  await auth.logout()
  router.push('/')
}

onMounted(() => {
  cargarMisFincas()
  cargarHistorial()
})
</script>

<style scoped>
.dashboard-root {
  --azul:     #0C4A6E;
  --azul-mid: #0369A1;
  --azul-cl:  #E0F2FE;
  --dorado:   #D4A373;
  --blanco:   #FFFFFF;
  --texto:    #111827;
  --muted:    #6B7280;
  --border:   #E5E7EB;
  --bg:       #F0F9FF;

  display: flex; min-height: 100vh;
  background: var(--bg);
  font-family: 'Open Sans', sans-serif;
}

/* SIDEBAR */
.sidebar {
  width: 240px; flex-shrink: 0;
  background: var(--azul);
  display: flex; flex-direction: column;
  padding: 1.4rem 1rem;
  position: sticky; top: 0; height: 100vh;
  box-shadow: 4px 0 24px rgba(0,0,0,0.15);
}
.sidebar-top { margin-bottom: 1.5rem; }
.sidebar-logo { display: flex; align-items: center; gap: 0.6rem; }
.logo-icon { font-size: 1.6rem; }
.logo-text {
  font-family: 'Anton', sans-serif;
  font-size: 0.95rem; letter-spacing: 0.16em;
  color: var(--dorado); display: block; line-height: 1;
}
.logo-sub {
  font-size: 0.5rem; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.4); text-transform: uppercase;
}
.sidebar-user {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.8rem; border-radius: 12px;
  background: rgba(255,255,255,0.08); margin-bottom: 1.2rem;
}
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--dorado); color: #fff;
  font-family: 'Anton', sans-serif; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.user-name { font-size: 0.78rem; font-weight: 600; color: #fff; }
.user-rol  { font-size: 0.65rem; color: rgba(255,255,255,0.5); }

.sidebar-nav { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; }
.nav-item {
  all: unset; cursor: pointer;
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.65rem 0.8rem; border-radius: 10px;
  font-size: 0.83rem; color: rgba(255,255,255,0.65);
  transition: all 0.2s; -webkit-user-select: none; user-select: none;
}
.nav-item:hover  { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active { background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; }
.nav-icon { flex-shrink: 0; display: flex; }
.btn-logout {
  all: unset; cursor: pointer;
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.65rem 0.8rem; border-radius: 10px;
  font-size: 0.82rem; color: rgba(255,255,255,0.4); transition: all 0.2s;
}
.btn-logout:hover { color: #fff; background: rgba(220,38,38,0.2); }

/* MAIN */
.main-content { flex: 1; overflow-y: auto; }
.seccion { padding: 2rem; }
.dash-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
.dash-title {
  font-family: 'Anton', sans-serif; font-size: 1.5rem;
  color: var(--azul); letter-spacing: 0.02em;
}
.dash-sub { font-size: 0.82rem; color: var(--muted); margin-top: 0.2rem; }
.btn-back {
  all: unset; cursor: pointer; font-size: 0.85rem;
  color: var(--muted); transition: color 0.2s; flex-shrink: 0;
}
.btn-back:hover { color: var(--azul); }

/* Empty state */
.empty-state {
  text-align: center; padding: 3rem 2rem;
  background: var(--blanco); border-radius: 16px;
  border: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
}
.empty-title { font-family: 'Anton', sans-serif; font-size: 1rem; color: #9CA3AF; }
.empty-sub   { font-size: 0.82rem; color: #D1D5DB; }

/* Fincas grid */
.fincas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 1rem; }
.finca-card {
  background: var(--blanco); border-radius: 16px; padding: 1.4rem;
  border: 1px solid var(--border); cursor: pointer; transition: all 0.2s;
}
.finca-card:hover { border-color: var(--azul-mid); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.finca-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
.finca-icon-wrap { font-size: 1.8rem; }
.finca-estado-badge {
  font-size: 0.68rem; font-weight: 600;
  background: var(--azul-cl); color: var(--azul-mid);
  padding: 0.25rem 0.7rem; border-radius: 100px;
}
.finca-nombre { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--azul); margin-bottom: 0.2rem; }
.finca-real   { font-size: 0.78rem; color: var(--muted); margin-bottom: 1rem; }
.finca-stats  { display: flex; gap: 1.2rem; margin-bottom: 0.8rem; }
.finca-stat-val { font-weight: 700; color: var(--texto); font-size: 0.9rem; display: block; }
.finca-stat-lbl { font-size: 0.68rem; color: var(--muted); }
.finca-ver { font-size: 0.75rem; color: var(--azul-mid); font-weight: 600; }

/* Inversiones list */
.inversiones-list { display: flex; flex-direction: column; gap: 0.8rem; }
.inversion-row {
  background: var(--blanco); border-radius: 12px; padding: 1.1rem 1.4rem;
  border: 1px solid var(--border); display: flex; align-items: center;
  gap: 1.5rem; cursor: pointer; transition: all 0.2s;
}
.inversion-row:hover { border-color: var(--azul-mid); transform: translateY(-1px); }
.inv-row-left { flex: 1; }
.inv-row-finca { font-weight: 700; color: var(--azul); font-size: 0.9rem; }
.inv-row-fecha { font-size: 0.72rem; color: var(--muted); margin-top: 0.2rem; }
.inv-row-stats { display: flex; gap: 1.5rem; }
.inv-row-val { font-weight: 700; color: var(--texto); font-size: 0.9rem; display: block; }
.inv-row-val.green { color: #16a34a; }
.inv-row-lbl { font-size: 0.68rem; color: var(--muted); }
.inv-row-ver { font-size: 0.75rem; color: var(--azul-mid); font-weight: 600; flex-shrink: 0; }

/* Mes selector */
.mes-selector { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.mes-label    { font-size: 0.78rem; font-weight: 600; color: var(--texto); }
.mes-options  { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.mes-btn {
  all: unset; cursor: pointer;
  padding: 0.4rem 1rem; border-radius: 100px;
  border: 1.5px solid var(--border); font-size: 0.78rem;
  color: var(--muted); transition: all 0.2s;
  -webkit-user-select: none; user-select: none;
}
.mes-btn.active { background: var(--azul); color: #fff; border-color: var(--azul); }

/* Tabla animales */
.animales-tabla-wrap {
  background: var(--blanco); border-radius: 14px;
  border: 1px solid var(--border); overflow: hidden; margin-bottom: 1.5rem;
}
.animales-tabla-header, .animales-tabla-row {
  display: grid; grid-template-columns: 100px 120px 1fr 1fr 100px;
  gap: 1rem; padding: 0.8rem 1.2rem; align-items: center; font-size: 0.82rem;
}
.animales-tabla-header {
  background: #F8FAFC; font-weight: 700; color: var(--muted);
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em;
  border-bottom: 1px solid var(--border);
}
.animales-tabla-row { border-bottom: 1px solid #F3F4F6; }
.animales-tabla-row:last-child { border-bottom: none; }
.animales-tabla-row:hover { background: #F9FAFB; }
.animal-cod { font-weight: 700; color: var(--azul); font-family: monospace; }

.peso-input {
  all: unset; border: 1.5px solid var(--border); border-radius: 8px;
  padding: 0.5rem 0.7rem; font-size: 0.85rem; color: var(--texto);
  width: 100%; box-sizing: border-box; transition: border-color 0.2s;
}
.peso-input:focus { border-color: var(--azul); }

.estado-select {
  all: unset; border: 1.5px solid var(--border); border-radius: 8px;
  padding: 0.5rem 0.7rem; font-size: 0.82rem; color: var(--texto);
  width: 100%; box-sizing: border-box; background: var(--blanco);
  cursor: pointer;
}

.btn-guardar-animal {
  all: unset; cursor: pointer;
  background: var(--azul); color: #fff;
  font-size: 0.72rem; font-weight: 600;
  padding: 0.4rem 0.9rem; border-radius: 6px;
  transition: opacity 0.2s; -webkit-user-select: none; user-select: none;
}
.btn-guardar-animal:hover:not(:disabled) { opacity: 0.85; }
.btn-guardar-animal:disabled { opacity: 0.4; cursor: not-allowed; }

/* Resumen seguimiento */
.seguimiento-resumen {
  background: var(--blanco); border-radius: 14px; padding: 1.2rem;
  border: 1px solid var(--border); margin-bottom: 1.5rem;
}
.resumen-titulo { font-family: 'Anton', sans-serif; font-size: 0.95rem; color: var(--azul); margin-bottom: 1rem; }
.resumen-grid   { display: flex; gap: 1rem; flex-wrap: wrap; }
.resumen-item   { background: var(--azul-cl); border-radius: 10px; padding: 0.8rem 1rem; text-align: center; }
.resumen-cod    { font-family: monospace; font-weight: 700; color: var(--azul); font-size: 0.82rem; }
.resumen-peso   { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--texto); }
.resumen-ganancia { font-size: 0.75rem; font-weight: 700; }
.green { color: #16a34a; }

.estado-animal {
  font-size: 0.7rem; font-weight: 600;
  padding: 0.2rem 0.6rem; border-radius: 100px; display: inline-block;
}
.estado-animal.buen_estado { background: #D1FAE5; color: #065F46; }
.estado-animal.excelente   { background: #DBEAFE; color: #1E40AF; }
.estado-animal.enfermo     { background: #FEF3C7; color: #92400E; }
.estado-animal.mal_estado  { background: #FEE2E2; color: #991B1B; }

/* Comentarios */
.comentarios-section { background: var(--blanco); border-radius: 14px; padding: 1.4rem; border: 1px solid var(--border); margin-bottom: 1.5rem; }
.comentarios-titulo  { font-family: 'Anton', sans-serif; font-size: 0.95rem; color: var(--azul); margin-bottom: 1rem; }
.comentario-form     { display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.2rem; }
.comentario-textarea {
  all: unset; border: 1.5px solid var(--border); border-radius: 10px;
  padding: 0.8rem; font-size: 0.85rem; color: var(--texto);
  width: 100%; box-sizing: border-box; font-family: 'Open Sans', sans-serif;
  resize: vertical; min-height: 80px; transition: border-color 0.2s;
}
.comentario-textarea:focus { border-color: var(--azul); }

.comentarios-lista  { display: flex; flex-direction: column; gap: 0.8rem; }
.comentario-item    { background: #F0F9FF; border-radius: 10px; padding: 0.9rem; border-left: 3px solid var(--azul-mid); }
.comentario-header  { display: flex; justify-content: space-between; margin-bottom: 0.4rem; }
.comentario-autor   { font-size: 0.75rem; font-weight: 700; color: var(--azul); }
.comentario-fecha   { font-size: 0.7rem; color: var(--muted); }
.comentario-texto   { font-size: 0.82rem; color: var(--texto); line-height: 1.6; }

/* Tabla historial */
.tabla-container { overflow-x: auto; border-radius: 14px; border: 1px solid var(--border); }
.tabla { width: 100%; border-collapse: collapse; background: var(--blanco); font-size: 0.82rem; }
.tabla thead tr { background: #F8FAFC; }
.tabla th { padding: 0.9rem 1rem; text-align: left; font-size: 0.72rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--border); }
.tabla td { padding: 0.9rem 1rem; border-bottom: 1px solid #F3F4F6; }
.tabla tbody tr:last-child td { border-bottom: none; }

/* Botones */
.btn-primary {
  all: unset; cursor: pointer;
  background: var(--azul); color: #fff;
  font-size: 0.88rem; font-weight: 600;
  padding: 0.75rem 1.5rem; border-radius: 100px;
  display: inline-block; transition: opacity 0.2s;
  -webkit-user-select: none; user-select: none;
}
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Alertas */
.alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0.7rem 0.9rem; font-size: 0.82rem; margin-top: 1rem; }
.alert-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; padding: 0.7rem 0.9rem; font-size: 0.82rem; margin-top: 1rem; }
</style>