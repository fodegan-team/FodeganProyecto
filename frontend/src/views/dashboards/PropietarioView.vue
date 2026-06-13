<template>
  <div class="dashboard-root">

    <!-- ══ SIDEBAR ══ -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="/images/LogoFodegan.png" alt="FODEGAN" class="logo-img" />
        <span class="logo-sub">Fondo de Inversiones Ganadero</span>
      </div>

      <div class="sidebar-user">
        <FotoPerfil color="#5C3317" />
        <div class="user-info">
          <p class="user-name">{{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</p>
          <p class="user-rol">PROPIETARIO</p>
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

      <div class="sidebar-bottom">
        <button class="btn-logout" @click="cerrarSesion">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- ══ CONTENIDO ══ -->
    <main class="main-content">

      <!-- Header con campanita -->
      <div class="main-header">
        <div class="campana-wrap" @click="mostrarNotifs = !mostrarNotifs">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="campana-dot" v-if="visitasPendientes.length > 0">{{ visitasPendientes.length }}</span>
        </div>

        <!-- Dropdown notificaciones -->
        <div class="notif-dropdown" v-if="mostrarNotifs">
          <div class="notif-header">
            <p class="notif-titulo">Notificaciones</p>
            <button class="notif-close" @click="mostrarNotifs = false">✕</button>
          </div>
          <div class="notif-empty" v-if="visitasPendientes.length === 0">
            Sin notificaciones pendientes
          </div>
          <div class="notif-item" v-for="v in visitasPendientes" :key="v.id">
            <div class="notif-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="notif-info">
              <p class="notif-txt">Visita de Dr. {{ v.zootecnista_nombre }}</p>
              <p class="notif-fecha">{{ formatFecha(v.fecha_visita) }} · {{ tipoLabel(v.tipo) }}</p>
              <div class="notif-btns">
                <button class="btn-confirmar-visita" @click="confirmarVisita(v.id); mostrarNotifs = false">✓ Confirmar</button>
                <button class="btn-rechazar-visita" @click="rechazarVisita(v.id); mostrarNotifs = false">✗ Rechazar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ INICIO ══ -->
      <section v-if="seccionActiva === 'inicio'" class="seccion">
        <div class="page-header">
          <div>
            <h1 class="page-title">Inicio</h1>
            <p class="page-sub">Hola, {{ auth.usuario?.nombre }}</p>
          </div>
        </div>

        <!-- Banner finca -->
        <div class="finca-banner" v-if="dashData.finca">
          <div class="banner-left">
            <div>
              <h2 class="banner-nombre">{{ dashData.finca.nombre_real }}</h2>
              <p class="banner-ubicacion">{{ dashData.finca.ubicacion }}</p>
            </div>
          </div>
          <div class="banner-stats">
            <div class="banner-stat">
              <span class="bstat-val">{{ dashData.finca.hectareas }}</span>
              <span class="bstat-lbl">Hectáreas</span>
            </div>
            <div class="banner-stat-sep"/>
            <div class="banner-stat">
              <span class="bstat-val">{{ dashData.finca.capacidad_disponible }}/{{ dashData.finca.capacidad_total }}</span>
              <span class="bstat-lbl">Capacidad</span>
            </div>
            <div class="banner-stat-sep"/>
            <div class="banner-stat">
              <span class="bstat-val">{{ dashData.stats?.inversiones_activas || 0 }}</span>
              <span class="bstat-lbl">Inversiones</span>
            </div>
          </div>
        </div>

        <!-- Inversores activos -->
        <div class="section-title-row">
          <h3 class="section-title">Inversores Activos</h3>
        </div>

        <div class="empty-state" v-if="dashData.inversiones?.length === 0">
          <p class="empty-title">Sin inversiones activas</p>
          <p class="empty-sub">Cuando el admin apruebe una inversión aparecerá aquí</p>
        </div>

        <div class="inversores-grid" v-else>
          <div class="inversor-card" v-for="inv in dashData.inversiones" :key="inv.id">
            <div class="inv-card-header">
              <div>
                <p class="inv-codigo">{{ inv.inversor_codigo }}</p>
                <p class="inv-monto">Inversión: {{ formatCOP(inv.monto_cop) }}</p>
              </div>
              <div class="inv-animales-badge">{{ inv.cantidad_animales }}</div>
            </div>
            <div class="inv-card-body">
              <div class="inv-stat-row">
                <div class="inv-stat">
                  <p class="inv-stat-lbl">Peso Ganado</p>
                  <p class="inv-stat-val">{{ parseFloat(inv.peso_ganado_total || 0).toFixed(0) }} kg</p>
                </div>
                <div class="inv-stat">
                  <p class="inv-stat-lbl">Tu Ganancia (40%)</p>
                  <p class="inv-stat-val dorado">{{ formatCOP(inv.ganancia_propietario) }}</p>
                </div>
              </div>
              <div class="inv-progress-wrap">
                <div class="inv-progress-bar">
                  <div class="inv-progress-fill" :style="{ width: Math.min(inv.progreso || 0, 100) + '%' }" />
                </div>
                <span>{{ Math.min(inv.progreso || 0, 100) }}%</span>
              </div>
              <p class="inv-dias">{{ Math.max(inv.dias_restantes, 0) }} días restantes</p>
            </div>
          </div>
        </div>

        <!-- Stats generales -->
        <div class="stats-grid-prop" v-if="dashData.stats">
          <!-- stat-prop blanco animales -->
          <div class="stat-prop blanco">
            <div class="stat-prop-icon-svg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <p class="stat-prop-tag">ANIMALES ACTIVOS</p>
            <p class="stat-prop-num">{{ dashData.stats.total_animales }}</p>
            <p class="stat-prop-sub">asignadas</p>
          </div>
          <!-- stat-prop blanco capacidad -->
          <div class="stat-prop blanco">
            <div class="stat-prop-icon-svg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <p class="stat-prop-tag">CAPACIDAD</p>
            <p class="stat-prop-num">{{ dashData.stats.capacidad_total }}</p>
            <p class="stat-prop-sub">en total</p>
          </div>
          <div class="stat-prop cafe">
            <p class="stat-prop-tag claro">GANANCIA ESTIMADA</p>
            <p class="stat-prop-num grande">{{ formatCOP(dashData.stats.ganancia_total) }}</p>
            <p class="stat-prop-sub claro">del 40% ganado</p>
          </div>
          <div class="stat-prop blanco">
            <p class="stat-prop-tag">TIEMPO RESTANTE</p>
            <p class="stat-prop-num">{{ diasAMeses(dashData.stats.dias_restantes) }}</p>
            <p class="stat-prop-sub">para vencida</p>
          </div>
        </div>
      </section>

      <!-- ══ INVERSIONES ══ -->
      <section v-if="seccionActiva === 'inversiones'" class="seccion">
        <div class="page-header">
          <h1 class="page-title">Inversiones</h1>
        </div>

        <div class="empty-state" v-if="dashData.inversiones?.length === 0">
          <p class="empty-title">Sin inversiones activas</p>
        </div>

        <div v-else>
          <!-- Tabs por inversor -->
          <div class="inv-tabs">
            <button v-for="inv in dashData.inversiones" :key="inv.id"
              class="inv-tab" :class="{ active: inversionActiva?.id === inv.id }"
              @click="seleccionarInversion(inv)">
              <span class="inv-tab-codigo">{{ inv.inversor_codigo }}</span>
              <span class="inv-tab-info">{{ inv.cantidad_animales }} animales · {{ formatCOP(inv.monto_cop) }}</span>
            </button>
          </div>

          <!-- Detalle de la inversión seleccionada -->
          <div v-if="inversionActiva">
            <!-- Tabla de animales -->
            <div class="registro-card">
              <div class="registro-header">
                <div>
                  <h3 class="registro-titulo">Registro de Ganado</h3>
                  <p class="registro-sub">Información detallada de cada animal - {{ inversionActiva.inversor_codigo }}</p>
                </div>
              </div>

              <div class="tabla-animales">
                <div class="ta-header">
                  <span>Código</span>
                  <span>Peso Inicial</span>
                  <span>Peso Actual</span>
                  <span>Estado</span>
                  <span>Fecha</span>
                </div>
                <div class="ta-row" v-for="animal in animalesInversion" :key="animal.id">
                  <span class="ta-codigo">{{ animal.codigo }}</span>
                  <span>{{ animal.peso_inicial }} kg</span>
                  <span class="ta-peso">{{ animal.ultimo_peso || animal.peso_inicial }} kg</span>
                  <span>
                    <span class="estado-animal-badge" :class="animal.ultimo_estado || animal.estado_actual">
                      {{ estadoLabel(animal.ultimo_estado || animal.estado_actual) }}
                    </span>
                  </span>
                  <span class="ta-fecha">{{ animal.fecha_ultimo_peso ? formatFecha(animal.fecha_ultimo_peso) : '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Reportes del zootecnista -->
            <div class="reportes-card" v-if="reportesInversion.length > 0">
              <div class="registro-header">
                <div>
                  <h3 class="registro-titulo">Observaciones del Zootecnista</h3>
                  <p class="registro-sub">Registro de actividades y revisiones - {{ inversionActiva.inversor_codigo }}</p>
                </div>
              </div>

              <div class="reporte-item" v-for="rep in reportesInversion" :key="rep.id">
                <div class="reporte-icon" :class="tipoColor(rep.tipo_revision)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div class="reporte-info">
                  <div class="reporte-header-row">
                    <div>
                      <p class="reporte-tipo">{{ tipoLabel(rep.tipo_revision) }}</p>
                      <p class="reporte-zoo">Dr. {{ rep.zootecnista_nombre }}</p>
                    </div>
                    <span class="reporte-fecha">{{ formatFecha(rep.created_at) }}</span>
                  </div>
                  <p class="reporte-obs">{{ rep.observaciones }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══ GANANCIAS ══ -->
      <section v-if="seccionActiva === 'ganancias'" class="seccion">
        <div class="page-header">
          <h1 class="page-title">Ganancias</h1>
        </div>

        <div class="ganancias-layout">
          <div class="ganancia-card cafe">
            <p class="gc-tag">TU GANANCIA TOTAL (40%)</p>
            <p class="gc-val">{{ formatCOP(dashData.stats?.ganancia_total || 0) }}</p>
            <p class="gc-sub">Basado en el peso ganado actual</p>
          </div>

          <div class="distribucion-card">
            <h3 class="dist-titulo">Distribución de Ganancias</h3>
            <p class="dist-sub">Modelo de negocio FODEGAN</p>

            <div class="dist-item">
              <div class="dist-bar-wrap">
                <div class="dist-label">
                  <span>Propietario (Tú)</span>
                  <span class="dist-pct cafe-txt">40%</span>
                </div>
                <div class="dist-bar"><div class="dist-fill cafe-bg" style="width: 40%" /></div>
              </div>
            </div>
            <div class="dist-item">
              <div class="dist-bar-wrap">
                <div class="dist-label">
                  <span>Inversionista</span>
                  <span class="dist-pct verde-txt">25%</span>
                </div>
                <div class="dist-bar"><div class="dist-fill verde-bg" style="width: 25%" /></div>
              </div>
            </div>
            <div class="dist-item">
              <div class="dist-bar-wrap">
                <div class="dist-label">
                  <span>FODEGAN (Admin)</span>
                  <span class="dist-pct gris-txt">25%</span>
                </div>
                <div class="dist-bar"><div class="dist-fill gris-bg" style="width: 25%" /></div>
              </div>
            </div>
            <div class="dist-item">
              <div class="dist-bar-wrap">
                <div class="dist-label">
                  <span>Reserva operacional</span>
                  <span class="dist-pct dorado-txt">10%</span>
                </div>
                <div class="dist-bar"><div class="dist-fill dorado-bg" style="width: 10%" /></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Historial -->
        <div class="section-title-row" style="margin-top: 2rem;">
          <h3 class="section-title">Historial de Inversiones</h3>
        </div>
        <div class="empty-state" v-if="historial.length === 0">
          <p class="empty-title">Sin historial</p>
        </div>
        <div class="tabla-container" v-else>
          <table class="tabla">
            <thead>
              <tr>
                <th>Inversor</th><th>Monto</th><th>Animales</th>
                <th>Ciclo</th><th>Inicio</th><th>Fin</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historial" :key="h.id">
                <td>{{ h.inversor_codigo }}</td>
                <td>{{ formatCOP(h.monto_cop) }}</td>
                <td>{{ h.cantidad_animales }}</td>
                <td>{{ h.dias_ciclo }}d</td>
                <td>{{ formatFecha(h.fecha_inicio_ciclo) }}</td>
                <td>{{ formatFecha(h.fecha_fin_ciclo) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ══ VISITAS ══ -->
      <section v-if="seccionActiva === 'visitas'" class="seccion">
        <div class="page-header">
          <h1 class="page-title">Visitas Programadas</h1>
          <p class="page-sub">Confirma o rechaza las visitas del zootecnista</p>
        </div>

        <div class="empty-state" v-if="misVisitas.length === 0">
          <p class="empty-title">Sin visitas programadas</p>
        </div>

        <div class="visitas-lista" v-else>
          <div class="visita-row" v-for="v in misVisitas" :key="v.id">
            <div class="vr-fecha-box" :class="tipoColor(v.tipo)">
              <span class="vr-dia">{{ formatDia(v.fecha_visita) }}</span>
              <span class="vr-mes">{{ formatMes(v.fecha_visita) }}</span>
            </div>
            <div class="vr-info">
              <p class="vr-zoo">Dr. {{ v.zootecnista_nombre }}</p>
              <p class="vr-tipo">{{ tipoLabel(v.tipo) }} · {{ formatHora(v.fecha_visita) }}</p>
            </div>
            <span class="vr-estado" :class="v.estado">{{ estadoVisitaLabel(v.estado) }}</span>
            <div class="vr-acciones" v-if="v.estado === 'pendiente'">
              <button class="btn-confirmar-visita" @click="confirmarVisita(v.id)">✓ Confirmar</button>
              <button class="btn-rechazar-visita" @click="rechazarVisita(v.id)">✗ Rechazar</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ══ MI FINCA ══ -->
      <section v-if="seccionActiva === 'finca'" class="seccion">
        <div class="page-header">
          <h1 class="page-title">Mi Finca</h1>
          <p class="page-sub">Hola, {{ auth.usuario?.nombre }}</p>
        </div>

        <div v-if="miFinca">
          <!-- Banner finca -->
          <div class="mf-banner">
            <div class="mf-banner-info">
              <h2 class="mf-nombre">{{ miFinca.nombre_real }}</h2>
              <p class="mf-ubicacion">{{ miFinca.ubicacion }}</p>
            </div>
            <div class="mf-banner-stats">
              <div class="mf-stat">
                <p class="mf-stat-lbl">Hectáreas</p>
                <p class="mf-stat-val">{{ miFinca.hectareas }}</p>
              </div>
              <div class="mf-stat">
                <p class="mf-stat-lbl">Capacidad</p>
                <p class="mf-stat-val">{{ miFinca.capacidad_total }}</p>
              </div>
              <div class="mf-stat">
                <p class="mf-stat-lbl">Duración</p>
                <p class="mf-stat-val">6m</p>
              </div>
            </div>
          </div>

          <!-- Datos editables -->
          <div class="edit-card">
            <h3 class="edit-titulo">Información de la Finca</h3>
            <div class="edit-form">
              <div class="edit-row">
                <div class="edit-group">
                  <label>Nombre de la Finca</label>
                  <input v-model="miFinca.nombre_real" type="text" class="edit-input" />
                </div>
                <div class="edit-group">
                  <label>Ubicación</label>
                  <input v-model="miFinca.ubicacion" type="text" class="edit-input" />
                </div>
              </div>
              <div class="edit-row">
                <div class="edit-group">
                  <label>Hectáreas</label>
                  <input v-model="miFinca.hectareas" type="number" class="edit-input" />
                </div>
                <div class="edit-group">
                  <label>Capacidad de Animales</label>
                  <input v-model="miFinca.capacidad_total" type="number" class="edit-input" />
                </div>
              </div>
            </div>

            <h3 class="edit-titulo" style="margin-top: 1.5rem;">Mis Datos</h3>
            <div class="edit-form">
              <div class="edit-row">
                <div class="edit-group">
                  <label>Nombre</label>
                  <input v-model="perfilForm.nombre" type="text" class="edit-input" />
                </div>
                <div class="edit-group">
                  <label>Apellido</label>
                  <input v-model="perfilForm.apellido" type="text" class="edit-input" />
                </div>
              </div>
              <div class="edit-row">
                <div class="edit-group">
                  <label>Teléfono</label>
                  <input v-model="perfilForm.telefono" type="tel" class="edit-input" />
                </div>
                <div class="edit-group">
                  <label>Ciudad</label>
                  <input v-model="perfilForm.ciudad" type="text" class="edit-input" />
                </div>
              </div>
              <div class="edit-group">
                <label>Correo (no editable)</label>
                <input :value="auth.usuario?.email" type="text" class="edit-input" disabled />
              </div>
            </div>

            <div class="alert-success" v-if="exitoPerfil">{{ exitoPerfil }}</div>
            <button class="btn-guardar-perfil" @click="guardarPerfil">Guardar cambios</button>
          </div>

          <!-- Documentos -->
          <div class="docs-grid">
            <!-- Contrato firmado -->
            <div class="doc-card">
              <div class="doc-card-header cafe">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <h4>Contrato Firmado</h4>
              </div>
              <div class="doc-card-body">
                <p class="doc-desc">Sube el contrato firmado con FODEGAN para verificar tu vinculación.</p>
                <div class="doc-upload" @click="$refs.contratoInput.click()">
                  <div v-if="miFinca.contrato_url" class="doc-uploaded">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <p>Contrato cargado</p>
                    <span class="doc-change">Cambiar archivo</span>
                  </div>
                  <div v-else class="doc-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p>Toca para subir el contrato</p>
                    <span class="doc-format">PDF, JPG o PNG</span>
                  </div>
                  <input ref="contratoInput" type="file" accept=".pdf,image/*" @change="subirContrato" style="display:none"/>
                </div>
                <div class="alert-success" v-if="exitoContrato">{{ exitoContrato }}</div>
              </div>
            </div>

            <!-- Escrituras -->
            <div class="doc-card">
              <div class="doc-card-header oscuro">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <h4>Escrituras de la Finca</h4>
              </div>
              <div class="doc-card-body">
                <p class="doc-desc">Sube las escrituras de tu propiedad para confirmar que eres el dueño.</p>
                <div class="doc-upload" @click="$refs.escriturasInput.click()">
                  <div v-if="miFinca.escrituras_url" class="doc-uploaded">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <p>Escrituras cargadas</p>
                    <span class="doc-change">Cambiar archivo</span>
                  </div>
                  <div v-else class="doc-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p>Toca para subir las escrituras</p>
                    <span class="doc-format">PDF, JPG o PNG</span>
                  </div>
                  <input ref="escriturasInput" type="file" accept=".pdf,image/*" @change="subirEscrituras" style="display:none"/>
                </div>
                <div class="alert-success" v-if="exitoEscrituras">{{ exitoEscrituras }}</div>
              </div>
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
import FotoPerfil from '@/components/FotoPerfil.vue'

const router  = useRouter()
const auth    = useAuthStore()
const API     = 'http://localhost:3000/api'
const headers = computed(() => ({ Authorization: `Bearer ${auth.token}` }))

const seccionActiva  = ref('inicio')
const dashData       = ref({ finca: null, inversiones: [], stats: {} })
const animalesInversion = ref([])
const reportesInversion = ref([])
const inversionActiva   = ref(null)
const misVisitas        = ref([])
const historial         = ref([])
const miFinca           = ref(null)
const exitoContrato     = ref('')
const exitoEscrituras   = ref('')
const perfilForm = ref({ nombre: auth.usuario?.nombre || '', apellido: auth.usuario?.apellido || '', telefono: '', ciudad: '' })
const exitoPerfil = ref('')
const mostrarNotifs = ref(false)
const visitasPendientes = computed(() => misVisitas.value.filter(v => v.estado === 'pendiente'))


const navItems = computed(() => [
  { id: 'inicio',      label: 'Inicio',      badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id: 'inversiones', label: 'Inversiones', badge: dashData.value.inversiones?.length || 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>` },
  { id: 'visitas',     label: 'Visitas',     badge: misVisitas.value.filter(v => v.estado === 'pendiente').length, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { id: 'finca',       label: 'Mi Finca',    badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
])

// ── Helpers ───────────────────────────────────────
function formatCOP(val) {
  if (!val) return '$0'
  return '$' + Math.round(val).toLocaleString('es-CO')
}
function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatDia(f)  { return new Date(f).getDate() }
function formatMes(f)  { return new Date(f).toLocaleDateString('es-CO', { month: 'short' }).toUpperCase() }
function formatHora(f) { return new Date(f).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }
function diasAMeses(dias) {
  if (!dias) return '0 días'
  if (dias >= 30) return `${Math.floor(dias/30)} mes${Math.floor(dias/30) > 1 ? 'es' : ''}`
  return `${dias} días`
}
function tipoLabel(tipo) {
  const map = { pesaje: 'Pesaje', vacunacion: 'Vacunación', revision: 'Revisión', control_sanitario: 'Control Sanitario', control_peso: 'Control de Peso', revision_general: 'Revisión General' }
  return map[tipo] || tipo
}
function tipoColor(tipo) {
  const map = { pesaje: 'azul', vacunacion: 'verde', revision: 'cyan', control_sanitario: 'naranja', control_peso: 'azul', revision_general: 'cyan' }
  return map[tipo] || 'cafe'
}
function estadoLabel(estado) {
  const map = { buen_estado: 'Saludable', excelente: 'Excelente', enfermo: 'Enfermo', mal_estado: 'Mal estado' }
  return map[estado] || estado || '—'
}
function estadoVisitaLabel(estado) {
  const map = { pendiente: 'Pendiente', confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada' }
  return map[estado] || estado
}

// ── Acciones ──────────────────────────────────────
async function seleccionarInversion(inv) {
  inversionActiva.value = inv
  try {
    const [animalesRes, reportesRes] = await Promise.all([
      axios.get(`${API}/propietario/inversiones/${inv.id}/animales`, { headers: headers.value }),
      axios.get(`${API}/propietario/inversiones/${inv.id}/reportes`, { headers: headers.value })
    ])
    animalesInversion.value = animalesRes.data
    reportesInversion.value = reportesRes.data
  } catch {}
}

async function confirmarVisita(id) {
  try {
    await axios.put(`${API}/propietario/visitas/${id}/confirmar`, {}, { headers: headers.value })
    await cargarVisitas()
  } catch {}
}

async function rechazarVisita(id) {
  try {
    await axios.put(`${API}/propietario/visitas/${id}/rechazar`, {}, { headers: headers.value })
    await cargarVisitas()
  } catch {}
}

async function subirContrato(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      await axios.post(`${API}/propietario/documento`, {
        tipo:            'contrato',
        documento_base64: ev.target.result
      }, { headers: headers.value })
      exitoContrato.value = '✓ Contrato subido correctamente'
      await cargarMiFinca()
      setTimeout(() => { exitoContrato.value = '' }, 3000)
    } catch {}
  }
  reader.readAsDataURL(file)
}

async function subirEscrituras(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    try {
      await axios.post(`${API}/propietario/documento`, {
        tipo:            'escrituras',
        documento_base64: ev.target.result
      }, { headers: headers.value })
      exitoEscrituras.value = '✓ Escrituras subidas correctamente'
      await cargarMiFinca()
      setTimeout(() => { exitoEscrituras.value = '' }, 3000)
    } catch {}
  }
  reader.readAsDataURL(file)
}

async function cargarDashboard() {
  try {
    const { data } = await axios.get(`${API}/propietario/dashboard`, { headers: headers.value })
    dashData.value = data
    if (data.inversiones?.length > 0) seleccionarInversion(data.inversiones[0])
  } catch {}
}

async function cargarVisitas() {
  try {
    const { data } = await axios.get(`${API}/propietario/visitas`, { headers: headers.value })
    misVisitas.value = data
  } catch {}
}

async function cargarMiFinca() {
  try {
    const { data } = await axios.get(`${API}/propietario/finca`, { headers: headers.value })
    miFinca.value = data
  } catch {}
}

async function cargarHistorial() {
  try {
    const { data } = await axios.get(`${API}/propietario/historial`, { headers: headers.value })
    historial.value = data
  } catch {}
}

async function guardarPerfil() {
  try {
    await Promise.all([
      axios.put(`${API}/auth/perfil`, perfilForm.value, { headers: headers.value }),
      axios.put(`${API}/propietario/finca`, {
        nombre_real:     miFinca.value.nombre_real,
        ubicacion:       miFinca.value.ubicacion,
        hectareas:       miFinca.value.hectareas,
        capacidad_total: miFinca.value.capacidad_total
      }, { headers: headers.value })
    ])
    exitoPerfil.value = '✓ Datos actualizados correctamente'
    await cargarMiFinca()
    setTimeout(() => { exitoPerfil.value = '' }, 3000)
  } catch {
    exitoPerfil.value = '✗ Error al guardar'
  }
}

async function cerrarSesion() {
  await auth.logout()
  router.push('/')
}

onMounted(() => {
  cargarDashboard()
  cargarVisitas()
  cargarMiFinca()
  cargarHistorial()
})
</script>

<style scoped>
.dashboard-root {
  --cafe:      #5C3317;
  --cafe-mid:  #7B4A22;
  --cafe-cl:   #F5E6D3;
  --dorado:    #C8952A;
  --dorado-cl: #FEF3C7;
  --crema:     #FAF7F2;
  --blanco:    #FFFFFF;
  --texto:     #1A1A1A;
  --muted:     #6B7280;
  --border:    #E5E7EB;

  display: flex; min-height: 100vh;
  background: var(--crema);
  font-family: 'Open Sans', sans-serif;
}

/* SIDEBAR */
.sidebar {
  width: 240px; flex-shrink: 0;
  background: #2C1810;
  display: flex; flex-direction: column;
  padding: 1.4rem 1rem;
  position: sticky; top: 0; height: 100vh;
  box-shadow: 4px 0 24px rgba(0,0,0,0.2);
}
.sidebar-logo { margin-bottom: 1.5rem; }
.logo-text {
  font-family: 'Anton', sans-serif; font-size: 1.1rem;
  letter-spacing: 0.2em; color: var(--dorado);
  display: block; line-height: 1;
}
.logo-sub { font-size: 0.52rem; color: rgba(255,255,255,0.35); letter-spacing: 0.06em; }

.sidebar-user {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.8rem; border-radius: 12px;
  background: rgba(255,255,255,0.07); margin-bottom: 1.5rem;
}
.user-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--dorado); color: #fff;
  font-family: 'Anton', sans-serif; font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.user-name { font-size: 0.78rem; font-weight: 600; color: #fff; }
.user-rol  { font-size: 0.6rem; color: var(--dorado); letter-spacing: 0.1em; font-weight: 600; }

.sidebar-nav { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; }
.nav-item {
  all: unset; cursor: pointer;
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.7rem 0.9rem; border-radius: 10px;
  font-size: 0.83rem; color: rgba(255,255,255,0.6);
  transition: all 0.2s; -webkit-user-select: none; user-select: none;
}
.nav-item:hover  { background: rgba(255,255,255,0.07); color: #fff; }
.nav-item.active { background: var(--cafe); color: #fff; font-weight: 600; }
.nav-icon { flex-shrink: 0; display: flex; }
.nav-label { flex: 1; }
.nav-badge {
  background: var(--dorado); color: #fff;
  font-size: 0.65rem; font-weight: 700;
  padding: 0.1rem 0.45rem; border-radius: 100px; min-width: 18px; text-align: center;
}

.sidebar-bottom { display: flex; flex-direction: column; gap: 0.3rem; }
.btn-config, .btn-logout {
  all: unset; cursor: pointer;
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.65rem 0.9rem; border-radius: 10px;
  font-size: 0.8rem; color: rgba(255,255,255,0.4); transition: all 0.2s;
}
.btn-config:hover { color: #fff; background: rgba(255,255,255,0.07); }
.btn-logout:hover { color: #fff; background: rgba(220,38,38,0.2); }

/* MAIN */
.main-content { flex: 1; overflow-y: auto; }
.seccion { padding: 2rem; }
.page-header { margin-bottom: 1.8rem; }
.page-title { font-family: 'Anton', sans-serif; font-size: 1.6rem; color: var(--cafe); letter-spacing: 0.02em; }
.page-sub   { font-size: 0.82rem; color: var(--muted); margin-top: 0.2rem; }

/* Banner finca */
.finca-banner {
  background: linear-gradient(135deg, #2C1810, #5C3317);
  border-radius: 16px; padding: 1.5rem 2rem;
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 2rem; gap: 1.5rem;
}
.banner-left { display: flex; align-items: center; gap: 1rem; color: #fff; }
.banner-icon { font-size: 2.5rem; }
.banner-nombre   { font-family: 'Anton', sans-serif; font-size: 1.4rem; color: #fff; }
.banner-ubicacion { font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-top: 0.2rem; }
.banner-stats    { display: flex; align-items: center; gap: 1.5rem; }
.banner-stat     { text-align: center; }
.bstat-val { font-family: 'Anton', sans-serif; font-size: 1.3rem; color: var(--dorado); display: block; }
.bstat-lbl { font-size: 0.65rem; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.08em; }
.banner-stat-sep { width: 1px; height: 32px; background: rgba(255,255,255,0.15); }

/* Section title */
.section-title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.section-title { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--cafe); letter-spacing: 0.02em; }

/* Inversores grid */
.inversores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap: 1rem; margin-bottom: 2rem; }
.inversor-card {
  background: var(--blanco); border-radius: 14px; padding: 1.2rem;
  border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.inv-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem; }
.inv-codigo { font-family: 'Anton', sans-serif; font-size: 0.95rem; color: var(--cafe); }
.inv-monto  { font-size: 0.75rem; color: var(--muted); margin-top: 0.1rem; }
.inv-animales-badge {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--dorado); color: #fff;
  font-family: 'Anton', sans-serif; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
}
.inv-stat-row { display: flex; gap: 1.5rem; margin-bottom: 0.8rem; }
.inv-stat-lbl { font-size: 0.68rem; color: var(--muted); margin-bottom: 0.2rem; }
.inv-stat-val { font-weight: 700; color: var(--texto); font-size: 0.9rem; }
.inv-stat-val.dorado { color: var(--dorado); }
.inv-progress-wrap { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.3rem; }
.inv-progress-bar  { flex: 1; height: 5px; background: #E5E7EB; border-radius: 100px; overflow: hidden; }
.inv-progress-fill { height: 100%; background: var(--cafe); border-radius: 100px; }
.inv-dias { font-size: 0.72rem; color: var(--muted); }

/* Stats propietario */
.stats-grid-prop {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 1.5rem;
}
.stat-prop { border-radius: 14px; padding: 1.2rem; }
.stat-prop.blanco { background: var(--blanco); border: 1px solid var(--border); }
.stat-prop.cafe   { background: var(--cafe); }
.stat-prop-icon   { font-size: 1.5rem; margin-bottom: 0.4rem; }
.stat-prop-tag    { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.3rem; }
.stat-prop-tag.claro { color: rgba(255,255,255,0.6); }
.stat-prop-num    { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: var(--texto); }
.stat-prop-num.grande { font-size: 1.8rem; color: var(--dorado); }
.stat-prop-sub    { font-size: 0.7rem; color: var(--muted); margin-top: 0.2rem; }
.stat-prop-sub.claro { color: rgba(255,255,255,0.5); }

/* Tabs inversión */
.inv-tabs { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.inv-tab {
  all: unset; cursor: pointer;
  display: flex; flex-direction: column;
  padding: 0.7rem 1.2rem; border-radius: 10px;
  border: 2px solid var(--border); background: var(--blanco);
  transition: all 0.2s; -webkit-user-select: none; user-select: none;
}
.inv-tab:hover { border-color: var(--cafe-mid); }
.inv-tab.active { background: var(--cafe); border-color: var(--cafe); }
.inv-tab-codigo { font-family: 'Anton', sans-serif; font-size: 0.88rem; color: var(--cafe); }
.inv-tab.active .inv-tab-codigo { color: var(--dorado); }
.inv-tab-info { font-size: 0.7rem; color: var(--muted); margin-top: 0.1rem; }
.inv-tab.active .inv-tab-info { color: rgba(255,255,255,0.7); }

/* Tabla animales */
.registro-card {
  background: var(--blanco); border-radius: 14px;
  border: 1px solid var(--border); overflow: hidden; margin-bottom: 1.5rem;
}
.registro-header { background: var(--cafe-cl); padding: 1rem 1.4rem; border-bottom: 1px solid var(--border); }
.registro-titulo { font-family: 'Anton', sans-serif; font-size: 1rem; color: var(--cafe); }
.registro-sub    { font-size: 0.75rem; color: var(--cafe-mid); margin-top: 0.2rem; }

.tabla-animales { width: 100%; }
.ta-header, .ta-row { display: grid; grid-template-columns: 100px 120px 120px 130px 120px; gap: 1rem; padding: 0.8rem 1.4rem; font-size: 0.82rem; align-items: center; }
.ta-header { background: var(--cafe); color: rgba(255,255,255,0.8); font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; }
.ta-row { border-bottom: 1px solid #F3F4F6; }
.ta-row:last-child { border-bottom: none; }
.ta-row:hover { background: var(--cafe-cl); }
.ta-codigo { font-weight: 700; color: var(--cafe); font-family: monospace; }
.ta-peso   { font-weight: 700; color: var(--texto); }
.ta-fecha  { font-size: 0.75rem; color: var(--muted); }

.estado-animal-badge {
  font-size: 0.72rem; font-weight: 600;
  padding: 0.25rem 0.7rem; border-radius: 100px; display: inline-block;
}
.estado-animal-badge.buen_estado { background: var(--cafe-cl); color: var(--cafe); }
.estado-animal-badge.excelente   { background: #D1FAE5; color: #065F46; }
.estado-animal-badge.enfermo     { background: #FEF3C7; color: #92400E; }
.estado-animal-badge.mal_estado  { background: #FEE2E2; color: #991B1B; }

/* Reportes */
.reportes-card { background: var(--blanco); border-radius: 14px; border: 1px solid var(--border); overflow: hidden; }
.reporte-item { display: flex; gap: 1rem; padding: 1rem 1.4rem; border-bottom: 1px solid #F3F4F6; }
.reporte-item:last-child { border-bottom: none; }
.reporte-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #fff; }
.reporte-icon.azul    { background: #2563EB; }
.reporte-icon.verde   { background: #16A34A; }
.reporte-icon.cyan    { background: #0891B2; }
.reporte-icon.naranja { background: #D97706; }
.reporte-icon.cafe    { background: var(--cafe); }
.reporte-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem; }
.reporte-tipo  { font-weight: 700; color: var(--texto); font-size: 0.88rem; }
.reporte-zoo   { font-size: 0.72rem; color: var(--muted); }
.reporte-fecha { font-size: 0.72rem; color: var(--muted); flex-shrink: 0; }
.reporte-obs   { font-size: 0.82rem; color: var(--texto); line-height: 1.6; }

/* Ganancias */
.ganancias-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.ganancia-card { border-radius: 16px; padding: 2rem; }
.ganancia-card.cafe { background: linear-gradient(135deg, #2C1810, var(--cafe)); }
.gc-tag { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; color: rgba(255,255,255,0.6); text-transform: uppercase; margin-bottom: 0.5rem; }
.gc-val { font-family: 'Anton', sans-serif; font-size: 2rem; color: var(--dorado); margin-bottom: 0.3rem; }
.gc-sub { font-size: 0.78rem; color: rgba(255,255,255,0.5); }

.distribucion-card { background: var(--blanco); border-radius: 16px; padding: 1.5rem; border: 1px solid var(--border); }
.dist-titulo { font-family: 'Anton', sans-serif; font-size: 1rem; color: var(--cafe); margin-bottom: 0.2rem; }
.dist-sub    { font-size: 0.75rem; color: var(--muted); margin-bottom: 1.2rem; }
.dist-item   { margin-bottom: 1rem; }
.dist-label  { display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--texto); margin-bottom: 0.4rem; }
.dist-pct    { font-weight: 700; }
.cafe-txt    { color: var(--cafe); }
.verde-txt   { color: #16A34A; }
.gris-txt    { color: #374151; }
.dorado-txt  { color: var(--dorado); }
.dist-bar    { height: 8px; background: #F3F4F6; border-radius: 100px; overflow: hidden; }
.dist-fill   { height: 100%; border-radius: 100px; transition: width 1s ease; }
.cafe-bg     { background: var(--cafe); }
.verde-bg    { background: #16A34A; }
.gris-bg     { background: #374151; }
.dorado-bg   { background: var(--dorado); }

/* Visitas */
.visitas-lista { display: flex; flex-direction: column; gap: 0.8rem; }
.visita-row {
  background: var(--blanco); border-radius: 12px; padding: 1rem 1.4rem;
  border: 1px solid var(--border); display: flex; align-items: center; gap: 1rem;
}
.vr-fecha-box {
  width: 50px; height: 56px; border-radius: 10px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  flex-shrink: 0; color: #fff;
}
.vr-fecha-box.azul    { background: #2563EB; }
.vr-fecha-box.verde   { background: #16A34A; }
.vr-fecha-box.cyan    { background: #0891B2; }
.vr-fecha-box.naranja { background: #D97706; }
.vr-fecha-box.cafe    { background: var(--cafe); }
.vr-dia { font-family: 'Anton', sans-serif; font-size: 1.3rem; line-height: 1; }
.vr-mes { font-size: 0.6rem; opacity: 0.8; text-transform: uppercase; }
.vr-info { flex: 1; }
.vr-zoo  { font-weight: 700; color: var(--texto); font-size: 0.88rem; }
.vr-tipo { font-size: 0.72rem; color: var(--muted); margin-top: 0.1rem; }
.vr-estado {
  font-size: 0.72rem; font-weight: 600;
  padding: 0.3rem 0.8rem; border-radius: 100px; flex-shrink: 0;
}
.vr-estado.pendiente  { background: #FEF3C7; color: #92400E; }
.vr-estado.confirmada { background: #D1FAE5; color: #065F46; }
.vr-estado.cancelada  { background: #FEE2E2; color: #991B1B; }
.vr-estado.completada { background: #F3F4F6; color: #374151; }
.vr-acciones { display: flex; gap: 0.4rem; }
.btn-confirmar-visita {
  all: unset; cursor: pointer;
  background: #D1FAE5; color: #065F46;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.35rem 0.8rem; border-radius: 6px; transition: background 0.2s;
}
.btn-confirmar-visita:hover { background: #A7F3D0; }
.btn-rechazar-visita {
  all: unset; cursor: pointer;
  background: #FEE2E2; color: #991B1B;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.35rem 0.8rem; border-radius: 6px; transition: background 0.2s;
}
.btn-rechazar-visita:hover { background: #FECACA; }

/* Mi finca */
.mf-banner {
  background: linear-gradient(135deg, #2C1810, var(--cafe));
  border-radius: 16px; padding: 1.5rem 2rem;
  display: flex; align-items: center; gap: 1.5rem;
  margin-bottom: 1.5rem; color: #fff;
}
.mf-banner-icon { font-size: 2.5rem; flex-shrink: 0; }
.mf-banner-info { flex: 1; }
.mf-nombre    { font-family: 'Anton', sans-serif; font-size: 1.3rem; color: #fff; }
.mf-ubicacion { font-size: 0.78rem; color: rgba(255,255,255,0.6); margin-top: 0.2rem; }
.mf-banner-stats { display: flex; gap: 2rem; flex-shrink: 0; }
.mf-stat-lbl { font-size: 0.65rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; }
.mf-stat-val { font-family: 'Anton', sans-serif; font-size: 1.3rem; color: var(--dorado); }

/* Documentos */
.docs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.doc-card { background: var(--blanco); border-radius: 14px; border: 1px solid var(--border); overflow: hidden; }
.doc-card-header {
  display: flex; align-items: center; gap: 0.8rem;
  padding: 1rem 1.2rem; color: #fff;
}
.doc-card-header.cafe   { background: var(--cafe); }
.doc-card-header.oscuro { background: #2C1810; }
.doc-card-header h4 { font-family: 'Anton', sans-serif; font-size: 0.95rem; font-weight: 400; }
.doc-card-body { padding: 1.2rem; }
.doc-desc { font-size: 0.8rem; color: var(--muted); margin-bottom: 1rem; line-height: 1.6; }
.doc-upload {
  border: 2px dashed var(--border); border-radius: 10px; cursor: pointer;
  transition: border-color 0.2s; overflow: hidden;
}
.doc-upload:hover { border-color: var(--cafe); }
.doc-placeholder {
  padding: 1.5rem; display: flex; flex-direction: column;
  align-items: center; gap: 0.4rem; color: var(--muted); text-align: center;
}
.doc-placeholder p { font-size: 0.82rem; }
.doc-format { font-size: 0.68rem; color: #D1D5DB; }
.doc-uploaded {
  padding: 1.2rem; display: flex; flex-direction: column;
  align-items: center; gap: 0.3rem; color: #16a34a; text-align: center;
}
.doc-uploaded p { font-size: 0.82rem; font-weight: 600; }
.doc-change { font-size: 0.7rem; color: var(--muted); }

/* Empty state */
.empty-state {
  text-align: center; padding: 3rem;
  background: var(--blanco); border-radius: 14px; border: 1px solid var(--border);
}
.empty-title { font-family: 'Anton', sans-serif; font-size: 1rem; color: #9CA3AF; }
.empty-sub   { font-size: 0.82rem; color: #D1D5DB; margin-top: 0.3rem; }

/* Tabla historial */
.tabla-container { overflow-x: auto; border-radius: 14px; border: 1px solid var(--border); }
.tabla { width: 100%; border-collapse: collapse; background: var(--blanco); font-size: 0.82rem; }
.tabla thead tr { background: var(--cafe); }
.tabla th { padding: 0.9rem 1rem; text-align: left; font-size: 0.72rem; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.06em; }
.tabla td { padding: 0.9rem 1rem; border-bottom: 1px solid #F3F4F6; color: var(--texto); }
.tabla tbody tr:last-child td { border-bottom: none; }
.tabla tbody tr:hover { background: var(--cafe-cl); }

/* Alertas */
.alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0.6rem 0.9rem; font-size: 0.8rem; margin-top: 0.8rem; }

@media (max-width: 900px) {
  .stats-grid-prop { grid-template-columns: repeat(2, 1fr); }
  .ganancias-layout { grid-template-columns: 1fr; }
  .docs-grid { grid-template-columns: 1fr; }
  .finca-banner { flex-direction: column; align-items: flex-start; }
  .ta-header, .ta-row { grid-template-columns: 80px 100px 100px 110px 100px; }
}
.page-title    { letter-spacing: 0.05em; }
.section-title { letter-spacing: 0.05em; }
.banner-nombre { letter-spacing: 0.05em; }
.mf-nombre     { letter-spacing: 0.05em; }
.gc-val        { letter-spacing: 0.05em; }
.stat-prop-icon-svg { color: var(--cafe); margin-bottom: 0.5rem; }

.edit-card { background: var(--blanco); border-radius: 14px; padding: 1.5rem; border: 1px solid var(--border); margin-bottom: 1.5rem; }
.edit-titulo { font-family: 'Anton', sans-serif; font-size: 1rem; color: var(--cafe); margin-bottom: 1rem; letter-spacing: 0.05em; }
.edit-form { display: flex; flex-direction: column; gap: 1rem; }
.edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.edit-group { display: flex; flex-direction: column; gap: 0.35rem; }
.edit-group label { font-size: 0.75rem; font-weight: 600; color: var(--texto); }
.edit-input {
  all: unset; border: 1.5px solid var(--border); border-radius: 10px;
  padding: 0.7rem 0.9rem; font-size: 0.88rem; color: var(--texto);
  background: var(--blanco); width: 100%; box-sizing: border-box;
  transition: border-color 0.2s;
}
.edit-input:focus { border-color: var(--cafe); }
.edit-input:disabled { background: #F9FAFB; color: var(--muted); }
.btn-guardar-perfil {
  all: unset; cursor: pointer;
  background: var(--cafe); color: #fff;
  font-family: 'Open Sans', sans-serif; font-size: 0.88rem; font-weight: 600;
  padding: 0.8rem 1.8rem; border-radius: 100px;
  display: inline-block; margin-top: 1rem;
  transition: opacity 0.2s;
}
.btn-guardar-perfil:hover { opacity: 0.88; }
.main-header {
  display: flex; justify-content: flex-end; align-items: center;
  padding: 1rem 2rem; border-bottom: 1px solid var(--border);
  background: var(--blanco); position: sticky; top: 0; z-index: 10;
  position: relative;
}
.campana-wrap {
  position: relative; cursor: pointer;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--cafe-cl); display: flex; align-items: center; justify-content: center;
  color: var(--cafe); transition: background 0.2s;
}
.campana-wrap:hover { background: var(--cafe); color: #fff; }
.campana-dot {
  position: absolute; top: -2px; right: -2px;
  background: #EF4444; color: #fff;
  font-size: 0.6rem; font-weight: 700;
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.notif-dropdown {
  position: absolute; top: 56px; right: 1rem;
  background: var(--blanco); border-radius: 14px;
  border: 1px solid var(--border); width: 320px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 100;
}
.notif-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.2rem; border-bottom: 1px solid var(--border); }
.notif-titulo { font-family: 'Anton', sans-serif; font-size: 0.95rem; color: var(--cafe); letter-spacing: 0.05em; }
.notif-close  { all: unset; cursor: pointer; color: var(--muted); font-size: 0.85rem; }
.notif-empty  { padding: 1.5rem; text-align: center; font-size: 0.82rem; color: var(--muted); }
.notif-item   { display: flex; gap: 0.8rem; padding: 1rem 1.2rem; border-bottom: 1px solid #F3F4F6; }
.notif-item:last-child { border-bottom: none; }
.notif-icon   { width: 32px; height: 32px; border-radius: 8px; background: var(--cafe-cl); color: var(--cafe); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.notif-txt    { font-size: 0.82rem; font-weight: 600; color: var(--texto); }
.notif-fecha  { font-size: 0.72rem; color: var(--muted); margin-top: 0.1rem; }
.notif-btns   { display: flex; gap: 0.4rem; margin-top: 0.5rem; }
.logo-img {
  width: 120px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

</style>