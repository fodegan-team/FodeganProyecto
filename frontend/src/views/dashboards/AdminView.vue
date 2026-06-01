<template>
  <div class="dashboard-root">

    <!-- ══ SIDEBAR ══ -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="sidebar-logo">
          <span class="logo-icon">🐄</span>
          <div class="logo-texts">
            <span class="logo-text">FODEGAN</span>
            <span class="logo-sub">ADMINISTRADOR</span>
          </div>
        </div>
      </div>

      <div class="sidebar-user">
        <div class="user-avatar">AD</div>
        <div class="user-info">
          <p class="user-name">{{ auth.usuario?.nombre }}</p>
          <p class="user-rol">Administrador</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button v-for="item in navItems" :key="item.id"
          class="nav-item" :class="{ active: seccionActiva === item.id }"
          @click="seccionActiva = item.id">
          <span class="nav-icon" v-html="item.icon" />
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-badge" v-if="item.badge > 0">{{ item.badge }}</span>
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

      <!-- ══ RESUMEN ══ -->
      <section v-if="seccionActiva === 'resumen'" class="seccion">
        <div class="dash-header">
          <div>
            <h1 class="dash-title">Panel de Administración</h1>
            <p class="dash-sub">Control total de la plataforma FODEGAN</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card" v-for="s in statsResumen" :key="s.label">
            <div class="stat-icon" v-html="s.icon" />
            <div>
              <p class="stat-val">{{ s.valor }}</p>
              <p class="stat-lbl">{{ s.label }}</p>
            </div>
          </div>
        </div>

        <!-- Alertas pendientes -->
        <div class="alertas-section">
          <h3 class="section-title">⚡ Requieren atención</h3>
          <div class="alertas-grid">

            <div class="alerta-card" v-if="fincasPendientes.length > 0" @click="seccionActiva = 'fincas'">
              <div class="alerta-icon naranja">🏡</div>
              <div>
                <p class="alerta-titulo">Fincas pendientes</p>
                <p class="alerta-sub">{{ fincasPendientes.length }} finca(s) esperando aprobación</p>
              </div>
              <span class="alerta-badge naranja">{{ fincasPendientes.length }}</span>
            </div>

            <div class="alerta-card" v-if="inversionesPendientes.length > 0" @click="seccionActiva = 'inversiones'">
              <div class="alerta-icon verde">📋</div>
              <div>
                <p class="alerta-titulo">Inversiones pendientes</p>
                <p class="alerta-sub">{{ inversionesPendientes.length }} inversión(es) esperando reunión</p>
              </div>
              <span class="alerta-badge verde">{{ inversionesPendientes.length }}</span>
            </div>

            <div class="alerta-card" v-if="usuariosPendientes.length > 0" @click="seccionActiva = 'usuarios'">
              <div class="alerta-icon azul">👤</div>
              <div>
                <p class="alerta-titulo">Usuarios pendientes</p>
                <p class="alerta-sub">{{ usuariosPendientes.length }} usuario(s) esperando aprobación</p>
              </div>
              <span class="alerta-badge azul">{{ usuariosPendientes.length }}</span>
            </div>

            <div class="alerta-card vacia" v-if="fincasPendientes.length === 0 && inversionesPendientes.length === 0 && usuariosPendientes.length === 0">
              <div class="alerta-icon verde">✅</div>
              <div>
                <p class="alerta-titulo">Todo al día</p>
                <p class="alerta-sub">No hay elementos pendientes de revisión</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ══ FINCAS ══ -->
      <section v-if="seccionActiva === 'fincas'" class="seccion">
        <div class="section-header">
          <h2 class="section-title">Gestión de Fincas</h2>
        </div>

        <div class="tabs-filter">
          <button v-for="t in ['todas','pendiente','aprobada','rechazada']" :key="t"
            class="tab-filter" :class="{ active: filtroFincas === t }"
            @click="filtroFincas = t">
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
            <span v-if="t === 'pendiente' && fincasPendientes.length > 0" class="tab-badge">
              {{ fincasPendientes.length }}
            </span>
          </button>
        </div>

        <div class="tabla-container">
          <table class="tabla">
            <thead>
              <tr>
                <th>Propietario</th>
                <th>Finca</th>
                <th>Ubicación</th>
                <th>Hectáreas</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
              <tbody>
                <tr v-for="finca in fincasFiltradas" :key="finca.id">
                  <td>
                    <p class="td-nombre">{{ finca.nombre }} {{ finca.apellido }}</p>
                    <p class="td-email">{{ finca.email }}</p>
                  </td>
                  <td>
                    <p class="td-nombre">{{ finca.nombre_real }}</p>
                    <p class="td-email">{{ finca.nombre_ficticio }}</p>
                  </td>
                  <td>{{ finca.ubicacion }}</td>
                  <td>{{ finca.hectareas }} ha</td>
                  <td>{{ finca.capacidad_disponible }} / {{ finca.capacidad_total }}</td>
                  <td>
                    <span class="estado-badge" :class="finca.estado">{{ finca.estado }}</span>
                  </td>
                  <td>
                    <div class="acciones" v-if="finca.estado === 'pendiente'">
                      <button class="btn-aprobar" @click="aprobarFinca(finca.id)">✓ Aprobar</button>
                      <button class="btn-rechazar" @click="abrirRechazarFinca(finca)">✗ Rechazar</button>
                    </div>
                    <span v-else class="td-email">—</span>
                  </td>
                </tr>
              </tbody>
          </table>
        </div>
      </section>

      <!-- ══ INVERSIONES ══ -->
      <section v-if="seccionActiva === 'inversiones'" class="seccion">
        <div class="section-header">
          <h2 class="section-title">Gestión de Inversiones</h2>
        </div>

        <div class="tabs-filter">
          <button v-for="t in ['todas','pendiente_reunion','activa','finalizada','cancelada']" :key="t"
            class="tab-filter" :class="{ active: filtroInversiones === t }"
            @click="filtroInversiones = t">
            {{ t === 'pendiente_reunion' ? 'Pendiente reunión' : t.charAt(0).toUpperCase() + t.slice(1) }}
            <span v-if="t === 'pendiente_reunion' && inversionesPendientes.length > 0" class="tab-badge">
              {{ inversionesPendientes.length }}
            </span>
          </button>
        </div>

        <div class="tabla-container">
          <table class="tabla">
            <thead>
              <tr>
                <th>Inversor</th>
                <th>Finca</th>
                <th>Monto</th>
                <th>Animales</th>
                <th>Ciclo</th>
                <th>Rendimiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
              <tbody>
                <template v-for="inv in inversionesFiltradas" :key="inv.id">
                  <tr>
                    <td>
                      <p class="td-nombre">{{ inv.inversor_nombre }}</p>
                      <p class="td-email">{{ inv.inversor_email }}</p>
                    </td>
                    <td>{{ inv.nombre_ficticio }}</td>
                    <td>{{ formatCOP(inv.monto_cop) }}</td>
                    <td>{{ inv.cantidad_animales }}</td>
                    <td>{{ inv.dias_ciclo }}d</td>
                    <td class="green">{{ inv.rendimiento_pct }}%</td>
                    <td>
                      <span class="estado-badge" :class="inv.estado">
                        {{ inv.estado === 'pendiente_reunion' ? 'Pendiente' : inv.estado }}
                      </span>
                    </td>
                    <td>
                      <div class="acciones">
                        <button class="btn-ver-animales"
                          v-if="inv.estado === 'activa'"
                          @click="verAnimales(inv)">
                          {{ inversionExpandida?.id === inv.id ? '▲ Ocultar' : '▼ Animales' }}
                        </button>
                        <button class="btn-aprobar" v-if="inv.estado === 'pendiente_reunion'" @click="aprobarInversion(inv.id)">✓ Aprobar</button>
                        <button class="btn-rechazar" v-if="inv.estado === 'pendiente_reunion'" @click="abrirRechazarInversion(inv)">✗ Rechazar</button>
                        <button class="btn-finalizar" v-if="inv.estado === 'activa'" @click="finalizarInversion(inv.id)">⏹ Finalizar</button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="inversionExpandida?.id === inv.id" class="fila-expandida">
                    <td colspan="8">
                      <div class="animales-expand" v-if="cargandoAnimales">Cargando animales...</div>
                      <div class="animales-expand" v-else>
                        <p class="animales-titulo">Registro de animales — {{ inv.nombre_ficticio }}</p>
                        <div class="animales-tabla-mini">
                          <div class="animales-header-mini">
                            <span>Código</span>
                            <span>Peso inicial</span>
                            <span>Estado actual</span>
                            <span>Registros</span>
                          </div>
                          <div class="animales-row-mini" v-for="animal in animalesInversion" :key="animal.id">
                            <span class="animal-codigo">{{ animal.codigo }}</span>
                            <span>{{ animal.peso_inicial }} kg</span>
                            <span>
                              <span class="estado-animal" :class="animal.estado_actual">
                                {{ animal.estado_actual?.replace('_', ' ') }}
                              </span>
                            </span>
                            <span>{{ animal.registros || 0 }} reportes</span>
                          </div>
                          <p class="sin-animales" v-if="animalesInversion.length === 0">
                            No hay animales registrados aún.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
          </table>
        </div>
      </section>

      <!-- ══ USUARIOS ══ -->
      <section v-if="seccionActiva === 'usuarios'" class="seccion">
        <div class="section-header">
          <h2 class="section-title">Gestión de Usuarios</h2>
        </div>

        <div class="tabs-filter">
          <button v-for="t in ['todos','inversionista','propietario','zootecnista']" :key="t"
            class="tab-filter" :class="{ active: filtroUsuarios === t }"
            @click="filtroUsuarios = t">
            {{ t.charAt(0).toUpperCase() + t.slice(1) }}
          </button>
        </div>

        <div class="tabla-container">
          <table class="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usuariosFiltrados" :key="u.id">
                <td>
                  <p class="td-nombre">{{ u.nombre }} {{ u.apellido }}</p>
                  <p class="td-email">{{ u.cedula ? 'CC: ' + u.cedula : '' }}</p>
                </td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="rol-badge" :class="u.rol">{{ u.rol }}</span>
                </td>
                <td>{{ u.ciudad || '—' }}</td>
                <td>
                  <span class="estado-badge" :class="u.aprobado ? 'aprobada' : 'pendiente'">
                    {{ u.aprobado ? 'Aprobado' : 'Pendiente' }}
                  </span>
                </td>
                <td>
                  <div class="acciones" v-if="!u.aprobado && u.rol !== 'inversionista'">
                    <button class="btn-aprobar" @click="aprobarUsuario(u)">✓ Aprobar</button>
                  </div>
                  <span v-else class="td-email">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ══ ZOOTECNISTAS ══ -->
      <section v-if="seccionActiva === 'zootecnistas'" class="seccion">
        <div class="section-header">
          <h2 class="section-title">Zootecnistas y sus Fincas</h2>
        </div>

        <div class="zoo-grid">
          <div class="zoo-card" v-for="zoo in zootecnistas" :key="zoo.id">
            <div class="zoo-header">
              <div class="zoo-avatar">
                {{ zoo.nombre.charAt(0) }}{{ zoo.apellido.charAt(0) }}
              </div>
              <div>
                <p class="zoo-nombre">{{ zoo.nombre }} {{ zoo.apellido }}</p>
                <p class="zoo-email">{{ zoo.email }}</p>
              </div>
              <span class="estado-badge" :class="zoo.aprobado ? 'aprobada' : 'pendiente'">
                {{ zoo.aprobado ? 'Activo' : 'Pendiente' }}
              </span>
            </div>
            <div class="zoo-fincas" v-if="zoo.fincas && zoo.fincas.length > 0">
              <p class="zoo-fincas-titulo">Fincas asignadas:</p>
              <div class="zoo-finca-tag" v-for="f in zoo.fincas" :key="f.id">
                🌿 {{ f.nombre_ficticio }} — {{ f.nombre_real }}
              </div>
            </div>
            <p class="zoo-sin-fincas" v-else>Sin fincas asignadas</p>
          </div>
        </div>
      </section>


      <!-- ══ CONFIGURACIÓN ══ -->
      <section v-if="seccionActiva === 'config'" class="seccion">
        <div class="section-header">
          <h2 class="section-title">Configuración del Sistema</h2>
        </div>

        <div class="config-card" v-if="config">
          <h3 class="config-titulo">Parámetros del mercado ganadero</h3>
          <p class="config-sub">Estos valores afectan directamente el cálculo de inversiones y rentabilidad.</p>

          <div class="config-form">
            <div class="form-group">
              <label>Precio del kilo (COP)</label>
              <input v-model="configForm.precio_kilo" type="number" placeholder="Ej: 9600" />
              <p class="field-hint">Precio actual por kilo de ganado en pie</p>
            </div>
            <div class="form-group">
              <label>Peso del animal (kg)</label>
              <input v-model="configForm.peso_animal_kg" type="number" placeholder="Ej: 450" />
              <p class="field-hint">Peso promedio del animal al momento de la inversión</p>
            </div>
          </div>

          <div class="config-preview">
            <p class="preview-label">Con estos valores:</p>
            <div class="preview-grid">
              <div class="preview-item">
                <span class="preview-val">{{ formatCOP(configForm.precio_kilo * configForm.peso_animal_kg) }}</span>
                <span class="preview-lbl">Costo por animal</span>
              </div>
              <div class="preview-item">
                <span class="preview-val">120d → 12%</span>
                <span class="preview-lbl">Ciclo corto</span>
              </div>
              <div class="preview-item">
                <span class="preview-val">150d → 15%</span>
                <span class="preview-lbl">Ciclo medio</span>
              </div>
              <div class="preview-item">
                <span class="preview-val">180d → 18%</span>
                <span class="preview-lbl">Ciclo largo</span>
              </div>
            </div>
          </div>

          <div class="alert-success" v-if="configExito">{{ configExito }}</div>
          <div class="alert-error"   v-if="configError">{{ configError }}</div>

          <button class="btn-primary" @click="guardarConfig" :disabled="guardandoConfig">
            {{ guardandoConfig ? 'Guardando...' : 'Guardar configuración' }}
          </button>
        </div>
      </section>

    </main>

    <!-- ══ MODAL RECHAZAR FINCA ══ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modalRechazarFinca" @click.self="modalRechazarFinca = false">
        <div class="modal-card">
          <h3 class="modal-titulo">Rechazar finca</h3>
          <p class="modal-sub">Indica el motivo del rechazo. Se enviará un correo al propietario.</p>
          <div class="form-group">
            <label>Motivo del rechazo</label>
            <textarea v-model="motivoRechazo" rows="4" placeholder="Describe los filtros que no pasó..."></textarea>
          </div>
          <div class="modal-btns">
            <button class="btn-secondary" @click="modalRechazarFinca = false">Cancelar</button>
            <button class="btn-rechazar-modal" @click="confirmarRechazarFinca">Confirmar rechazo</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ MODAL RECHAZAR INVERSIÓN ══ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modalRechazarInversion" @click.self="modalRechazarInversion = false">
        <div class="modal-card">
          <h3 class="modal-titulo">Rechazar inversión</h3>
          <p class="modal-sub">Indica el motivo. Se enviará un correo al inversor.</p>
          <div class="form-group">
            <label>Motivo del rechazo</label>
            <textarea v-model="motivoRechazoInversion" rows="4" placeholder="Describe el motivo..."></textarea>
          </div>
          <div class="modal-btns">
            <button class="btn-secondary" @click="modalRechazarInversion = false">Cancelar</button>
            <button class="btn-rechazar-modal" @click="confirmarRechazarInversion">Confirmar rechazo</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'

const router = useRouter()
const auth   = useAuthStore()
const API    = 'http://localhost:3000/api'
const headers = computed(() => ({ Authorization: `Bearer ${auth.token}` }))

const seccionActiva = ref('resumen')

// ── Nav items ─────────────────────────────────────
const navItems = computed(() => [
  { id: 'resumen',    label: 'Resumen',      badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id: 'fincas',     label: 'Fincas',       badge: fincasPendientes.value.length, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { id: 'inversiones',label: 'Inversiones',  badge: inversionesPendientes.value.length, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>` },
  { id: 'usuarios',   label: 'Usuarios',     badge: usuariosPendientes.value.length, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { id: 'config',     label: 'Configuración',badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>` },
  { id: 'zootecnistas', label: 'Zootecnistas', badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
])

// ── Datos ─────────────────────────────────────────
const todasFincas      = ref([])
const todasInversiones = ref([])
const todosUsuarios    = ref([])
const zootecnistas     = ref([])
const config           = ref(null)

const filtroFincas      = ref('todas')
const filtroInversiones = ref('todas')
const filtroUsuarios    = ref('todos')

const fincasPendientes     = computed(() => todasFincas.value.filter(f => f.estado === 'pendiente'))
const inversionesPendientes = computed(() => todasInversiones.value.filter(i => i.estado === 'pendiente_reunion'))
const usuariosPendientes    = computed(() => todosUsuarios.value.filter(u => !u.aprobado && u.rol !== 'inversionista' && u.rol !== 'administrador'))

const fincasFiltradas = computed(() =>
  filtroFincas.value === 'todas' ? todasFincas.value : todasFincas.value.filter(f => f.estado === filtroFincas.value)
)
const inversionesFiltradas = computed(() =>
  filtroInversiones.value === 'todas' ? todasInversiones.value : todasInversiones.value.filter(i => i.estado === filtroInversiones.value)
)
const usuariosFiltrados = computed(() =>
  filtroUsuarios.value === 'todos' ? todosUsuarios.value.filter(u => u.rol !== 'administrador') : todosUsuarios.value.filter(u => u.rol === filtroUsuarios.value)
)

const statsResumen = computed(() => [
  { icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`, valor: todosUsuarios.value.filter(u => u.rol !== 'administrador').length, label: 'Usuarios totales' },
  { icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`, valor: todasFincas.value.filter(f => f.estado === 'aprobada').length, label: 'Fincas activas' },
  { icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>`, valor: todasInversiones.value.filter(i => i.estado === 'activa').length, label: 'Inversiones activas' },
  { icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`, valor: formatCOP(todasInversiones.value.filter(i => i.estado === 'activa').reduce((a,i) => a + parseFloat(i.monto_cop||0), 0)), label: 'Capital activo' },
])

// ── Config ────────────────────────────────────────
const configForm     = reactive({ precio_kilo: 0, peso_animal_kg: 0 })
const configExito    = ref('')
const configError    = ref('')
const guardandoConfig = ref(false)

// ── Modales ───────────────────────────────────────
const modalRechazarFinca      = ref(false)
const modalRechazarInversion  = ref(false)
const motivoRechazo           = ref('')
const motivoRechazoInversion  = ref('')
const fincaArechazar          = ref(null)
const inversionArechazar      = ref(null)
const inversionExpandida = ref(null)
const animalesInversion  = ref([])
const cargandoAnimales   = ref(false)

// ── Funciones ─────────────────────────────────────
function formatCOP(val) {
  if (!val) return '$0'
  return '$' + Math.round(val).toLocaleString('es-CO')
}

async function cargarTodo() {
  try {
    const [fincasRes, invRes, usersRes, configRes] = await Promise.all([
      axios.get(`${API}/fincas`,      { headers: headers.value }),
      axios.get(`${API}/inversiones`, { headers: headers.value }),
      axios.get(`${API}/admin/usuarios`, { headers: headers.value }),
      axios.get(`${API}/inversiones/configuracion`)
    ])
    todasFincas.value      = fincasRes.data
    todasInversiones.value = invRes.data
    todosUsuarios.value    = usersRes.data
    config.value           = configRes.data
    configForm.precio_kilo    = configRes.data.precio_kilo
    configForm.peso_animal_kg = configRes.data.peso_animal_kg
    cargarZootecnistas()
  } catch (err) {
    console.error('Error cargando datos admin:', err)
  }
}

async function aprobarFinca(id) {
  try {
    await axios.put(`${API}/fincas/${id}/aprobar`, {}, { headers: headers.value })
    await cargarTodo()
  } catch (err) {
    alert(err.response?.data?.error || 'Error aprobando finca')
  }
}

function abrirRechazarFinca(finca) {
  fincaArechazar.value  = finca
  motivoRechazo.value   = ''
  modalRechazarFinca.value = true
}

async function confirmarRechazarFinca() {
  if (!motivoRechazo.value.trim()) return alert('Escribe el motivo')
  try {
    await axios.put(`${API}/fincas/${fincaArechazar.value.id}/rechazar`,
      { motivo: motivoRechazo.value }, { headers: headers.value })
    modalRechazarFinca.value = false
    await cargarTodo()
  } catch (err) {
    alert(err.response?.data?.error || 'Error rechazando finca')
  }
}

async function aprobarInversion(id) {
  try {
    await axios.put(`${API}/inversiones/${id}/aprobar`, {}, { headers: headers.value })
    await cargarTodo()
  } catch (err) {
    alert(err.response?.data?.error || 'Error aprobando inversión')
  }
}

function abrirRechazarInversion(inv) {
  inversionArechazar.value       = inv
  motivoRechazoInversion.value   = ''
  modalRechazarInversion.value   = true
}

async function confirmarRechazarInversion() {
  if (!motivoRechazoInversion.value.trim()) return alert('Escribe el motivo')
  try {
    await axios.put(`${API}/inversiones/${inversionArechazar.value.id}/rechazar`,
      { motivo: motivoRechazoInversion.value }, { headers: headers.value })
    modalRechazarInversion.value = false
    await cargarTodo()
  } catch (err) {
    alert(err.response?.data?.error || 'Error rechazando inversión')
  }
}

async function finalizarInversion(id) {
  if (!confirm('¿Confirmas que esta inversión ha finalizado y todas las partes han firmado?')) return
  try {
    await axios.put(`${API}/inversiones/${id}/finalizar`, {}, { headers: headers.value })
    await cargarTodo()
  } catch (err) {
    alert(err.response?.data?.error || 'Error finalizando inversión')
  }
}

async function aprobarUsuario(usuario) {
  try {
    await axios.put(`${API}/admin/usuarios/${usuario.id}/aprobar`, {}, { headers: headers.value })
    await cargarTodo()
  } catch (err) {
    alert(err.response?.data?.error || 'Error aprobando usuario')
  }
}

async function guardarConfig() {
  configExito.value    = ''
  configError.value    = ''
  guardandoConfig.value = true
  try {
    await axios.put(`${API}/inversiones/configuracion`, configForm, { headers: headers.value })
    configExito.value = '✓ Configuración guardada correctamente'
    await cargarTodo()
  } catch (err) {
    configError.value = err.response?.data?.error || 'Error guardando configuración'
  } finally {
    guardandoConfig.value = false
  }
}

async function cerrarSesion() {
  await auth.logout()
  router.push('/')
}

async function verAnimales(inv) {
  if (inversionExpandida.value?.id === inv.id) {
    inversionExpandida.value = null
    animalesInversion.value  = []
    return
  }
  inversionExpandida.value = inv
  cargandoAnimales.value   = true
  try {
    const { data } = await axios.get(`${API}/admin/inversiones/${inv.id}/animales`, { headers: headers.value })
    animalesInversion.value = data
  } catch (err) {
    console.error('Error cargando animales:', err)
  } finally {
    cargandoAnimales.value = false
  }
}

async function cargarZootecnistas() {
  try {
    const { data } = await axios.get(`${API}/admin/zootecnistas`, { headers: headers.value })
    zootecnistas.value = data
  } catch {}
}

onMounted(cargarTodo)
</script>

<style scoped>
.dashboard-root {
  --gris:      #374151;
  --gris-mid:  #4B5563;
  --gris-cl:   #F3F4F6;
  --dorado:    #D4A373;
  --blanco:    #FFFFFF;
  --texto:     #111827;
  --muted:     #6B7280;
  --border:    #E5E7EB;
  --bg:        #F4F5F7;
  --verde:     #1B4332;
  --rojo:      #DC2626;
  --naranja:   #D97706;
  --azul:      #2563EB;

  display: flex; min-height: 100vh;
  background: var(--bg);
  font-family: 'Open Sans', sans-serif;
}

/* SIDEBAR */
.sidebar {
  width: 240px; flex-shrink: 0;
  background: var(--gris);
  display: flex; flex-direction: column;
  padding: 1.4rem 1rem;
  position: sticky; top: 0; height: 100vh;
  box-shadow: 4px 0 24px rgba(0,0,0,0.15);
}
.sidebar-top { display: flex; align-items: center; margin-bottom: 1.5rem; }
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
  display: flex; align-items: center; justify-content: center;
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
  position: relative;
}
.nav-item:hover  { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active { background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; }
.nav-icon { flex-shrink: 0; display: flex; }
.nav-badge {
  margin-left: auto; background: #EF4444;
  color: #fff; font-size: 0.65rem; font-weight: 700;
  padding: 0.1rem 0.45rem; border-radius: 100px; min-width: 18px; text-align: center;
}
.btn-logout {
  all: unset; cursor: pointer;
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.65rem 0.8rem; border-radius: 10px;
  font-size: 0.82rem; color: rgba(255,255,255,0.4);
  transition: all 0.2s;
}
.btn-logout:hover { color: #fff; background: rgba(220,38,38,0.2); }

/* MAIN */
.main-content { flex: 1; overflow-y: auto; }
.seccion { padding: 2rem; }
.dash-header { margin-bottom: 2rem; }
.dash-title {
  font-family: 'Anton', sans-serif; font-size: 1.6rem;
  color: var(--gris); letter-spacing: 0.02em;
}
.dash-sub { font-size: 0.82rem; color: var(--muted); margin-top: 0.2rem; }

/* Stats */
.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
  gap: 1rem; margin-bottom: 2rem;
}
.stat-card {
  background: var(--blanco); border-radius: 14px; padding: 1.2rem;
  display: flex; gap: 1rem; align-items: center;
  border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.stat-icon { color: var(--gris); flex-shrink: 0; }
.stat-val  { font-family: 'Anton', sans-serif; font-size: 1.3rem; color: var(--texto); }
.stat-lbl  { font-size: 0.7rem; color: var(--muted); margin-top: 0.1rem; }

/* Alertas */
.alertas-section { margin-top: 1rem; }
.alertas-grid { display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem; }
.alerta-card {
  background: var(--blanco); border-radius: 12px; padding: 1.1rem 1.4rem;
  border: 1px solid var(--border); display: flex; align-items: center;
  gap: 1rem; cursor: pointer; transition: all 0.2s;
}
.alerta-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.alerta-card.vacia { cursor: default; }
.alerta-card.vacia:hover { transform: none; box-shadow: none; }
.alerta-icon { font-size: 1.5rem; }
.alerta-titulo { font-weight: 700; color: var(--texto); font-size: 0.9rem; }
.alerta-sub    { font-size: 0.75rem; color: var(--muted); }
.alerta-badge {
  margin-left: auto; font-size: 0.75rem; font-weight: 700;
  padding: 0.3rem 0.7rem; border-radius: 100px; color: #fff;
}
.alerta-badge.naranja { background: var(--naranja); }
.alerta-badge.verde   { background: var(--verde); }
.alerta-badge.azul    { background: var(--azul); }

/* Section header */
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.2rem;
}
.section-title {
  font-family: 'Anton', sans-serif; font-size: 1.15rem;
  color: var(--gris); letter-spacing: 0.02em;
}

/* Tabs filter */
.tabs-filter { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.2rem; }
.tab-filter {
  all: unset; cursor: pointer;
  font-family: 'Open Sans', sans-serif; font-size: 0.78rem; font-weight: 600;
  padding: 0.45rem 1rem; border-radius: 100px;
  border: 1.5px solid var(--border); color: var(--muted);
  transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem;
  -webkit-user-select: none; user-select: none;
}
.tab-filter:hover  { border-color: var(--gris-mid); color: var(--texto); }
.tab-filter.active { background: var(--gris); color: #fff; border-color: var(--gris); }
.tab-badge {
  background: #EF4444; color: #fff;
  font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 100px;
}

/* Tabla */
.tabla-container { overflow-x: auto; border-radius: 14px; border: 1px solid var(--border); }
.tabla {
  width: 100%; border-collapse: collapse;
  background: var(--blanco); font-size: 0.82rem;
}
.tabla thead tr { background: #F9FAFB; }
.tabla th {
  padding: 0.9rem 1rem; text-align: left;
  font-size: 0.72rem; font-weight: 700;
  color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em;
  border-bottom: 1px solid var(--border);
}
.tabla td { padding: 0.9rem 1rem; border-bottom: 1px solid #F3F4F6; vertical-align: middle; }
.tabla tbody tr:hover { background: #FAFAFA; }
.tabla tbody tr:last-child td { border-bottom: none; }
.td-nombre { font-weight: 600; color: var(--texto); }
.td-email  { font-size: 0.72rem; color: var(--muted); margin-top: 0.2rem; }
.green { color: #16a34a; font-weight: 700; }

/* Estado badges */
.estado-badge {
  font-size: 0.72rem; font-weight: 600;
  padding: 0.3rem 0.7rem; border-radius: 100px;
  display: inline-block;
}
.estado-badge.pendiente          { background: #FEF3C7; color: #92400E; }
.estado-badge.pendiente_reunion  { background: #FEF3C7; color: #92400E; }
.estado-badge.aprobada           { background: #D1FAE5; color: #065F46; }
.estado-badge.activa             { background: #DBEAFE; color: #1E40AF; }
.estado-badge.rechazada          { background: #FEE2E2; color: #991B1B; }
.estado-badge.finalizada         { background: #F3F4F6; color: #374151; }
.estado-badge.cancelada          { background: #FEE2E2; color: #991B1B; }

/* Rol badges */
.rol-badge {
  font-size: 0.72rem; font-weight: 600;
  padding: 0.3rem 0.7rem; border-radius: 100px;
  display: inline-block;
}
.rol-badge.inversionista { background: #D1FAE5; color: #065F46; }
.rol-badge.propietario   { background: #FEF3C7; color: #92400E; }
.rol-badge.zootecnista   { background: #DBEAFE; color: #1E40AF; }
.rol-badge.administrador { background: #F3F4F6; color: #374151; }

/* Acciones */
.acciones { display: flex; gap: 0.4rem; }
.btn-aprobar {
  all: unset; cursor: pointer;
  background: #D1FAE5; color: #065F46;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.35rem 0.8rem; border-radius: 6px;
  transition: background 0.2s;
}
.btn-aprobar:hover { background: #A7F3D0; }
.btn-rechazar {
  all: unset; cursor: pointer;
  background: #FEE2E2; color: #991B1B;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.35rem 0.8rem; border-radius: 6px;
  transition: background 0.2s;
}
.btn-rechazar:hover { background: #FECACA; }
.btn-finalizar {
  all: unset; cursor: pointer;
  background: #F3F4F6; color: #374151;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.35rem 0.8rem; border-radius: 6px;
  transition: background 0.2s;
}
.btn-finalizar:hover { background: #E5E7EB; }

/* Config */
.config-card {
  background: var(--blanco); border-radius: 16px; padding: 2rem;
  border: 1px solid var(--border); max-width: 600px;
}
.config-titulo { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--gris); margin-bottom: 0.4rem; }
.config-sub    { font-size: 0.83rem; color: var(--muted); margin-bottom: 1.5rem; }
.config-form   { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.form-group    { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: var(--texto); }
.form-group input, .form-group textarea {
  all: unset; border: 1.5px solid var(--border); border-radius: 10px;
  padding: 0.7rem 0.9rem; font-size: 0.88rem; color: var(--texto);
  background: var(--blanco); transition: border-color 0.2s;
  width: 100%; box-sizing: border-box;
}
.form-group input:focus, .form-group textarea:focus { border-color: var(--gris); }
.field-hint { font-size: 0.72rem; color: var(--muted); margin-top: 0.2rem; }

.config-preview {
  background: var(--gris-cl); border-radius: 10px; padding: 1rem;
  margin-bottom: 1.5rem;
}
.preview-label { font-size: 0.72rem; color: var(--muted); margin-bottom: 0.8rem; font-weight: 600; }
.preview-grid  { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.8rem; }
.preview-val   { font-family: 'Anton', sans-serif; font-size: 1rem; color: var(--gris); display: block; }
.preview-lbl   { font-size: 0.68rem; color: var(--muted); }

/* Botones */
.btn-primary {
  all: unset; cursor: pointer;
  background: var(--gris); color: #fff;
  font-size: 0.88rem; font-weight: 600;
  padding: 0.85rem 1.8rem; border-radius: 100px;
  display: inline-block; text-align: center;
  transition: opacity 0.2s; -webkit-user-select: none; user-select: none;
}
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-card {
  background: var(--blanco); border-radius: 16px; padding: 2rem;
  width: 100%; max-width: 480px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.3);
}
.modal-titulo { font-family: 'Anton', sans-serif; font-size: 1.2rem; color: var(--gris); margin-bottom: 0.4rem; }
.modal-sub    { font-size: 0.83rem; color: var(--muted); margin-bottom: 1.2rem; }
.modal-btns   { display: flex; gap: 0.8rem; justify-content: flex-end; margin-top: 1.2rem; }
.btn-secondary {
  all: unset; cursor: pointer;
  border: 1.5px solid var(--border); color: var(--muted);
  font-size: 0.85rem; font-weight: 600;
  padding: 0.7rem 1.4rem; border-radius: 100px;
  transition: all 0.2s;
}
.btn-secondary:hover { border-color: var(--gris); color: var(--texto); }
.btn-rechazar-modal {
  all: unset; cursor: pointer;
  background: var(--rojo); color: #fff;
  font-size: 0.85rem; font-weight: 600;
  padding: 0.7rem 1.4rem; border-radius: 100px;
  transition: opacity 0.2s;
}
.btn-rechazar-modal:hover { opacity: 0.88; }

/* Alertas */
.alert-success {
  background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;
  border-radius: 8px; padding: 0.7rem 0.9rem;
  font-size: 0.82rem; margin-bottom: 1rem;
}
.alert-error {
  background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
  border-radius: 8px; padding: 0.7rem 0.9rem;
  font-size: 0.82rem; margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2,1fr); }
}

/* Animales expandidos */
.btn-ver-animales {
  all: unset; cursor: pointer;
  background: #EFF6FF; color: #2563EB;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.35rem 0.8rem; border-radius: 6px;
  transition: background 0.2s;
}
.btn-ver-animales:hover { background: #DBEAFE; }

.fila-expandida td { padding: 0; background: #F8FAFC; }
.animales-expand {
  padding: 1.2rem 1.5rem;
  border-top: 2px solid #DBEAFE;
}
.animales-titulo {
  font-family: 'Anton', sans-serif; font-size: 0.9rem;
  color: var(--gris); margin-bottom: 0.8rem; letter-spacing: 0.02em;
}
.animales-tabla-mini { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.animales-header-mini, .animales-row-mini {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 0.6rem 1rem; font-size: 0.78rem; gap: 0.5rem;
}
.animales-header-mini {
  background: #F1F5F9; font-weight: 700;
  color: var(--muted); text-transform: uppercase;
  font-size: 0.68rem; letter-spacing: 0.06em;
}
.animales-row-mini {
  border-top: 1px solid #F3F4F6; color: var(--texto);
}
.animales-row-mini:hover { background: #F9FAFB; }
.animal-codigo { font-weight: 700; color: var(--gris); font-family: monospace; }
.sin-animales { padding: 1rem; text-align: center; color: var(--muted); font-size: 0.82rem; }

.estado-animal {
  font-size: 0.7rem; font-weight: 600;
  padding: 0.2rem 0.6rem; border-radius: 100px; display: inline-block;
}
.estado-animal.buen_estado  { background: #D1FAE5; color: #065F46; }
.estado-animal.excelente    { background: #DBEAFE; color: #1E40AF; }
.estado-animal.enfermo      { background: #FEF3C7; color: #92400E; }
.estado-animal.mal_estado   { background: #FEE2E2; color: #991B1B; }

.zoo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px,1fr)); gap: 1rem; }
.zoo-card {
  background: var(--blanco); border-radius: 14px; padding: 1.4rem;
  border: 1px solid var(--border);
}
.zoo-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem; }
.zoo-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--gris); color: #fff;
  font-family: 'Anton', sans-serif; font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.zoo-nombre { font-weight: 700; color: var(--texto); font-size: 0.9rem; }
.zoo-email  { font-size: 0.72rem; color: var(--muted); }
.zoo-fincas-titulo { font-size: 0.72rem; font-weight: 600; color: var(--muted); margin-bottom: 0.5rem; }
.zoo-finca-tag {
  display: inline-block; background: #F0FDF4; color: #065F46;
  font-size: 0.75rem; font-weight: 600;
  padding: 0.3rem 0.8rem; border-radius: 100px;
  margin: 0.2rem 0.2rem 0 0;
}
.zoo-sin-fincas { font-size: 0.78rem; color: var(--muted); }

</style>