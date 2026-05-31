<template>
  <div class="dashboard-root">

    <!-- ══ SIDEBAR ══ -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-top">
        <div class="sidebar-logo">
          <span class="logo-icon">🐄</span>
          <div class="logo-texts" v-if="!sidebarCollapsed">
            <span class="logo-text">FODEGAN</span>
            <span class="logo-sub">INVERSIONES GANADERAS</span>
          </div>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6"/>
            <path v-else d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      <!-- Avatar usuario -->
      <div class="sidebar-user" v-if="!sidebarCollapsed">
        <div class="user-avatar">
          {{ auth.usuario?.nombre?.charAt(0) }}{{ auth.usuario?.apellido?.charAt(0) }}
        </div>
        <div class="user-info">
          <p class="user-name">{{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</p>
          <p class="user-rol">Inversionista</p>
        </div>
      </div>
      <div class="sidebar-user-mini" v-else>
        <div class="user-avatar-mini">
          {{ auth.usuario?.nombre?.charAt(0) }}
        </div>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="item in navItems" :key="item.id"
          class="nav-item"
          :class="{ active: seccionActiva === item.id }"
          @click="seccionActiva = item.id"
          :title="item.label"
        >
          <span class="nav-icon" v-html="item.icon" />
          <span class="nav-label" v-if="!sidebarCollapsed">{{ item.label }}</span>
          <span class="nav-badge" v-if="item.badge && !sidebarCollapsed">{{ item.badge }}</span>
        </button>
      </nav>

      <button class="btn-logout" @click="cerrarSesion" :title="'Cerrar sesión'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span v-if="!sidebarCollapsed">Cerrar sesión</span>
      </button>
    </aside>

    <!-- ══ CONTENIDO ══ -->
    <main class="main-content">

      <!-- ══ SECCIÓN: RESUMEN ══ -->
      <section v-if="seccionActiva === 'resumen'" class="seccion">
        <!-- Hero de bienvenida -->
        <div class="hero-banner">
          <div class="hero-text">
            <p class="hero-tag">Panel de Inversionista</p>
            <h1 class="hero-title">Bienvenido, {{ auth.usuario?.nombre }}</h1>
            <p class="hero-sub">Gestiona tus inversiones ganaderas en tiempo real</p>
            <button class="btn-invertir-hero" @click="seccionActiva = 'invertir'">
              + Nueva inversión
            </button>
          </div>
          <div class="hero-market">
            <p class="market-tag">MERCADO ACTUAL</p>
            <p class="market-stat">14.2% <span>ROI promedio</span></p>
            <p class="market-desc">
              El sector ganadero colombiano presenta condiciones óptimas para nuevos ciclos de ceba.
              Descubre lotes disponibles.
            </p>
            <div class="market-pills">
              <span class="market-pill">Mercado activo</span>
              <span class="market-pill">Contratos seguros</span>
            </div>
          </div>
        </div>

        <!-- Stats cards -->
        <div class="stats-grid">
          <div class="stat-card" v-for="s in statsCards" :key="s.label">
            <div class="stat-card-icon" :style="{ background: s.bg }">
              <span v-html="s.icon" />
            </div>
            <div class="stat-card-info">
              <p class="stat-card-val">{{ s.valor }}</p>
              <p class="stat-card-lbl">{{ s.label }}</p>
            </div>
            <div class="stat-card-trend" v-if="s.trend">{{ s.trend }}</div>
          </div>
        </div>

        <!-- Inversiones -->
        <div class="section-header">
          <h2 class="section-title">Mis Inversiones</h2>
          <button class="btn-sm" @click="seccionActiva = 'invertir'">+ Invertir</button>
        </div>

        <div class="empty-state" v-if="misInversiones.length === 0">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" stroke-width="1.2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p class="empty-title">Sin inversiones activas</p>
          <p class="empty-sub">Comienza a invertir y genera rendimientos con el ganado colombiano</p>
          <button class="btn-primary" @click="seccionActiva = 'invertir'">Comenzar ahora →</button>
        </div>

        <div class="inversiones-grid" v-else>
          <div class="inv-card" v-for="inv in misInversiones" :key="inv.id">
            <div class="inv-card-header">
              <div class="inv-finca-badge">🐄 {{ inv.nombre_ficticio }}</div>
              <span class="inv-estado activa">● Activa</span>
            </div>
            <div class="inv-card-body">
              <div class="inv-monto">{{ formatCOP(inv.monto_cop) }}</div>
              <p class="inv-monto-lbl">Monto invertido</p>
            </div>
            <div class="inv-card-stats">
              <div class="inv-mini-stat">
                <span class="inv-mini-val">{{ inv.cabezas }}</span>
                <span class="inv-mini-lbl">Cabezas</span>
              </div>
              <div class="inv-mini-stat">
                <span class="inv-mini-val">{{ inv.dias_ciclo }}d</span>
                <span class="inv-mini-lbl">Ciclo</span>
              </div>
              <div class="inv-mini-stat">
                <span class="inv-mini-val green">{{ Math.max(inv.dias_restantes, 0) }}d</span>
                <span class="inv-mini-lbl">Restantes</span>
              </div>
            </div>
            <div class="inv-progress-wrap">
              <div class="inv-progress-bar">
                <div class="inv-progress-fill" :style="{ width: Math.min(inv.progreso || 0, 100) + '%' }" />
              </div>
              <span class="inv-progress-pct">{{ Math.min(inv.progreso || 0, 100) }}%</span>
            </div>
            <p class="inv-fecha">Inicio: {{ formatFecha(inv.fecha_inicio) }} · Fin: {{ formatFecha(inv.fecha_fin) }}</p>
          </div>
        </div>
      </section>

      <!-- ══ SECCIÓN: INVERTIR ══ -->
      <section v-if="seccionActiva === 'invertir'" class="seccion">
        <div class="section-header">
          <h2 class="section-title">Nueva Inversión</h2>
        </div>

        <!-- Stepper -->
        <div class="stepper">
          <div v-for="(paso, i) in pasos" :key="i" class="step" :class="{ active: pasoActivo === i+1, done: pasoActivo > i+1 }">
            <div class="step-circle">{{ pasoActivo > i+1 ? '✓' : i+1 }}</div>
            <span class="step-label">{{ paso }}</span>
            <div class="step-line" v-if="i < pasos.length - 1" />
          </div>
        </div>

        <!-- Paso 1 -->
        <div class="paso-card" v-if="pasoActivo === 1">
          <h3 class="paso-title">¿Cuánto deseas invertir?</h3>
          <p class="paso-desc">Ingresa el monto y te mostraremos las fincas disponibles para ti.</p>

          <div class="config-pills" v-if="config">
            <div class="config-pill">
              <span class="pill-icon">⚖️</span>
              <span>Precio kilo: <strong>{{ formatCOP(config.precio_kilo) }}</strong></span>
            </div>
            <div class="config-pill">
              <span class="pill-icon">🐄</span>
              <span>Peso animal: <strong>{{ config.peso_animal_kg }} kg</strong></span>
            </div>
            <div class="config-pill green">
              <span class="pill-icon">💰</span>
              <span>Costo/animal: <strong>{{ formatCOP(config.precio_kilo * config.peso_animal_kg) }}</strong></span>
            </div>
          </div>

          <div class="monto-input-wrap">
            <span class="monto-prefix">$</span>
            <input
              v-model="montoInput"
              type="text"
              placeholder="10.000.000"
              inputmode="numeric"
              class="monto-input"
              @input="formatearMonto"
            />
            <span class="monto-suffix">COP</span>
          </div>

          <div class="cabezas-preview" v-if="cabezasCalculadas > 0">
            <div class="cabeza-icon" v-for="i in Math.min(cabezasCalculadas, 8)" :key="i">🐄</div>
            <span v-if="cabezasCalculadas > 8">+{{ cabezasCalculadas - 8 }}</span>
            <p>Puedes comprar <strong>{{ cabezasCalculadas }} cabezas</strong> de ganado</p>
          </div>

          <div class="alert-error" v-if="errorFincas">{{ errorFincas }}</div>
          <button class="btn-primary" @click="buscarFincas" :disabled="cargandoFincas || !montoNumerico">
            {{ cargandoFincas ? 'Buscando...' : 'Buscar fincas disponibles →' }}
          </button>
        </div>

        <!-- Paso 2 -->
        <div v-if="pasoActivo === 2">
          <div class="paso-nav">
            <button class="btn-back" @click="pasoActivo = 1">← Volver</button>
            <p class="paso-desc">
              <strong>{{ fincasDisponibles.length }}</strong> fincas disponibles para
              <strong>{{ montoInput }}</strong> COP
            </p>
          </div>

          <div class="fincas-grid-select">
            <div
              class="finca-select-card"
              v-for="finca in fincasDisponibles" :key="finca.id"
              :class="{ selected: fincaSeleccionada?.id === finca.id }"
              @click="fincaSeleccionada = finca"
            >
              <div class="finca-select-top">
                <span class="finca-icon">🌿</span>
                <div class="finca-select-check" v-if="fincaSeleccionada?.id === finca.id">✓</div>
              </div>
              <p class="finca-select-nombre">{{ finca.nombre_ficticio }}</p>
              <div class="finca-select-stats">
                <div>
                  <p class="finca-stat-val">{{ finca.capacidad_total }}</p>
                  <p class="finca-stat-lbl">Capacidad</p>
                </div>
                <div>
                  <p class="finca-stat-val">{{ finca.hectareas }} ha</p>
                  <p class="finca-stat-lbl">Hectáreas</p>
                </div>
              </div>
            </div>
          </div>

          <button class="btn-primary" @click="pasoActivo = 3" :disabled="!fincaSeleccionada">
            Continuar →
          </button>
        </div>

        <!-- Paso 3 -->
        <div class="paso-card" v-if="pasoActivo === 3">
          <div class="paso-nav">
            <button class="btn-back" @click="pasoActivo = 2">← Volver</button>
          </div>
          <h3 class="paso-title">Confirma tu inversión</h3>

          <div class="resumen-box">
            <div class="resumen-row">
              <span>Finca</span>
              <strong>{{ fincaSeleccionada?.nombre_ficticio }}</strong>
            </div>
            <div class="resumen-row">
              <span>Monto</span>
              <strong class="green">{{ montoInput }} COP</strong>
            </div>
            <div class="resumen-row">
              <span>Cabezas</span>
              <strong>{{ cabezasCalculadas }} 🐄</strong>
            </div>
          </div>

          <div class="dias-selector">
            <p class="dias-label">Duración del ciclo</p>
            <div class="dias-options">
              <button
                v-for="dias in [120, 150, 180]" :key="dias"
                class="dias-btn"
                :class="{ active: diasCiclo === dias }"
                @click="diasCiclo = dias"
              >
                <span class="dias-num">{{ dias }}</span>
                <span class="dias-txt">días</span>
              </button>
            </div>
          </div>

          <div class="rendimiento-card">
            <p class="rend-tag">Rendimiento estimado</p>
            <p class="rend-val">12% – 18%</p>
            <p class="rend-sub">En {{ diasCiclo }} días · Respaldado por seguro ganadero</p>
          </div>

          <button class="btn-primary btn-confirmar" @click="confirmarInversion" :disabled="cargandoInversion">
            {{ cargandoInversion ? 'Procesando...' : '✓ Confirmar inversión' }}
          </button>
          <div class="alert-error"   v-if="errorInversion">{{ errorInversion }}</div>
          <div class="alert-success" v-if="exitoInversion">{{ exitoInversion }}</div>
        </div>
      </section>

      <!-- ══ SECCIÓN: PERFIL ══ -->
      <section v-if="seccionActiva === 'perfil'" class="seccion">
        <div class="section-header">
          <h2 class="section-title">Mi Perfil</h2>
        </div>

        <div class="perfil-layout">
          <!-- Card izquierda -->
          <div class="perfil-card-left">
            <div class="perfil-avatar-big">
              {{ auth.usuario?.nombre?.charAt(0) }}{{ auth.usuario?.apellido?.charAt(0) }}
            </div>
            <h3 class="perfil-nombre">{{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</h3>
            <p class="perfil-rol-badge">🐄 Inversionista FODEGAN</p>
            <div class="perfil-data-locked">
              <div class="locked-item">
                <span class="locked-icon">📧</span>
                <div>
                  <p class="locked-lbl">Correo (no editable)</p>
                  <p class="locked-val">{{ auth.usuario?.email }}</p>
                </div>
              </div>
              <div class="locked-item">
                <span class="locked-icon">🪪</span>
                <div>
                  <p class="locked-lbl">Cédula (no editable)</p>
                  <p class="locked-val">{{ perfilData.cedula || '—' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Card derecha — formulario editable -->
          <div class="perfil-card-right">
            <h4 class="perfil-edit-title">Información editable</h4>

            <div class="alert-success" v-if="perfilExito">{{ perfilExito }}</div>
            <div class="alert-error"   v-if="perfilError">{{ perfilError }}</div>

            <div class="perfil-form">
              <div class="form-row-2">
                <div class="form-group">
                  <label>Nombre</label>
                  <input v-model="perfilForm.nombre" type="text" placeholder="Tu nombre" />
                </div>
                <div class="form-group">
                  <label>Apellido</label>
                  <input v-model="perfilForm.apellido" type="text" placeholder="Tu apellido" />
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label>Teléfono</label>
                  <input v-model="perfilForm.telefono" type="tel" placeholder="+57 300 000 0000" />
                </div>
                <div class="form-group">
                  <label>Ciudad</label>
                  <input v-model="perfilForm.ciudad" type="text" placeholder="Tu ciudad" />
                </div>
              </div>
              <button class="btn-primary" @click="guardarPerfil" :disabled="guardandoPerfil">
                {{ guardandoPerfil ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ══ SECCIÓN: MIS INVERSIONES ══ -->
      <section v-if="seccionActiva === 'mis-inversiones'" class="seccion">
        <div class="section-header">
          <h2 class="section-title">Mis Inversiones</h2>
        </div>

        <!-- Lista de inversiones -->
        <div v-if="!inversionDetalle">
          <div class="empty-state" v-if="misInversiones.length === 0">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" stroke-width="1.2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <p class="empty-title">Sin inversiones activas</p>
            <p class="empty-sub">Ve a "Invertir" para comenzar tu primera inversión</p>
          </div>

          <div class="inversiones-detalle-list" v-else>
            <div
              class="inv-detalle-row"
              v-for="inv in misInversiones" :key="inv.id"
              @click="verDetalle(inv)"
            >
              <div class="inv-detalle-left">
                <div class="inv-detalle-icon">🐄</div>
                <div>
                  <p class="inv-detalle-nombre">{{ inv.nombre_ficticio }}</p>
                  <p class="inv-detalle-fecha">Inicio: {{ formatFecha(inv.fecha_inicio) }}</p>
                </div>
              </div>
              <div class="inv-detalle-center">
                <div class="inv-det-stat">
                  <span class="inv-det-val">{{ formatCOP(inv.monto_cop) }}</span>
                  <span class="inv-det-lbl">Monto</span>
                </div>
                <div class="inv-det-stat">
                  <span class="inv-det-val">{{ inv.cabezas }}</span>
                  <span class="inv-det-lbl">Cabezas</span>
                </div>
                <div class="inv-det-stat">
                  <span class="inv-det-val">{{ inv.dias_ciclo }}d</span>
                  <span class="inv-det-lbl">Ciclo</span>
                </div>
                <div class="inv-det-stat">
                  <span class="inv-det-val green">{{ Math.max(inv.dias_restantes, 0) }}d</span>
                  <span class="inv-det-lbl">Restantes</span>
                </div>
              </div>
              <div class="inv-detalle-right">
                <div class="inv-progress-mini">
                  <div class="inv-progress-bar">
                    <div class="inv-progress-fill" :style="{ width: Math.min(inv.progreso || 0, 100) + '%' }" />
                  </div>
                  <span>{{ Math.min(inv.progreso || 0, 100) }}%</span>
                </div>
                <span class="inv-ver-detalle">Ver detalle →</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Detalle de inversión -->
        <div v-else>
          <button class="btn-back" @click="inversionDetalle = null" style="margin-bottom: 1.5rem;">
            ← Volver a mis inversiones
          </button>

          <div v-if="cargandoDetalle" class="loading-state">Cargando detalle...</div>

          <div v-else class="detalle-layout">

            <!-- Card resumen -->
            <div class="detalle-resumen-card">
              <div class="detalle-header">
                <div>
                  <p class="detalle-tag">INVERSIÓN ACTIVA</p>
                  <h3 class="detalle-nombre">{{ inversionDetalle.inversion.nombre_ficticio }}</h3>
                </div>
                <span class="inv-estado activa">● Activa</span>
              </div>

              <div class="detalle-stats-grid">
                <div class="det-stat">
                  <p class="det-stat-val">{{ formatCOP(inversionDetalle.inversion.monto_cop) }}</p>
                  <p class="det-stat-lbl">Monto invertido</p>
                </div>
                <div class="det-stat">
                  <p class="det-stat-val">{{ inversionDetalle.inversion.cabezas }}</p>
                  <p class="det-stat-lbl">Cabezas de ganado</p>
                </div>
                <div class="det-stat">
                  <p class="det-stat-val green">{{ Math.max(inversionDetalle.inversion.dias_restantes, 0) }}</p>
                  <p class="det-stat-lbl">Días restantes</p>
                </div>
                <div class="det-stat">
                  <p class="det-stat-val">{{ inversionDetalle.inversion.dias_ciclo }}</p>
                  <p class="det-stat-lbl">Días del ciclo</p>
                </div>
              </div>

              <!-- Barra de progreso -->
              <div class="detalle-progress">
                <div class="detalle-progress-header">
                  <span>Progreso del ciclo</span>
                  <span>{{ Math.min(inversionDetalle.inversion.progreso || 0, 100) }}%</span>
                </div>
                <div class="detalle-progress-bar">
                  <div class="detalle-progress-fill"
                    :style="{ width: Math.min(inversionDetalle.inversion.progreso || 0, 100) + '%' }" />
                </div>
                <div class="detalle-progress-dates">
                  <span>{{ formatFecha(inversionDetalle.inversion.fecha_inicio) }}</span>
                  <span>{{ formatFecha(inversionDetalle.inversion.fecha_fin) }}</span>
                </div>
              </div>

              <!-- Rentabilidad estimada -->
              <div class="rentabilidad-card">
                <div class="rent-item">
                  <p class="rent-lbl">Precio kilo al invertir</p>
                  <p class="rent-val">{{ formatCOP(inversionDetalle.inversion.precio_kilo) }}</p>
                </div>
                <div class="rent-item">
                  <p class="rent-lbl">Peso animal</p>
                  <p class="rent-val">{{ inversionDetalle.inversion.peso_animal_kg }} kg</p>
                </div>
                <div class="rent-item">
                  <p class="rent-lbl">Valor ganado estimado</p>
                  <p class="rent-val green">{{ formatCOP(inversionDetalle.inversion.valor_ganado_estimado) }}</p>
                </div>
                <div class="rent-item">
                  <p class="rent-lbl">Rendimiento esperado</p>
                  <p class="rent-val green">12% – 18%</p>
                </div>
              </div>
            </div>

            <!-- Seguimiento de animales -->
            <div class="detalle-animales-card">
              <h4 class="detalle-section-title">Seguimiento por Animal</h4>

              <div class="empty-animales" v-if="inversionDetalle.animales.length === 0">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" stroke-width="1.2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>El zootecnista aún no ha registrado el seguimiento de los animales.</p>
              </div>

              <div class="animales-tabla" v-else>
                <div class="tabla-header">
                  <span>Animal</span>
                  <span>Peso inicial</span>
                  <span>Peso actual</span>
                  <span>Ganancia</span>
                  <span>Registros</span>
                </div>
                <div class="tabla-row" v-for="animal in inversionDetalle.animales" :key="animal.id">
                  <span>🐄 #{{ animal.numero_animal }}</span>
                  <span>{{ animal.peso_inicial }} kg</span>
                  <span>{{ animal.peso_actual || animal.peso_inicial }} kg</span>
                  <span class="green">+{{ ((animal.peso_actual || animal.peso_inicial) - animal.peso_inicial).toFixed(1) }} kg</span>
                  <span>{{ animal.registros }} reportes</span>
                </div>
              </div>

              <!-- Historial de seguimiento -->
              <div v-if="inversionDetalle.seguimiento.length > 0">
                <h4 class="detalle-section-title" style="margin-top: 1.5rem;">Historial de Peso Promedio</h4>
                <div class="seguimiento-lista">
                  <div class="seg-item" v-for="seg in inversionDetalle.seguimiento" :key="seg.fecha_registro">
                    <span class="seg-fecha">{{ formatFecha(seg.fecha_registro) }}</span>
                    <div class="seg-bar-wrap">
                      <div class="seg-bar">
                        <div class="seg-bar-fill" :style="{ width: Math.min((seg.peso_promedio / 600) * 100, 100) + '%' }" />
                      </div>
                    </div>
                    <span class="seg-peso">{{ parseFloat(seg.peso_promedio).toFixed(1) }} kg</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
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

// ── Sidebar ───────────────────────────────────────
const sidebarCollapsed = ref(false)
const seccionActiva    = ref('resumen')
const inversionDetalle   = ref(null)
const cargandoDetalle    = ref(false)
const inversionSeleccionada = ref(null)

const navItems = [
  { id: 'resumen',  label: 'Resumen',      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id: 'invertir', label: 'Invertir',     icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>` },
  { id: 'perfil',   label: 'Mi Perfil',    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
  { id: 'mis-inversiones', label: 'Mis Inversiones', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>` },
]

// ── Datos ─────────────────────────────────────────
const config           = ref(null)
const misInversiones   = ref([])
const fincasDisponibles = ref([])
const fincaSeleccionada = ref(null)
const perfilData       = ref({})

const totalInvertido = computed(() =>
  misInversiones.value.reduce((a, i) => a + parseFloat(i.monto_cop || 0), 0)
)

const statsCards = computed(() => [
  { icon: `...`, valor: formatCOP(totalInvertido.value), label: 'Total invertido', trend: null },
  { icon: `...`, valor: '12–18%', label: 'Rendimiento est.', trend: '↑' },
  { icon: `...`, valor: misInversiones.value.length, label: 'Inversiones activas', trend: null },
  { icon: `...`, valor: misInversiones.value.reduce((a,i) => a + (i.cabezas||0), 0), label: 'Cabezas totales', trend: null },
])

// ── Invertir ──────────────────────────────────────
const pasos        = ['Monto', 'Finca', 'Confirmar']
const pasoActivo   = ref(1)
const montoInput   = ref('')
const montoNumerico = ref(0)
const diasCiclo    = ref(120)
const cargandoFincas   = ref(false)
const cargandoInversion = ref(false)
const errorFincas   = ref('')
const errorInversion = ref('')
const exitoInversion = ref('')

const cabezasCalculadas = computed(() => {
  if (!config.value || !montoNumerico.value) return 0
  const costo = config.value.precio_kilo * config.value.peso_animal_kg
  return Math.floor(montoNumerico.value / costo)
})

// ── Perfil ────────────────────────────────────────
const perfilForm = reactive({ nombre: '', apellido: '', telefono: '', ciudad: '' })
const perfilExito = ref('')
const perfilError = ref('')
const guardandoPerfil = ref(false)

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
  errorFincas.value    = ''
  cargandoFincas.value = true
  try {
    const { data } = await axios.get(`${API}/inversiones/fincas-disponibles`, {
      params: { monto: montoNumerico.value }, headers: headers.value
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
  errorInversion.value   = ''
  exitoInversion.value   = ''
  cargandoInversion.value = true
  try {
    await axios.post(`${API}/inversiones`, {
      finca_id: fincaSeleccionada.value.id,
      monto: montoNumerico.value,
      dias_ciclo: diasCiclo.value
    }, { headers: headers.value })
    exitoInversion.value = '✓ Inversión creada exitosamente'
    await cargarMisInversiones()
    setTimeout(() => {
      seccionActiva.value = 'resumen'
      pasoActivo.value    = 1
      montoInput.value    = ''
      fincaSeleccionada.value = null
      exitoInversion.value = ''
    }, 2000)
  } catch (err) {
    errorInversion.value = err.response?.data?.error || 'Error creando inversión'
  } finally {
    cargandoInversion.value = false
  }
}

async function guardarPerfil() {
  perfilExito.value    = ''
  perfilError.value    = ''
  guardandoPerfil.value = true
  try {
    const { data } = await axios.put(`${API}/auth/perfil`, perfilForm, { headers: headers.value })
    perfilExito.value = '✓ Perfil actualizado correctamente'
    auth.usuario = { ...auth.usuario, ...data.usuario }
    localStorage.setItem('usuario', JSON.stringify(auth.usuario))
  } catch (err) {
    perfilError.value = err.response?.data?.error || 'Error actualizando perfil'
  } finally {
    guardandoPerfil.value = false
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

async function cargarPerfil() {
  try {
    const { data } = await axios.get(`${API}/auth/me`, { headers: headers.value })
    perfilData.value = data.usuario
    perfilForm.nombre    = data.usuario.nombre    || ''
    perfilForm.apellido  = data.usuario.apellido  || ''
    perfilForm.telefono  = data.usuario.telefono  || ''
    perfilForm.ciudad    = data.usuario.ciudad    || ''
  } catch {}
}

async function verDetalle(inv) {
  inversionSeleccionada.value = inv
  cargandoDetalle.value = true
  try {
    const { data } = await axios.get(`${API}/inversiones/${inv.id}`, { headers: headers.value })
    inversionDetalle.value = data
  } catch (err) {
    console.error('Error detalle:', err)
  } finally {
    cargandoDetalle.value = false
  }
}

async function cerrarSesion() {
  await auth.logout()
  router.push('/')
}

onMounted(async () => {
  await Promise.all([cargarConfig(), cargarMisInversiones(), cargarPerfil()])
})
</script>

<style scoped>
.dashboard-root {
  --verde:     #1B4332;
  --verde-mid: #2D6A4F;
  --verde-cl:  #D1FAE5;
  --dorado:    #D4A373;
  --crema:     #F5F0E8;
  --blanco:    #FFFFFF;
  --texto:     #111827;
  --muted:     #6B7280;
  --border:    #E5E7EB;
  --bg:        #F4F5F7;

  display: flex; min-height: 100vh;
  background: var(--bg);
  font-family: 'Open Sans', sans-serif;
}

/* ══ SIDEBAR ══ */
.sidebar {
  width: 240px; flex-shrink: 0;
  background: var(--verde);
  display: flex; flex-direction: column;
  padding: 1.4rem 1rem;
  position: sticky; top: 0; height: 100vh;
  transition: width 0.3s ease;
  overflow: hidden;
  box-shadow: 4px 0 24px rgba(0,0,0,0.15);
}
.sidebar.collapsed { width: 68px; }

.sidebar-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.5rem;
}
.sidebar-logo { display: flex; align-items: center; gap: 0.6rem; }
.logo-icon { font-size: 1.6rem; flex-shrink: 0; }
.logo-texts { display: flex; flex-direction: column; }
.logo-text {
  font-family: 'Anton', sans-serif;
  font-size: 0.95rem; letter-spacing: 0.16em;
  color: var(--dorado); line-height: 1;
}
.logo-sub {
  font-size: 0.45rem; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.4); text-transform: uppercase;
}
.collapse-btn {
  all: unset; cursor: pointer;
  width: 26px; height: 26px; border-radius: 6px;
  background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.7); flex-shrink: 0;
  transition: background 0.2s;
}
.collapse-btn:hover { background: rgba(255,255,255,0.2); }

/* Usuario sidebar */
.sidebar-user {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.8rem; border-radius: 12px;
  background: rgba(255,255,255,0.08);
  margin-bottom: 1.2rem;
}
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--dorado); color: #fff;
  font-family: 'Anton', sans-serif; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-name { font-size: 0.78rem; font-weight: 600; color: #fff; }
.user-rol  { font-size: 0.65rem; color: rgba(255,255,255,0.5); }

.sidebar-user-mini { display: flex; justify-content: center; margin-bottom: 1.2rem; }
.user-avatar-mini {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--dorado); color: #fff;
  font-family: 'Anton', sans-serif; font-size: 0.85rem;
  display: flex; align-items: center; justify-content: center;
}

.sidebar-nav { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; }
.nav-item {
  all: unset; cursor: pointer;
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.65rem 0.8rem; border-radius: 10px;
  font-size: 0.83rem; color: rgba(255,255,255,0.65);
  transition: all 0.2s; white-space: nowrap;
  -webkit-user-select: none; user-select: none;
}
.nav-item:hover  { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active { background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; }
.nav-icon { flex-shrink: 0; display: flex; }
.nav-badge {
  margin-left: auto; background: var(--dorado);
  color: #fff; font-size: 0.65rem; font-weight: 700;
  padding: 0.1rem 0.45rem; border-radius: 100px;
}

.btn-logout {
  all: unset; cursor: pointer;
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.65rem 0.8rem; border-radius: 10px;
  font-size: 0.82rem; color: rgba(255,255,255,0.4);
  transition: all 0.2s; white-space: nowrap;
}
.btn-logout:hover { color: #fff; background: rgba(220,38,38,0.2); }

/* ══ MAIN ══ */
.main-content { flex: 1; overflow-y: auto; }
.seccion { padding: 2rem; }

/* Hero banner */
.hero-banner {
  background: linear-gradient(135deg, var(--verde) 0%, var(--verde-mid) 100%);
  border-radius: 20px; padding: 2rem 2.5rem;
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.8rem; gap: 2rem;
}
.hero-tag {
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--dorado); margin-bottom: 0.4rem;
}
.hero-title {
  font-family: 'Anton', sans-serif;
  font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 400;
  color: #fff; margin-bottom: 0.3rem; letter-spacing: 0.02em;
}
.hero-sub { font-size: 0.82rem; color: rgba(255,255,255,0.7); margin-bottom: 1.4rem; }
.hero-stats-row {
  display: flex; align-items: center; gap: 1.2rem; margin-bottom: 1.4rem;
}
.hero-stat-val { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--dorado); display: block; }
.hero-stat-lbl { font-size: 0.65rem; color: rgba(255,255,255,0.55); text-transform: uppercase; }
.hero-stat-sep { width: 1px; height: 30px; background: rgba(255,255,255,0.2); }
.btn-invertir-hero {
  all: unset; cursor: pointer;
  background: var(--dorado); color: #fff;
  font-size: 0.85rem; font-weight: 600;
  padding: 0.7rem 1.4rem; border-radius: 100px;
  transition: opacity 0.2s; -webkit-user-select: none; user-select: none;
}
.btn-invertir-hero:hover { opacity: 0.88; }

/* Vaca 3D */
.hero-image {
  position: relative; flex-shrink: 0;
  width: 160px; height: 140px;
  display: flex; align-items: center; justify-content: center;
}
.cow-3d {
  font-size: 6rem; line-height: 1;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.4));
  animation: float 3s ease-in-out infinite;
  transform-style: preserve-3d;
}
@keyframes float {
  0%,100% { transform: translateY(0) rotate(-3deg); }
  50%      { transform: translateY(-10px) rotate(3deg); }
}
.cow-shadow {
  position: absolute; bottom: 0; left: 50%;
  transform: translateX(-50%);
  width: 80px; height: 12px;
  background: rgba(0,0,0,0.25);
  border-radius: 50%;
  filter: blur(6px);
  animation: shadow 3s ease-in-out infinite;
}
@keyframes shadow {
  0%,100% { transform: translateX(-50%) scale(1); opacity: 0.25; }
  50%      { transform: translateX(-50%) scale(0.8); opacity: 0.15; }
}
.floating-badge {
  position: absolute;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff; font-size: 0.72rem; font-weight: 600;
  padding: 0.35rem 0.7rem; border-radius: 100px;
  display: flex; align-items: center; gap: 0.3rem;
  white-space: nowrap;
}
.badge-1 { top: 0; right: 0; animation: floatBadge 3s ease-in-out infinite; }
.badge-2 { bottom: 20px; left: 0; animation: floatBadge 3s ease-in-out infinite 1.5s; }
@keyframes floatBadge {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-5px); }
}

/* Stats cards */
.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr));
  gap: 1rem; margin-bottom: 1.8rem;
}
.stat-card {
  background: var(--blanco); border-radius: 14px; padding: 1.1rem;
  display: flex; align-items: center; gap: 0.9rem;
  border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  position: relative;
}
.stat-card-icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--verde);
  background: rgba(212, 163, 115, 0.15);
}
.stat-card-val { font-family: 'Anton', sans-serif; font-size: 1.15rem; color: var(--texto); }
.stat-card-lbl { font-size: 0.7rem; color: var(--muted); margin-top: 0.1rem; }
.stat-card-trend {
  position: absolute; top: 0.7rem; right: 0.8rem;
  font-size: 0.75rem; color: #16a34a; font-weight: 700;
}

/* Section header */
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem;
}
.section-title {
  font-family: 'Anton', sans-serif; font-size: 1.15rem;
  color: var(--verde); letter-spacing: 0.02em;
}
.btn-sm {
  all: unset; cursor: pointer;
  background: var(--verde); color: #fff;
  font-size: 0.78rem; font-weight: 600;
  padding: 0.4rem 1rem; border-radius: 100px;
  transition: opacity 0.2s;
}
.btn-sm:hover { opacity: 0.85; }

/* Empty state */
.empty-state {
  text-align: center; padding: 3rem 2rem;
  background: var(--blanco); border-radius: 16px;
  border: 1px solid var(--border);
}
.empty-icon { font-size: 3rem; margin-bottom: 0.8rem; }
.empty-title { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--verde); margin-bottom: 0.4rem; }
.empty-sub { font-size: 0.85rem; color: var(--muted); margin-bottom: 1.2rem; }

/* Inversiones grid */
.inversiones-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr));
  gap: 1rem;
}
.inv-card {
  background: var(--blanco); border-radius: 16px; padding: 1.4rem;
  border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.inv-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.inv-finca-badge {
  font-size: 0.8rem; font-weight: 600; color: var(--verde);
  background: var(--verde-cl); padding: 0.3rem 0.8rem; border-radius: 100px;
}
.inv-estado { font-size: 0.72rem; font-weight: 600; }
.inv-estado.activa { color: #16a34a; }
.inv-card-body { margin-bottom: 1rem; }
.inv-monto { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: var(--verde); }
.inv-monto-lbl { font-size: 0.72rem; color: var(--muted); margin-top: 0.1rem; }
.inv-card-stats { display: flex; gap: 1.2rem; margin-bottom: 1rem; }
.inv-mini-val { font-weight: 700; color: var(--texto); font-size: 0.9rem; display: block; }
.inv-mini-val.green { color: #16a34a; }
.inv-mini-lbl { font-size: 0.68rem; color: var(--muted); }
.inv-progress-wrap { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; }
.inv-progress-bar { flex: 1; height: 6px; background: #E5E7EB; border-radius: 100px; overflow: hidden; }
.inv-progress-fill { height: 100%; background: var(--verde); border-radius: 100px; transition: width 1s ease; }
.inv-progress-pct { font-size: 0.7rem; color: var(--muted); flex-shrink: 0; }
.inv-fecha { font-size: 0.7rem; color: var(--muted); }

/* ══ INVERTIR ══ */
/* Stepper */
.stepper {
  display: flex; align-items: center;
  margin-bottom: 2rem; gap: 0;
}
.step {
  display: flex; align-items: center; gap: 0.5rem;
  flex-shrink: 0;
}
.step-circle {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.78rem; font-weight: 700; color: var(--muted);
  background: var(--blanco); transition: all 0.3s;
}
.step.active .step-circle { border-color: var(--verde); background: var(--verde); color: #fff; }
.step.done  .step-circle  { border-color: #16a34a; background: #16a34a; color: #fff; }
.step-label { font-size: 0.78rem; color: var(--muted); font-weight: 600; }
.step.active .step-label { color: var(--verde); }
.step.done  .step-label  { color: #16a34a; }
.step-line { flex: 1; height: 2px; background: var(--border); margin: 0 0.5rem; min-width: 40px; }

.paso-card {
  background: var(--blanco); border-radius: 16px; padding: 2rem;
  border: 1px solid var(--border); max-width: 620px;
}
.paso-title {
  font-family: 'Anton', sans-serif; font-size: 1.2rem;
  color: var(--verde); margin-bottom: 0.5rem;
}
.paso-desc { font-size: 0.85rem; color: var(--muted); margin-bottom: 1.5rem; line-height: 1.6; }
.paso-nav { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }

/* Config pills */
.config-pills { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.config-pill {
  display: flex; align-items: center; gap: 0.4rem;
  background: #F0FDF4; border: 1px solid #BBF7D0;
  border-radius: 100px; padding: 0.4rem 0.9rem;
  font-size: 0.78rem; color: var(--verde-mid);
}
.config-pill.green { background: #ECFDF5; border-color: #6EE7B7; }
.pill-icon { font-size: 0.9rem; }

/* Monto input */
.monto-input-wrap {
  display: flex; align-items: center;
  border: 2px solid var(--border); border-radius: 12px;
  overflow: hidden; margin-bottom: 1rem;
  transition: border-color 0.2s;
}
.monto-input-wrap:focus-within { border-color: var(--verde); }
.monto-prefix, .monto-suffix {
  padding: 0 0.9rem; font-weight: 700;
  color: var(--verde); background: #F0FDF4;
  height: 100%; display: flex; align-items: center;
  font-size: 1rem;
}
.monto-input {
  all: unset; flex: 1; padding: 0.9rem 0.5rem;
  font-size: 1.1rem; font-weight: 700; color: var(--texto);
  text-align: center;
}

/* Cabezas preview */
.cabezas-preview {
  display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem;
  background: #F0FDF4; border-radius: 10px; padding: 0.8rem;
  margin-bottom: 1.2rem; font-size: 0.85rem; color: var(--verde-mid);
}
.cabeza-icon { font-size: 1.4rem; }

/* Fincas selección */
.fincas-grid-select {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr));
  gap: 1rem; margin-bottom: 1.5rem;
}
.finca-select-card {
  background: var(--blanco); border-radius: 14px; padding: 1.2rem;
  border: 2px solid var(--border); cursor: pointer; transition: all 0.2s;
}
.finca-select-card:hover   { border-color: var(--verde-mid); transform: translateY(-2px); }
.finca-select-card.selected { border-color: var(--verde); background: #F0FDF4; }
.finca-select-top { display: flex; justify-content: space-between; margin-bottom: 0.8rem; }
.finca-icon { font-size: 1.5rem; }
.finca-select-check {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--verde); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700;
}
.finca-select-nombre { font-weight: 700; color: var(--verde); margin-bottom: 0.8rem; font-size: 0.95rem; }
.finca-select-stats { display: flex; gap: 1.2rem; }
.finca-stat-val { font-weight: 700; color: var(--texto); font-size: 1rem; }
.finca-stat-lbl { font-size: 0.68rem; color: var(--muted); }

/* Resumen box */
.resumen-box {
  background: #F0FDF4; border-radius: 12px; padding: 1.2rem;
  display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.5rem;
}
.resumen-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.88rem; color: var(--muted);
}
.resumen-row strong { color: var(--texto); }
.resumen-row strong.green { color: #16a34a; }

/* Días selector */
.dias-selector { margin-bottom: 1.4rem; }
.dias-label { font-size: 0.78rem; font-weight: 600; color: var(--texto); margin-bottom: 0.6rem; }
.dias-options { display: flex; gap: 0.8rem; }
.dias-btn {
  all: unset; cursor: pointer;
  display: flex; flex-direction: column; align-items: center;
  padding: 0.8rem 1.4rem; border-radius: 12px;
  border: 2px solid var(--border); transition: all 0.2s;
  -webkit-user-select: none; user-select: none;
}
.dias-btn:hover { border-color: var(--verde-mid); }
.dias-btn.active { border-color: var(--verde); background: var(--verde); color: #fff; }
.dias-num { font-family: 'Anton', sans-serif; font-size: 1.3rem; line-height: 1; }
.dias-txt { font-size: 0.7rem; opacity: 0.7; }

/* Rendimiento card */
.rendimiento-card {
  background: linear-gradient(135deg, var(--verde), var(--verde-mid));
  color: #fff; border-radius: 14px; padding: 1.4rem;
  text-align: center; margin-bottom: 1.5rem;
}
.rend-tag { font-size: 0.7rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.1em; }
.rend-val { font-family: 'Anton', sans-serif; font-size: 2.2rem; margin: 0.3rem 0; }
.rend-sub { font-size: 0.75rem; opacity: 0.7; }

/* ══ PERFIL ══ */
.perfil-layout {
  display: grid; grid-template-columns: 280px 1fr;
  gap: 1.5rem; align-items: start;
}
.perfil-card-left {
  background: var(--blanco); border-radius: 16px; padding: 1.8rem;
  border: 1px solid var(--border); text-align: center;
}
.perfil-avatar-big {
  width: 80px; height: 80px; border-radius: 50%;
  background: var(--verde); color: #fff;
  font-family: 'Anton', sans-serif; font-size: 1.8rem;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem;
}
.perfil-nombre { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--verde); margin-bottom: 0.3rem; }
.perfil-rol-badge {
  display: inline-block; background: var(--verde-cl);
  color: var(--verde-mid); font-size: 0.72rem; font-weight: 600;
  padding: 0.3rem 0.8rem; border-radius: 100px; margin-bottom: 1.2rem;
}
.perfil-data-locked { display: flex; flex-direction: column; gap: 0.8rem; text-align: left; }
.locked-item {
  display: flex; align-items: flex-start; gap: 0.7rem;
  background: #F9FAFB; border-radius: 10px; padding: 0.7rem;
}
.locked-icon { font-size: 1.1rem; flex-shrink: 0; }
.locked-lbl { font-size: 0.68rem; color: var(--muted); }
.locked-val { font-size: 0.82rem; font-weight: 600; color: var(--texto); }

.perfil-card-right {
  background: var(--blanco); border-radius: 16px; padding: 1.8rem;
  border: 1px solid var(--border);
}
.perfil-edit-title {
  font-family: 'Anton', sans-serif; font-size: 1rem;
  color: var(--verde); margin-bottom: 1.2rem;
}
.perfil-form { display: flex; flex-direction: column; gap: 1rem; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: var(--texto); }
.form-group input {
  all: unset; border: 1.5px solid var(--border); border-radius: 10px;
  padding: 0.7rem 0.9rem; font-size: 0.88rem; color: var(--texto);
  background: var(--blanco); transition: border-color 0.2s;
  width: 100%; box-sizing: border-box;
}
.form-group input:focus { border-color: var(--verde); }

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
.btn-confirmar { width: 100%; box-sizing: border-box; }

.btn-back {
  all: unset; cursor: pointer; font-size: 0.82rem;
  color: var(--muted); transition: color 0.2s;
}
.btn-back:hover { color: var(--verde); }

/* Alertas */
.alert-error {
  background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
  border-radius: 8px; padding: 0.7rem 0.9rem;
  font-size: 0.82rem; margin-top: 0.8rem;
}
.alert-success {
  background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;
  border-radius: 8px; padding: 0.7rem 0.9rem;
  font-size: 0.82rem; margin-bottom: 0.8rem;
}

/* Responsive */
@media (max-width: 900px) {
  .hero-image { display: none; }
  .perfil-layout { grid-template-columns: 1fr; }
  .form-row-2 { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .sidebar { width: 68px; }
  .logo-texts, .user-info, .nav-label, .btn-logout span { display: none; }
  .inversiones-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2,1fr); }
}
/* Hero market info */
.hero-market {
  flex-shrink: 0; max-width: 260px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 14px; padding: 1.2rem;
}
.market-tag {
  font-size: 0.62rem; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--dorado); margin-bottom: 0.4rem;
}
.market-stat {
  font-family: 'Anton', sans-serif;
  font-size: 1.8rem; color: #fff; line-height: 1.1;
  margin-bottom: 0.5rem;
}
.market-stat span {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.75rem; color: rgba(255,255,255,0.6);
  font-weight: 400; display: block;
}
.market-desc {
  font-size: 0.75rem; color: rgba(255,255,255,0.65);
  line-height: 1.6; margin-bottom: 0.8rem;
}
.market-pills { display: flex; flex-direction: column; gap: 0.4rem; }
.market-pill {
  font-size: 0.7rem; color: rgba(255,255,255,0.8);
  background: rgba(255,255,255,0.1);
  padding: 0.3rem 0.7rem; border-radius: 100px;
  display: inline-block; width: fit-content;
}

/* Empty state mejorado */
.empty-state {
  text-align: center; padding: 3.5rem 2rem;
  background: var(--blanco); border-radius: 16px;
  border: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
}
.empty-title {
  font-family: 'Anton', sans-serif; font-size: 1rem;
  color: #9CA3AF; letter-spacing: 0.02em;
}
.empty-sub { font-size: 0.82rem; color: #D1D5DB; margin-bottom: 0.6rem; }
/* ══ MIS INVERSIONES ══ */
.inversiones-detalle-list { display: flex; flex-direction: column; gap: 0.8rem; }
.inv-detalle-row {
  background: var(--blanco); border-radius: 14px; padding: 1.2rem 1.4rem;
  border: 1px solid var(--border); display: flex; align-items: center;
  gap: 1.5rem; cursor: pointer; transition: all 0.2s;
}
.inv-detalle-row:hover { border-color: var(--verde-mid); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.inv-detalle-left { display: flex; align-items: center; gap: 0.8rem; min-width: 180px; }
.inv-detalle-icon { font-size: 1.8rem; }
.inv-detalle-nombre { font-weight: 700; color: var(--verde); font-size: 0.9rem; }
.inv-detalle-fecha  { font-size: 0.72rem; color: var(--muted); }
.inv-detalle-center { display: flex; gap: 1.5rem; flex: 1; }
.inv-det-val { font-weight: 700; color: var(--texto); font-size: 0.9rem; display: block; }
.inv-det-val.green { color: #16a34a; }
.inv-det-lbl { font-size: 0.68rem; color: var(--muted); }
.inv-detalle-right { display: flex; flex-direction: column; gap: 0.4rem; align-items: flex-end; min-width: 140px; }
.inv-progress-mini { display: flex; align-items: center; gap: 0.5rem; width: 100%; }
.inv-ver-detalle { font-size: 0.72rem; color: var(--verde); font-weight: 600; }

/* Detalle layout */
.detalle-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.detalle-resumen-card, .detalle-animales-card {
  background: var(--blanco); border-radius: 16px; padding: 1.5rem;
  border: 1px solid var(--border);
}
.detalle-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem; }
.detalle-tag { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; color: var(--dorado); text-transform: uppercase; }
.detalle-nombre { font-family: 'Anton', sans-serif; font-size: 1.2rem; color: var(--verde); }

.detalle-stats-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 1rem; margin-bottom: 1.2rem;
}
.det-stat { background: #F9FAFB; border-radius: 10px; padding: 0.8rem; }
.det-stat-val { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--texto); }
.det-stat-val.green { color: #16a34a; }
.det-stat-lbl { font-size: 0.68rem; color: var(--muted); margin-top: 0.2rem; }

.detalle-progress { margin-bottom: 1.2rem; }
.detalle-progress-header { display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--muted); margin-bottom: 0.4rem; }
.detalle-progress-bar { height: 8px; background: #E5E7EB; border-radius: 100px; overflow: hidden; margin-bottom: 0.3rem; }
.detalle-progress-fill { height: 100%; background: var(--verde); border-radius: 100px; transition: width 1s ease; }
.detalle-progress-dates { display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--muted); }

.rentabilidad-card {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;
  background: #F0FDF4; border-radius: 12px; padding: 1rem;
}
.rent-lbl { font-size: 0.68rem; color: var(--muted); margin-bottom: 0.2rem; }
.rent-val { font-weight: 700; color: var(--texto); font-size: 0.88rem; }
.rent-val.green { color: #16a34a; }

.detalle-section-title {
  font-family: 'Anton', sans-serif; font-size: 0.95rem;
  color: var(--verde); margin-bottom: 1rem; letter-spacing: 0.02em;
}

.empty-animales {
  text-align: center; padding: 2rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
  color: var(--muted); font-size: 0.82rem;
}

.tabla-header, .tabla-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 0.5rem; padding: 0.6rem 0.4rem; font-size: 0.78rem;
}
.tabla-header { font-weight: 700; color: var(--muted); border-bottom: 1px solid var(--border); }
.tabla-row { border-bottom: 1px solid #F3F4F6; color: var(--texto); }
.tabla-row:hover { background: #F9FAFB; }

.seguimiento-lista { display: flex; flex-direction: column; gap: 0.6rem; }
.seg-item { display: flex; align-items: center; gap: 0.8rem; }
.seg-fecha { font-size: 0.72rem; color: var(--muted); min-width: 90px; }
.seg-bar-wrap { flex: 1; }
.seg-bar { height: 6px; background: #E5E7EB; border-radius: 100px; overflow: hidden; }
.seg-bar-fill { height: 100%; background: var(--verde); border-radius: 100px; }
.seg-peso { font-size: 0.78rem; font-weight: 700; color: var(--verde); min-width: 60px; text-align: right; }

.loading-state { text-align: center; padding: 3rem; color: var(--muted); }

@media (max-width: 900px) {
  .detalle-layout { grid-template-columns: 1fr; }
  .inv-detalle-row { flex-wrap: wrap; }
}
</style>