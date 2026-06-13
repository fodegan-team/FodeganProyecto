<template>
  <div class="dashboard-root">

    <!-- ══ SIDEBAR ══ -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="sidebar-logo">
          <span class="logo-icon">🐄</span>
          <div class="logo-texts">
            <img src="/images/LogoFodegan.png" alt="FODEGAN" class="logo-img" />
            <span class="logo-sub">ZOOTECNISTA</span>
          </div>
        </div>
      </div>

      <div class="sidebar-user">
        <FotoPerfil color="#0C4A6E" />
        <div class="user-info">
          <p class="user-name">{{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</p>
          <p class="user-rol">Zootecnista</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button v-for="item in navItems" :key="item.id"
          class="nav-item" :class="{ active: seccionActiva === item.id }"
          @click="cambiarSeccion(item.id)">
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

      <!-- ══ INICIO ══ -->
      <section v-if="seccionActiva === 'inicio'" class="seccion">
        <div class="inicio-header">
          <div>
            <h1 class="dash-title">Inicio</h1>
            <p class="dash-sub">Bienvenido, Dr. {{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</p>
          </div>
          <div class="header-actions">
            <button class="notif-btn" @click="seccionActiva = 'inicio'">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span class="notif-dot" v-if="dashboard.alertas_urgentes > 0" />
            </button>
          </div>
        </div>

        <!-- Stats cards -->
        <div class="stats-grid-inicio">
          <div class="stat-card-inicio azul-oscuro">
            <div class="stat-card-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
            </div>
            <div class="stat-card-info">
              <p class="stat-card-tag">FINCAS ASIGNADAS</p>
              <p class="stat-card-num">{{ dashboard.fincas_asignadas || 0 }}</p>
              <p class="stat-card-sub">bajo tu supervisión</p>
            </div>
          </div>

          <div class="stat-card-inicio blanco">
            <div class="stat-card-header-row">
              <p class="stat-card-tag gris">ANIMALES EN SEGUIMIENTO</p>
              <span class="stat-badge verde">Activo</span>
            </div>
            <p class="stat-card-num oscuro">{{ dashboard.animales_seguimiento || 0 }}</p>
            <p class="stat-card-sub gris">total en monitoreo</p>
          </div>

          <div class="stat-card-inicio blanco">
            <div class="stat-card-header-row">
              <p class="stat-card-tag gris">VISITAS PROGRAMADAS</p>
              <span class="stat-badge azul">Esta semana</span>
            </div>
            <p class="stat-card-num oscuro">{{ visitasSemana }}</p>
            <p class="stat-card-sub gris">próximas 7 días</p>
          </div>

          <div class="stat-card-inicio rojo" v-if="dashboard.alertas_urgentes > 0">
            <div class="stat-card-header-row">
              <p class="stat-card-tag rojo-txt">ALERTAS SANITARIAS</p>
              <span class="stat-badge rojo-badge">Urgente</span>
            </div>
            <p class="stat-card-num rojo-num">{{ dashboard.alertas_urgentes || 0 }}</p>
            <p class="stat-card-sub rojo-txt">requieren atención</p>
          </div>
          <div class="stat-card-inicio blanco" v-else>
            <div class="stat-card-header-row">
              <p class="stat-card-tag gris">ALERTAS SANITARIAS</p>
            </div>
            <p class="stat-card-num oscuro">0</p>
            <p class="stat-card-sub gris">sin alertas activas</p>
          </div>
        </div>

        <!-- Próximas visitas + Recordatorios -->
        <div class="inicio-bottom">
          <!-- Próximas visitas -->
          <div class="proximas-card">
            <div class="proximas-header">
              <div>
                <h3 class="proximas-titulo">Próximas Visitas</h3>
                <p class="proximas-sub">Agenda de esta semana</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>

            <div class="visitas-lista">
              <div class="empty-visitas" v-if="!dashboard.visitas || dashboard.visitas.length === 0">
                <p>No hay visitas programadas próximamente</p>
              </div>
              <div class="visita-item" v-for="visita in dashboard.visitas?.slice(0,4)" :key="visita.id">
                <div class="visita-fecha-box" :class="tipoColor(visita.tipo)">
                  <span class="visita-dia">{{ formatDia(visita.fecha_visita) }}</span>
                  <span class="visita-mes">{{ formatMes(visita.fecha_visita) }}</span>
                </div>
                <div class="visita-info">
                  <p class="visita-finca">{{ visita.nombre_ficticio }}</p>
                  <p class="visita-desc">{{ tipoLabel(visita.tipo) }}</p>
                  <div class="visita-meta">
                    <span class="visita-hora">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {{ formatHora(visita.fecha_visita) }}
                    </span>
                    <span class="visita-lugar">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      </svg>
                      {{ visita.nombre_real }}
                    </span>
                  </div>
                </div>
                <span class="visita-estado-badge" :class="visita.estado">
                  {{ visita.estado === 'confirmada' ? 'Confirmada' : 'Pendiente' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Recordatorios -->
          <div class="recordatorios-card">
            <div class="recordatorios-header">
              <h3 class="recordatorios-titulo">Recordatorios</h3>
              <p class="recordatorios-sub">Tareas pendientes</p>
            </div>

            <div class="recordatorios-lista">
              <div class="empty-record" v-if="!dashboard.recordatorios || dashboard.recordatorios.length === 0">
                <p>No hay recordatorios pendientes</p>
              </div>

              <!-- Alertas sanitarias activas -->
              <div class="record-item rojo" v-for="alerta in dashboard.alertas?.slice(0,2)" :key="'a'+alerta.id">
                <div class="record-icon rojo-bg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div class="record-info">
                  <p class="record-titulo">Alerta Sanitaria</p>
                  <p class="record-desc">{{ alerta.descripcion?.substring(0, 60) }}...</p>
                  <p class="record-urgencia rojo-txt">● Hoy - Urgente</p>
                </div>
              </div>

              <!-- Visitas próximas como recordatorio -->
              <div class="record-item" v-for="rec in dashboard.recordatorios?.slice(0,3)" :key="'r'+rec.id"
                :class="urgenciaRecord(rec)">
                <div class="record-icon" :class="tipoColor(rec.tipo) + '-bg'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div class="record-info">
                  <p class="record-titulo">{{ tipoLabel(rec.tipo) }}</p>
                  <p class="record-desc">{{ rec.nombre_ficticio }}</p>
                  <p class="record-fecha">● {{ formatFechaCorta(rec.fecha_visita) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══ MIS FINCAS ══ -->
      <section v-if="seccionActiva === 'fincas'" class="seccion">

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
          </div>
          <div class="fincas-grid" v-else>
            <div class="finca-card" v-for="finca in misFincas" :key="finca.id" @click="seleccionarFinca(finca)">
              <div class="finca-card-top">
                <div class="finca-icon-wrap">🌿</div>
                <span class="finca-estado-badge">{{ finca.inversiones_activas }} activa(s)</span>
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
              </div>
              <p class="finca-ver">Ver inversiones →</p>
            </div>
          </div>
        </div>

        <!-- Inversiones de la finca -->
        <div v-else-if="fincaSeleccionada && !inversionSeleccionada">
          <div class="dash-header">
            <button class="btn-back" @click="fincaSeleccionada = null">← Volver</button>
            <div>
              <h1 class="dash-title">{{ fincaSeleccionada.nombre_ficticio }}</h1>
              <p class="dash-sub">{{ fincaSeleccionada.nombre_real }}</p>
            </div>
          </div>
          <div class="empty-state" v-if="inversionesFinca.length === 0">
            <p class="empty-title">Sin inversiones activas</p>
          </div>
          <div class="inversiones-list" v-else>
            <div class="inversion-row" v-for="inv in inversionesFinca" :key="inv.id" @click="seleccionarInversion(inv)">
              <div class="inv-row-left">
                <p class="inv-row-finca">{{ inv.nombre_ficticio }}</p>
                <p class="inv-row-fecha">{{ formatFecha(inv.fecha_inicio_ciclo) }} — {{ formatFecha(inv.fecha_fin_ciclo) }}</p>
              </div>
              <div class="inv-row-stats">
                <div class="inv-row-stat">
                  <span class="inv-row-val">{{ inv.cantidad_animales }}</span>
                  <span class="inv-row-lbl">Animales</span>
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
              <span class="inv-row-ver">Registrar →</span>
            </div>
          </div>
        </div>

        <!-- Animales de la inversión -->
        <div v-else-if="inversionSeleccionada">
          <div class="dash-header">
            <button class="btn-back" @click="inversionSeleccionada = null; animalesList = []">← Volver</button>
            <div>
              <h1 class="dash-title">{{ fincaSeleccionada.nombre_ficticio }}</h1>
              <p class="dash-sub">{{ animalesList.length }} animales en seguimiento</p>
            </div>
          </div>

          <!-- Tabla de animales estilo imagen -->
          <div class="animales-tabla-pro">
            <div class="atp-header">
              <span>CÓDIGO</span>
              <span>PESO INICIAL</span>
              <span>PESO ACTUAL</span>
              <span>GANANCIA</span>
              <span>FECHA</span>
              <span>ACCIÓN</span>
            </div>
            <div class="atp-row" v-for="animal in animalesList" :key="animal.id">
              <span class="atp-codigo">#{{ animal.codigo }}</span>
              <span>{{ animal.peso_inicial }} kg</span>
              <span class="atp-peso-actual">{{ animal.ultimo_peso || animal.peso_inicial }} kg</span>
              <span :class="ganancia(animal) >= 0 ? 'green' : 'red'">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-if="ganancia(animal) > 0">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                </svg>
                {{ ganancia(animal) >= 0 ? '+' : '' }}{{ ganancia(animal).toFixed(1) }} kg ({{ pct(animal) }}%)
              </span>
              <span class="atp-fecha">{{ animal.fecha_ultimo_peso ? formatFecha(animal.fecha_ultimo_peso) : '—' }}</span>
              <button class="btn-registrar-pro" @click="abrirRegistro(animal)">Registrar</button>
            </div>
          </div>

          <!-- Comentarios -->
          <div class="comentarios-section" style="margin-top: 1.5rem;">
            <h3 class="comentarios-titulo">Comentarios al inversor</h3>
            <div class="comentario-form">
              <select v-model="comentarioAnimal" class="estado-select">
                <option value="">Comentario general</option>
                <option v-for="animal in animalesList" :key="animal.id" :value="animal.id">
                  {{ animal.codigo }}
                </option>
              </select>
              <textarea v-model="comentarioTexto" placeholder="Escribe un comentario..." rows="3" class="comentario-textarea"/>
              <button class="btn-primary" @click="enviarComentario" :disabled="!comentarioTexto.trim()">
                Enviar comentario
              </button>
            </div>
          </div>
        </div>

      </section>

      <!-- ══ VISITAS CALENDARIO ══ -->
      <section v-if="seccionActiva === 'visitas'" class="seccion">
        <div class="dash-header">
          <h1 class="dash-title">Mis Visitas</h1>
          <p class="dash-sub">Calendario de visitas programadas</p>
        </div>

        <!-- Navegación del calendario -->
        <div class="calendario-wrap">
          <div class="calendario-nav">
            <button class="cal-nav-btn" @click="mesAnterior">‹</button>
            <h3 class="cal-mes-titulo">{{ nombreMes }} {{ anioActual }}</h3>
            <button class="cal-nav-btn" @click="mesSiguiente">›</button>
          </div>

          <!-- Leyenda -->
          <div class="cal-leyenda">
            <span class="leyenda-item azul-bg">Pesaje</span>
            <span class="leyenda-item verde-bg">Vacunación</span>
            <span class="leyenda-item cyan-bg">Revisión</span>
          </div>

          <!-- Grilla del calendario -->
          <div class="calendario-grid">
            <div class="cal-dia-header" v-for="d in ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']" :key="d">{{ d }}</div>
            <div
              v-for="(dia, idx) in diasCalendario" :key="idx"
              class="cal-dia-cell"
              :class="{
                'otro-mes': !dia.esEsteMes,
                'hoy': dia.esHoy,
                'tiene-visita': dia.visitas.length > 0
              }"
            >
              <span class="cal-num">{{ dia.numero }}</span>
              <div class="cal-visitas">
                <div v-for="v in dia.visitas.slice(0,2)" :key="v.id"
                  class="cal-visita-chip" :class="tipoColor(v.tipo)">
                  <span class="cal-chip-finca">{{ v.nombre_ficticio }}</span>
                  <span class="cal-chip-tipo">{{ tipoLabel(v.tipo) }}</span>
                  <span class="cal-chip-hora">{{ formatHora(v.fecha_visita) }}</span>
                </div>
                <span v-if="dia.visitas.length > 2" class="cal-mas">+{{ dia.visitas.length - 2 }} más</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══ HISTORIAL ══ -->
      <section v-if="seccionActiva === 'historial'" class="seccion">
        <div class="dash-header">
          <h1 class="dash-title">Historial de Fincas</h1>
        </div>
        <div class="empty-state" v-if="historial.length === 0">
          <p class="empty-title">Sin historial</p>
        </div>
        <div class="tabla-container" v-else>
          <table class="tabla">
            <thead>
              <tr>
                <th>Finca</th><th>Animales</th><th>Ciclo</th><th>Inicio</th><th>Fin</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in historial" :key="h.id">
                <td>{{ h.nombre_ficticio }}</td>
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

    <!-- ══ MODAL REGISTRO ══ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modalRegistro" @click.self="modalRegistro = false">
        <div class="modal-registro">
          <div class="modal-registro-header">
            <div>
              <h3 class="modal-titulo">Registrar Nuevo Peso</h3>
              <p class="modal-sub">Animal #{{ animalActivo?.codigo }}</p>
            </div>
            <button class="modal-close" @click="modalRegistro = false">✕</button>
          </div>

          <div class="modal-info-row">
            <div class="modal-info-item">
              <span class="modal-info-lbl">Finca:</span>
              <span class="modal-info-val">{{ fincaSeleccionada?.nombre_ficticio }}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-info-lbl">Peso actual:</span>
              <span class="modal-info-val">{{ animalActivo?.ultimo_peso || animalActivo?.peso_inicial }} kg</span>
            </div>
          </div>

          <div class="modal-form">
            <div class="form-group">
              <label>Nuevo Peso (kg) *</label>
              <input v-model="nuevoPeso" type="number" placeholder="Ej: 295" class="modal-input" />
            </div>
            <div class="form-group">
              <label>Fecha de Registro</label>
              <input :value="hoy" type="text" class="modal-input" disabled />
              <p class="field-hint">La fecha se registra automáticamente</p>
            </div>
          </div>

          <div class="alert-success" v-if="exitoRegistro" style="margin: 0 1.4rem 0.5rem;">{{ exitoRegistro }}</div>

          <div class="modal-btns">
            <button class="btn-secondary" @click="modalRegistro = false">Cancelar</button>
            <button class="btn-guardar-reporte" @click="guardarNuevoPeso" :disabled="!nuevoPeso">
              ✓ Guardar Peso
            </button>
          </div>

          <!-- Botones adicionales -->
          <div class="modal-extras">
            <button class="btn-extra reporte" @click="abrirReporte(animalActivo)">
              📋 Generar Reporte Técnico
            </button>
            <button class="btn-extra evidencia" @click="abrirEvidencia(animalActivo)">
              📷 Evidencia Visual
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ MODAL REPORTE TÉCNICO ══ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modalReporte" @click.self="modalReporte = false">
        <div class="modal-registro">
          <div class="modal-registro-header">
            <div>
              <h3 class="modal-titulo">Nuevo Reporte Técnico</h3>
              <p class="modal-sub">Registra información detallada del ganado</p>
            </div>
            <button class="modal-close" @click="modalReporte = false">✕</button>
          </div>

          <div class="reporte-info-box">
            <div class="reporte-info-row">
              <span>Finca: <strong>{{ fincaSeleccionada?.nombre_ficticio }}</strong></span>
              <span>Inversor: <strong>#INV{{ inversionSeleccionada?.id?.toString().padStart(4,'0') }}</strong></span>
            </div>
            <div class="reporte-info-row">
              <span>Animal: <strong>#{{ animalActivo?.codigo }}</strong></span>
              <span>Estado Actual: <strong :class="animalActivo?.estado_actual">{{ animalActivo?.estado_actual?.replace('_',' ') }}</strong></span>
            </div>
          </div>

          <div class="modal-form">
            <div class="form-group">
              <label>Tipo de Revisión *</label>
              <div class="tipo-options">
                <button
                  v-for="tipo in tiposRevision" :key="tipo.val"
                  class="tipo-btn"
                  :class="[
                    { active: reporteForm.tipo_revision === tipo.val },
                    reporteForm.tipo_revision === tipo.val ? tipo.clase : ''
                  ]"
                  @click="reporteForm.tipo_revision = tipo.val">
                  <span class="tipo-icon">{{ tipo.icon }}</span>
                  {{ tipo.label }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Estado del Ganado *</label>
              <div class="estado-options">
                <button v-for="est in estadosGanado" :key="est.val"
                  class="estado-btn" :class="{ active: reporteForm.estado_animal === est.val, [est.color]: true }"
                  @click="reporteForm.estado_animal = est.val">
                  <span>{{ est.icon }}</span>
                  {{ est.label }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Observaciones * <span class="char-count">{{ reporteForm.observaciones.length }}/20 mín.</span></label>
              <textarea v-model="reporteForm.observaciones" rows="4"
                placeholder="Describe los hallazgos, comportamiento del animal, recomendaciones..."
                class="modal-textarea" />
              <p class="field-hint">Mínimo 20 caracteres</p>
            </div>
          </div>

          <div class="alert-error" v-if="errorReporte">{{ errorReporte }}</div>

          <div class="modal-btns">
            <button class="btn-secondary" @click="modalReporte = false; modalRegistro = true">
              ← Volver al registro
            </button>
            <button
              class="btn-guardar-reporte"
              @click="enviarReporte"
              :disabled="!reporteForm.tipo_revision || !reporteForm.estado_animal || reporteForm.observaciones.length < 20">
              ✓ Guardar Reporte
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ MODAL EVIDENCIA ══ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modalEvidencia" @click.self="modalEvidencia = false">
        <div class="modal-registro">
          <div class="modal-registro-header">
            <div>
              <h3 class="modal-titulo">Evidencia Visual</h3>
              <p class="modal-sub">Animal #{{ animalActivo?.codigo }}</p>
            </div>
            <button class="modal-close" @click="modalEvidencia = false">✕</button>
          </div>

          <div class="modal-form">
            <div class="evidencia-upload" @click="$refs.fileInput.click()">
              <img v-if="evidenciaPreview" :src="evidenciaPreview" class="evidencia-preview" />
              <div v-else class="evidencia-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <p>Toca para seleccionar una foto</p>
              </div>
              <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" style="display:none" />
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <input v-model="evidenciaDesc" type="text" placeholder="Describe la imagen..." class="modal-input" />
            </div>
          </div>

          <div class="alert-success" v-if="exitoEvidencia">{{ exitoEvidencia }}</div>
          <div class="alert-error"   v-if="errorEvidencia">{{ errorEvidencia }}</div>

          <div class="modal-btns">
            <button class="btn-secondary" @click="modalEvidencia = false; modalRegistro = true">
              ← Volver al registro
            </button>
            <button class="btn-guardar-reporte" @click="enviarEvidencia" :disabled="!evidenciaBase64">
              Subir Evidencia
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import axios from 'axios'
import FotoPerfil from '@/components/FotoPerfil.vue'

const router  = useRouter()
const auth    = useAuthStore()
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const headers = computed(() => ({ Authorization: `Bearer ${auth.token}` }))

// ── Nav ───────────────────────────────────────────
const seccionActiva = ref('inicio')
const navItems = computed(() => [
  { id: 'inicio',    label: 'Inicio',    badge: dashboard.value.alertas_urgentes || 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id: 'fincas',    label: 'Mis Fincas', badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { id: 'visitas',   label: 'Visitas',   badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { id: 'historial', label: 'Historial', badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
])

// ── Datos ─────────────────────────────────────────
const dashboard          = ref({ fincas_asignadas: 0, animales_seguimiento: 0, proximas_visitas: 0, alertas_urgentes: 0, visitas: [], alertas: [], recordatorios: [] })
const misFincas          = ref([])
const inversionesFinca   = ref([])
const animalesList       = ref([])
const historial          = ref([])
const misVisitas         = ref([])

const fincaSeleccionada     = ref(null)
const inversionSeleccionada = ref(null)
const enviandoReporte = ref(false)

// ── Calendario ────────────────────────────────────
const hoyDate    = new Date()
const mesActual  = ref(hoyDate.getMonth())
const anioActual = ref(hoyDate.getFullYear())
const hoy        = computed(() => hoyDate.toLocaleDateString('es-CO'))

const nombreMes = computed(() => {
  return new Date(anioActual.value, mesActual.value).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
})

const visitasSemana = computed(() => {
  const hoy7 = new Date(); hoy7.setDate(hoy7.getDate() + 7)
  return (dashboard.value.visitas || []).filter(v => new Date(v.fecha_visita) <= hoy7).length
})

const diasCalendario = computed(() => {
  const primer = new Date(anioActual.value, mesActual.value, 1)
  const ultimo = new Date(anioActual.value, mesActual.value + 1, 0)
  const dias = []

  // Días del mes anterior
  for (let i = 0; i < primer.getDay(); i++) {
    const d = new Date(anioActual.value, mesActual.value, -primer.getDay() + i + 1)
    dias.push({ numero: d.getDate(), esEsteMes: false, esHoy: false, visitas: [] })
  }

  // Días del mes actual
  for (let d = 1; d <= ultimo.getDate(); d++) {
    const fecha = new Date(anioActual.value, mesActual.value, d)
    const esHoy = fecha.toDateString() === hoyDate.toDateString()
    const visitasDia = misVisitas.value.filter(v => {
      const fv = new Date(v.fecha_visita)
      return fv.getDate() === d && fv.getMonth() === mesActual.value && fv.getFullYear() === anioActual.value
    })
    dias.push({ numero: d, esEsteMes: true, esHoy, visitas: visitasDia })
  }

  // Completar hasta 42 celdas
  while (dias.length < 42) {
    dias.push({ numero: dias.length - ultimo.getDate() - primer.getDay() + 1, esEsteMes: false, esHoy: false, visitas: [] })
  }
  return dias
})

function mesAnterior() {
  if (mesActual.value === 0) { mesActual.value = 11; anioActual.value-- }
  else mesActual.value--
}
function mesSiguiente() {
  if (mesActual.value === 11) { mesActual.value = 0; anioActual.value++ }
  else mesActual.value++
}

// ── Modales ───────────────────────────────────────
const modalRegistro  = ref(false)
const modalReporte   = ref(false)
const modalEvidencia = ref(false)
const animalActivo   = ref(null)
const nuevoPeso      = ref('')
const errorRegistro  = ref('')
const exitoRegistro  = ref('')

const reporteForm = reactive({ tipo_revision: '', estado_animal: '', observaciones: '' })
const errorReporte = ref('')

const evidenciaBase64 = ref('')
const evidenciaPreview = ref('')
const evidenciaDesc   = ref('')
const exitoEvidencia  = ref('')
const errorEvidencia  = ref('')

const comentarioAnimal = ref('')
const comentarioTexto  = ref('')

const tiposRevision = [
  { val: 'control_sanitario', label: 'Control Sanitario', clase: 't-sanitario' },
  { val: 'vacunacion',        label: 'Vacunación',        clase: 't-vacunacion' },
  { val: 'control_peso',      label: 'Control de Peso',   clase: 't-peso'      },
  { val: 'revision_general',  label: 'Revisión General',  clase: 't-revision'  },
]

const estadosGanado = [
  { val: 'excelente', label: 'Excelente', icon: '✓', color: 'est-verde' },
  { val: 'bueno',     label: 'Bueno',     icon: '○', color: 'est-azul'  },
  { val: 'regular',   label: 'Regular',   icon: '!', color: 'est-naranja'},
  { val: 'enfermo',   label: 'Enfermo',   icon: '⚠', color: 'est-rojo'  },
  { val: 'muerto',    label: 'Muerto',    icon: '✕', color: 'est-negro' },
]

// ── Helpers ───────────────────────────────────────
function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatFechaCorta(f) {
  if (!f) return '—'
  const d = new Date(f)
  const hoy = new Date()
  const diff = Math.ceil((d - hoy) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  return `En ${diff} días`
}
function formatDia(f)  { return new Date(f).getDate() }
function formatMes(f)  { return new Date(f).toLocaleDateString('es-CO', { month: 'short' }).toUpperCase() }
function formatHora(f) { return new Date(f).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }
function ganancia(a)   { return parseFloat(a.ultimo_peso || a.peso_inicial) - parseFloat(a.peso_inicial) }
function pct(a)        { return ((ganancia(a) / parseFloat(a.peso_inicial)) * 100).toFixed(1) }

function tipoColor(tipo) {
  const map = { pesaje: 'azul', vacunacion: 'verde', revision: 'cyan', control_sanitario: 'cyan' }
  return map[tipo] || 'azul'
}
function tipoLabel(tipo) {
  const map = { pesaje: 'Pesaje', vacunacion: 'Vacunación', revision: 'Revisión', control_sanitario: 'Control Sanitario' }
  return map[tipo] || tipo
}
function urgenciaRecord(rec) {
  const diff = Math.ceil((new Date(rec.fecha_visita) - new Date()) / (1000 * 60 * 60 * 24))
  return diff <= 1 ? 'urgente' : diff <= 3 ? 'pronto' : ''
}

// ── Acciones ──────────────────────────────────────
function cambiarSeccion(id) {
  seccionActiva.value = id
  fincaSeleccionada.value = null
  inversionSeleccionada.value = null
  animalesList.value = []
}

function abrirRegistro(animal) {
  animalActivo.value = animal
  nuevoPeso.value    = ''
  modalRegistro.value = true
}

function abrirReporte(animal) {
  animalActivo.value = animal
  reporteForm.tipo_revision  = ''
  reporteForm.estado_animal  = ''
  reporteForm.observaciones  = ''
  errorReporte.value = ''
  modalRegistro.value = false  // oculta el panel 1
  modalReporte.value  = true   // abre el panel 2
}

function abrirEvidencia(animal) {
  animalActivo.value    = animal
  evidenciaBase64.value  = ''
  evidenciaPreview.value = ''
  evidenciaDesc.value    = ''
  exitoEvidencia.value   = ''
  errorEvidencia.value   = ''
  modalRegistro.value    = false  // oculta panel 1
  modalEvidencia.value   = true   // abre panel evidencia
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    evidenciaPreview.value = ev.target.result
    evidenciaBase64.value  = ev.target.result.split(',')[1]
  }
  reader.readAsDataURL(file)
}

async function guardarNuevoPeso() {
  try {
    const mesCiclo = Math.max(1, Math.ceil(
      (new Date() - new Date(inversionSeleccionada.value.fecha_inicio_ciclo)) / (1000 * 60 * 60 * 24 * 30)
    ))
    await axios.post(`${API}/zootecnista/peso`, {
      animal_id:    animalActivo.value.id,
      inversion_id: inversionSeleccionada.value.id,
      mes_numero:   mesCiclo,
      peso_kg:      nuevoPeso.value,
      estado:       animalActivo.value.estado_actual || 'buen_estado'
    }, { headers: headers.value })

    modalRegistro.value = false
    nuevoPeso.value = ''
    const { data } = await axios.get(`${API}/zootecnista/inversiones/${inversionSeleccionada.value.id}/animales`, { headers: headers.value })
    animalesList.value = data
  } catch (err) {
    errorRegistro.value = err.response?.data?.error || 'Error registrando peso'
  }
}

async function enviarReporte() {
  if (enviandoReporte.value) return
  enviandoReporte.value = true
  errorReporte.value = ''
  try {
    const { data } = await axios.post(`${API}/zootecnista/reporte`, {
      animal_id:      animalActivo.value.id,
      inversion_id:   inversionSeleccionada.value.id,
      tipo_revision:  reporteForm.tipo_revision,
      estado_animal:  reporteForm.estado_animal,
      observaciones:  reporteForm.observaciones
    }, { headers: headers.value })

    modalReporte.value  = false
    modalRegistro.value = true
    exitoRegistro.value = '✓ Reporte guardado correctamente'
    setTimeout(() => { exitoRegistro.value = '' }, 3000)

    const { data: animales } = await axios.get(
      `${API}/zootecnista/inversiones/${inversionSeleccionada.value.id}/animales`,
      { headers: headers.value }
    )
    animalesList.value = animales
  } catch (err) {
    console.error('Error:', err)
    errorReporte.value = err.response?.data?.error || 'Error creando reporte'
  } finally {
    enviandoReporte.value = false
  }
}

async function enviarEvidencia() {
  errorEvidencia.value = ''
  try {
    await axios.post(`${API}/zootecnista/evidencia`, {
      animal_id:     animalActivo.value.id,
      inversion_id:  inversionSeleccionada.value.id,
      imagen_base64: evidenciaBase64.value,
      descripcion:   evidenciaDesc.value
    }, { headers: headers.value })

    modalEvidencia.value   = false
    modalRegistro.value    = true
    exitoRegistro.value    = '✓ Evidencia subida correctamente'
    evidenciaBase64.value  = ''
    evidenciaPreview.value = ''
    evidenciaDesc.value    = ''
    setTimeout(() => { exitoRegistro.value = '' }, 3000)
  } catch (err) {
    console.error('Error evidencia:', err)
    errorEvidencia.value = err.response?.data?.error || 'Error subiendo evidencia'
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
    exitoRegistro.value    = '✓ Comentario enviado'
    setTimeout(() => { exitoRegistro.value = '' }, 3000)
  } catch {}
}

async function seleccionarFinca(finca) {
  fincaSeleccionada.value = finca
  const { data } = await axios.get(`${API}/zootecnista/fincas/${finca.id}/inversiones`, { headers: headers.value })
  inversionesFinca.value = data
}

async function seleccionarInversion(inv) {
  inversionSeleccionada.value = inv
  const { data } = await axios.get(`${API}/zootecnista/inversiones/${inv.id}/animales`, { headers: headers.value })
  animalesList.value = data
}

async function cerrarSesion() {
  await auth.logout()
  router.push('/')
}

onMounted(async () => {
  try {
    const [dashRes, fincasRes, visitasRes, histRes] = await Promise.all([
      axios.get(`${API}/zootecnista/dashboard`,  { headers: headers.value }),
      axios.get(`${API}/zootecnista/fincas`,     { headers: headers.value }),
      axios.get(`${API}/zootecnista/visitas`,    { headers: headers.value }),
      axios.get(`${API}/zootecnista/historial`,  { headers: headers.value }),
    ])
    dashboard.value  = dashRes.data
    misFincas.value  = fincasRes.data
    misVisitas.value = visitasRes.data
    historial.value  = histRes.data
  } catch (err) {
    console.error('Error cargando dashboard:', err)
  }
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
.logo-text { font-family: 'Anton', sans-serif; font-size: 0.95rem; letter-spacing: 0.16em; color: var(--dorado); display: block; line-height: 1; }
.logo-sub  { font-size: 0.5rem; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); text-transform: uppercase; }
.sidebar-user { display: flex; align-items: center; gap: 0.7rem; padding: 0.8rem; border-radius: 12px; background: rgba(255,255,255,0.08); margin-bottom: 1.2rem; }
.user-avatar  { width: 36px; height: 36px; border-radius: 50%; background: var(--dorado); color: #fff; font-family: 'Anton', sans-serif; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-name { font-size: 0.78rem; font-weight: 600; color: #fff; }
.user-rol  { font-size: 0.65rem; color: rgba(255,255,255,0.5); }
.sidebar-nav { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; }
.nav-item { all: unset; cursor: pointer; display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 0.8rem; border-radius: 10px; font-size: 0.83rem; color: rgba(255,255,255,0.65); transition: all 0.2s; -webkit-user-select: none; user-select: none; }
.nav-item:hover  { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active { background: rgba(255,255,255,0.15); color: #fff; font-weight: 600; }
.nav-icon { flex-shrink: 0; display: flex; }
.nav-badge { margin-left: auto; background: #EF4444; color: #fff; font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.45rem; border-radius: 100px; }
.btn-logout { all: unset; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 0.8rem; border-radius: 10px; font-size: 0.82rem; color: rgba(255,255,255,0.4); transition: all 0.2s; }
.btn-logout:hover { color: #fff; background: rgba(220,38,38,0.2); }

/* MAIN */
.main-content { flex: 1; overflow-y: auto; }
.seccion { padding: 2rem; }

/* INICIO */
.inicio-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.8rem; }
.dash-title { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: var(--azul); letter-spacing: 0.02em; }
.dash-sub   { font-size: 0.82rem; color: var(--muted); margin-top: 0.2rem; }
.notif-btn  { all: unset; cursor: pointer; position: relative; width: 40px; height: 40px; border-radius: 50%; background: var(--blanco); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--muted); }
.notif-dot  { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: #EF4444; }
.header-actions { display: flex; gap: 0.8rem; align-items: center; }

/* Stats inicio */
.stats-grid-inicio { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.8rem; }
.stat-card-inicio { border-radius: 14px; padding: 1.2rem; }
.stat-card-inicio.azul-oscuro { background: linear-gradient(135deg, #1E3A5F, #0C4A6E); color: #fff; }
.stat-card-inicio.blanco { background: var(--blanco); border: 1px solid var(--border); }
.stat-card-inicio.rojo { background: #FEF2F2; border: 1px solid #FECACA; }
.stat-card-icon-wrap { width: 44px; height: 44px; border-radius: 10px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 0.8rem; }
.stat-card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
.stat-card-tag { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; color: rgba(255,255,255,0.7); text-transform: uppercase; }
.stat-card-tag.gris { color: var(--muted); }
.stat-card-tag.rojo-txt { color: #DC2626; }
.stat-card-num { font-family: 'Anton', sans-serif; font-size: 2rem; color: #fff; margin: 0.2rem 0; }
.stat-card-num.oscuro { color: var(--texto); }
.stat-card-num.rojo-num { color: #DC2626; }
.stat-card-sub { font-size: 0.72rem; color: rgba(255,255,255,0.6); }
.stat-card-sub.gris { color: var(--muted); }
.stat-badge { font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 100px; }
.stat-badge.verde { background: #D1FAE5; color: #065F46; }
.stat-badge.azul  { background: var(--azul-cl); color: var(--azul); }
.stat-badge.rojo-badge { background: #DC2626; color: #fff; }

/* Inicio bottom */
.inicio-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

/* Próximas visitas */
.proximas-card { background: linear-gradient(160deg, #1E3A5F, #0C4A6E); border-radius: 16px; overflow: hidden; }
.proximas-header { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.4rem; }
.proximas-titulo { font-family: 'Anton', sans-serif; font-size: 1rem; color: #fff; }
.proximas-sub    { font-size: 0.72rem; color: rgba(255,255,255,0.6); }
.visitas-lista { padding: 0 1rem 1rem; display: flex; flex-direction: column; gap: 0.6rem; }
.empty-visitas { text-align: center; padding: 1.5rem; color: rgba(255,255,255,0.5); font-size: 0.82rem; }
.visita-item { background: rgba(255,255,255,0.08); border-radius: 10px; padding: 0.8rem; display: flex; align-items: center; gap: 0.8rem; }
.visita-fecha-box { width: 44px; text-align: center; border-radius: 8px; padding: 0.4rem; flex-shrink: 0; }
.visita-fecha-box.azul  { background: #2563EB; }
.visita-fecha-box.verde { background: #16A34A; }
.visita-fecha-box.cyan  { background: #0891B2; }
.visita-dia  { font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #fff; display: block; line-height: 1; }
.visita-mes  { font-size: 0.58rem; color: rgba(255,255,255,0.8); text-transform: uppercase; }
.visita-info { flex: 1; }
.visita-finca { font-weight: 700; color: #fff; font-size: 0.85rem; }
.visita-desc  { font-size: 0.72rem; color: rgba(255,255,255,0.6); }
.visita-meta  { display: flex; gap: 0.8rem; margin-top: 0.3rem; }
.visita-hora, .visita-lugar { font-size: 0.68rem; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 0.3rem; }
.visita-estado-badge { font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 100px; flex-shrink: 0; }
.visita-estado-badge.confirmada { background: #16A34A; color: #fff; }
.visita-estado-badge.pendiente  { background: #D97706; color: #fff; }

/* Recordatorios */
.recordatorios-card { background: var(--blanco); border-radius: 16px; padding: 1.2rem; border: 1px solid var(--border); }
.recordatorios-header { margin-bottom: 1rem; }
.recordatorios-titulo { font-family: 'Anton', sans-serif; font-size: 1rem; color: var(--texto); }
.recordatorios-sub    { font-size: 0.72rem; color: var(--muted); }
.recordatorios-lista  { display: flex; flex-direction: column; gap: 0.7rem; }
.empty-record { text-align: center; padding: 1rem; color: var(--muted); font-size: 0.82rem; }
.record-item { display: flex; align-items: flex-start; gap: 0.8rem; padding: 0.7rem; border-radius: 10px; background: #F9FAFB; border-left: 3px solid transparent; }
.record-item.rojo   { border-left-color: #EF4444; background: #FEF2F2; }
.record-item.urgente { border-left-color: #F59E0B; background: #FFFBEB; }
.record-item.pronto  { border-left-color: #3B82F6; background: #EFF6FF; }
.record-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.record-icon.rojo-bg  { background: #EF4444; }
.record-icon.azul-bg  { background: #2563EB; }
.record-icon.verde-bg { background: #16A34A; }
.record-icon.cyan-bg  { background: #0891B2; }
.record-titulo { font-size: 0.82rem; font-weight: 700; color: var(--texto); }
.record-desc   { font-size: 0.72rem; color: var(--muted); margin-top: 0.1rem; }
.record-fecha, .record-urgencia { font-size: 0.68rem; font-weight: 600; margin-top: 0.2rem; }
.rojo-txt { color: #DC2626; }
.record-fecha { color: var(--muted); }

/* FINCAS */
.fincas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 1rem; }
.finca-card { background: var(--blanco); border-radius: 16px; padding: 1.4rem; border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; }
.finca-card:hover { border-color: var(--azul-mid); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.finca-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
.finca-icon-wrap { font-size: 1.8rem; }
.finca-estado-badge { font-size: 0.68rem; font-weight: 600; background: var(--azul-cl); color: var(--azul-mid); padding: 0.25rem 0.7rem; border-radius: 100px; }
.finca-nombre { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--azul); margin-bottom: 0.2rem; }
.finca-real   { font-size: 0.78rem; color: var(--muted); margin-bottom: 1rem; }
.finca-stats  { display: flex; gap: 1.2rem; margin-bottom: 0.8rem; }
.finca-stat-val { font-weight: 700; color: var(--texto); font-size: 0.9rem; display: block; }
.finca-stat-lbl { font-size: 0.68rem; color: var(--muted); }
.finca-ver { font-size: 0.75rem; color: var(--azul-mid); font-weight: 600; }

/* Inversiones */
.inversiones-list { display: flex; flex-direction: column; gap: 0.8rem; }
.inversion-row { background: var(--blanco); border-radius: 12px; padding: 1.1rem 1.4rem; border: 1px solid var(--border); display: flex; align-items: center; gap: 1.5rem; cursor: pointer; transition: all 0.2s; }
.inversion-row:hover { border-color: var(--azul-mid); transform: translateY(-1px); }
.inv-row-left { flex: 1; }
.inv-row-finca { font-weight: 700; color: var(--azul); font-size: 0.9rem; }
.inv-row-fecha { font-size: 0.72rem; color: var(--muted); margin-top: 0.2rem; }
.inv-row-stats { display: flex; gap: 1.5rem; }
.inv-row-val { font-weight: 700; color: var(--texto); font-size: 0.9rem; display: block; }
.inv-row-ver { font-size: 0.75rem; color: var(--azul-mid); font-weight: 600; flex-shrink: 0; }
.green { color: #16a34a; font-weight: 700; }
.red   { color: #DC2626; font-weight: 700; }
.inv-row-lbl { font-size: 0.68rem; color: var(--muted); }

/* Tabla animales pro */
.atp-header, .atp-row { display: grid; grid-template-columns: 100px 120px 130px 160px 120px 100px; gap: 1rem; padding: 0.8rem 1.2rem; font-size: 0.82rem; align-items: center; }
.atp-header { background: #F8FAFC; font-weight: 700; color: var(--muted); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid var(--border); border-radius: 12px 12px 0 0; }
.animales-tabla-pro { background: var(--blanco); border-radius: 14px; border: 1px solid var(--border); overflow: hidden; margin-bottom: 1.5rem; }
.atp-row { border-bottom: 1px solid #F3F4F6; }
.atp-row:last-child { border-bottom: none; }
.atp-row:hover { background: #F9FAFB; }
.atp-codigo { font-weight: 700; color: var(--azul); font-family: monospace; font-size: 0.88rem; }
.atp-peso-actual { font-weight: 700; color: var(--texto); }
.atp-fecha { font-size: 0.75rem; color: var(--muted); }
.btn-registrar-pro { all: unset; cursor: pointer; background: var(--azul); color: #fff; font-size: 0.72rem; font-weight: 600; padding: 0.4rem 0.9rem; border-radius: 6px; transition: opacity 0.2s; }
.btn-registrar-pro:hover { opacity: 0.85; }

/* CALENDARIO */
.calendario-wrap { background: var(--blanco); border-radius: 16px; padding: 1.5rem; border: 1px solid var(--border); }
.calendario-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.cal-mes-titulo { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--texto); text-transform: capitalize; }
.cal-nav-btn { all: unset; cursor: pointer; width: 32px; height: 32px; border-radius: 8px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--texto); transition: background 0.2s; }
.cal-nav-btn:hover { background: var(--azul-cl); }
.cal-leyenda { display: flex; gap: 1rem; margin-bottom: 1rem; }
.leyenda-item { font-size: 0.72rem; font-weight: 600; padding: 0.25rem 0.7rem; border-radius: 100px; color: #fff; }
.leyenda-item.azul-bg  { background: #2563EB; }
.leyenda-item.verde-bg { background: #16A34A; }
.leyenda-item.cyan-bg  { background: #0891B2; }

.calendario-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.cal-dia-header { text-align: center; font-size: 0.72rem; font-weight: 700; color: var(--muted); padding: 0.5rem; text-transform: uppercase; }
.cal-dia-cell { min-height: 80px; padding: 0.4rem; border: 1px solid #F3F4F6; border-radius: 6px; background: var(--blanco); }
.cal-dia-cell.otro-mes { background: #FAFAFA; }
.cal-dia-cell.hoy { background: #EFF6FF; border-color: var(--azul); }
.cal-dia-cell.tiene-visita { background: #F0F9FF; }
.cal-num { font-size: 0.82rem; font-weight: 600; color: var(--texto); display: block; margin-bottom: 0.3rem; }
.cal-dia-cell.hoy .cal-num { background: var(--azul); color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; }
.cal-dia-cell.otro-mes .cal-num { color: #D1D5DB; }
.cal-visitas { display: flex; flex-direction: column; gap: 2px; }
.cal-visita-chip { border-radius: 4px; padding: 0.2rem 0.4rem; }
.cal-visita-chip.azul  { background: #2563EB; }
.cal-visita-chip.verde { background: #16A34A; }
.cal-visita-chip.cyan  { background: #0891B2; }
.cal-chip-finca, .cal-chip-tipo, .cal-chip-hora { font-size: 0.62rem; color: #fff; display: block; line-height: 1.3; }
.cal-chip-finca { font-weight: 700; }
.cal-mas { font-size: 0.62rem; color: var(--muted); }

/* MODALES */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}

.modal-registro {
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%; max-width: 520px;
  height: auto;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0,0,0,0.4);
  position: relative; z-index: 1001;
  isolation: isolate;
  display: flex;
  flex-direction: column;
}
.modal-registro-header { background: linear-gradient(135deg, #1E3A5F, #0C4A6E); padding: 1.2rem 1.4rem; display: flex; justify-content: space-between; align-items: flex-start; border-radius: 16px 16px 0 0; }
.modal-titulo { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: #fff; }
.modal-sub    { font-size: 0.72rem; color: rgba(255,255,255,0.6); }
.modal-close  { all: unset; cursor: pointer; color: rgba(255,255,255,0.7); font-size: 1rem; padding: 0.2rem 0.5rem; }
.modal-close:hover { color: #fff; }

.modal-info-row { display: flex; gap: 1.5rem; padding: 1rem 1.4rem; background: #F8FAFC; border-bottom: 1px solid var(--border); }
.modal-info-item { display: flex; gap: 0.4rem; font-size: 0.82rem; }
.modal-info-lbl  { color: var(--muted); }
.modal-info-val  { font-weight: 700; color: var(--texto); }

.modal-form { padding: 1.2rem 1.4rem; display: flex; flex-direction: column; gap: 1rem; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: var(--texto); display: block; margin-bottom: 0.35rem; }
.modal-input { all: unset; border: 1.5px solid var(--border); border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 0.88rem; color: var(--texto); width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
.modal-input:focus { border-color: var(--azul); }
.modal-textarea { all: unset; border: 1.5px solid var(--border); border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 0.85rem; color: var(--texto); width: 100%; box-sizing: border-box; min-height: 100px; font-family: 'Open Sans', sans-serif; resize: vertical; }
.modal-textarea:focus { border-color: var(--azul); }
.field-hint { font-size: 0.7rem; color: var(--muted); margin-top: 0.2rem; }
.char-count { font-weight: 400; color: var(--muted); margin-left: 0.5rem; }

.modal-btns {
  display: flex; gap: 0.8rem;
  padding: 1rem 1.4rem 1.4rem;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid var(--border);
  margin-top: auto;
}
.btn-secondary { all: unset; cursor: pointer; border: 1.5px solid var(--border); color: var(--muted); font-size: 0.85rem; font-weight: 600; padding: 0.7rem 1.4rem; border-radius: 100px; transition: all 0.2s; }
.btn-secondary:hover { border-color: var(--azul); color: var(--texto); }
.btn-guardar-peso { all: unset; cursor: pointer; background: var(--azul); color: #fff; font-size: 0.85rem; font-weight: 600; padding: 0.7rem 1.4rem; border-radius: 100px; transition: opacity 0.2s; }
.btn-guardar-peso:hover:not(:disabled) { opacity: 0.88; }
.btn-guardar-peso:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-extras { display: flex; gap: 0.8rem; padding: 0 1.4rem 1.4rem; }
.btn-extra { all: unset; cursor: pointer; flex: 1; text-align: center; padding: 0.7rem; border-radius: 10px; font-size: 0.78rem; font-weight: 600; border: 1.5px solid var(--border); transition: all 0.2s; }
.btn-extra.reporte   { color: var(--azul); border-color: var(--azul-cl); background: var(--azul-cl); }
.btn-extra.evidencia { color: #059669; border-color: #D1FAE5; background: #D1FAE5; }
.btn-extra:hover { opacity: 0.85; }

/* Reporte */
.reporte-info-box { margin: 0 1.4rem; background: #F8FAFC; border-radius: 10px; padding: 0.9rem; border-left: 4px solid var(--azul); }
.reporte-info-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--muted); margin-bottom: 0.3rem; }
.reporte-info-row:last-child { margin-bottom: 0; }
.reporte-info-row strong { color: var(--texto); }
.tipo-options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.tipo-btn {
  all: unset; cursor: pointer;
  border: 1.5px solid var(--border); border-radius: 8px;
  padding: 0.7rem; text-align: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.82rem; color: var(--muted);
  transition: all 0.2s; -webkit-user-select: none; user-select: none;
}
.tipo-btn:hover { border-color: var(--azul-mid); color: var(--azul); }
.tipo-btn.active.t-sanitario { border-color: #DC2626; background: #FEE2E2; color: #DC2626; font-weight: 700; }
.tipo-btn.active.t-vacunacion { border-color: #16A34A; background: #D1FAE5; color: #16A34A; font-weight: 700; }
.tipo-btn.active.t-peso      { border-color: #2563EB; background: #DBEAFE; color: #2563EB; font-weight: 700; }
.tipo-btn.active.t-revision  { border-color: #D97706; background: #FEF3C7; color: #D97706; font-weight: 700; }
.tipo-btn.active { border-color: var(--azul); background: var(--azul); color: #fff; font-weight: 600; }
.estado-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.estado-btn { all: unset; cursor: pointer; border: 1.5px solid var(--border); border-radius: 8px; padding: 0.6rem 1rem; font-size: 0.78rem; color: var(--muted); display: flex; flex-direction: column; align-items: center; gap: 0.2rem; transition: all 0.2s; flex: 1; text-align: center; }
.estado-btn.active.est-verde  { border-color: #16A34A; background: #D1FAE5; color: #16A34A; }
.estado-btn.active.est-azul { border-color: #2563EB; background: #DBEAFE; color: #1D4ED8; font-weight: 700; }
.estado-btn.active.est-naranja{ border-color: #D97706; background: #FEF3C7; color: #D97706; }
.estado-btn.active.est-rojo   { border-color: #DC2626; background: #FEE2E2; color: #DC2626; }
.estado-btn.active.est-negro  { border-color: #374151; background: #F3F4F6; color: #374151; }

/* Evidencia */
.evidencia-upload { border: 2px dashed var(--border); border-radius: 12px; cursor: pointer; overflow: hidden; transition: border-color 0.2s; }
.evidencia-upload:hover { border-color: var(--azul); }
.evidencia-preview { width: 100%; height: 200px; object-fit: cover; display: block; }
.evidencia-placeholder { height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem; color: var(--muted); font-size: 0.82rem; }

/* Comentarios */
.comentarios-section { background: var(--blanco); border-radius: 14px; padding: 1.4rem; border: 1px solid var(--border); }
.comentarios-titulo  { font-family: 'Anton', sans-serif; font-size: 0.95rem; color: var(--azul); margin-bottom: 1rem; }
.comentario-form     { display: flex; flex-direction: column; gap: 0.8rem; }
.comentario-textarea { all: unset; border: 1.5px solid var(--border); border-radius: 10px; padding: 0.8rem; font-size: 0.85rem; color: var(--texto); width: 100%; box-sizing: border-box; font-family: 'Open Sans', sans-serif; resize: vertical; min-height: 80px; }
.comentario-textarea:focus { border-color: var(--azul); }
.estado-select { all: unset; border: 1.5px solid var(--border); border-radius: 8px; padding: 0.5rem 0.7rem; font-size: 0.82rem; color: var(--texto); width: 100%; box-sizing: border-box; background: var(--blanco); cursor: pointer; }

/* Historial */
.tabla-container { overflow-x: auto; border-radius: 14px; border: 1px solid var(--border); }
.tabla { width: 100%; border-collapse: collapse; background: var(--blanco); font-size: 0.82rem; }
.tabla thead tr { background: #F8FAFC; }
.tabla th { padding: 0.9rem 1rem; text-align: left; font-size: 0.72rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid var(--border); }
.tabla td { padding: 0.9rem 1rem; border-bottom: 1px solid #F3F4F6; }
.tabla tbody tr:last-child td { border-bottom: none; }

/* Empty state */
.empty-state { text-align: center; padding: 3rem 2rem; background: var(--blanco); border-radius: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
.empty-title { font-family: 'Anton', sans-serif; font-size: 1rem; color: #9CA3AF; }

/* Botones */
.btn-primary { all: unset; cursor: pointer; background: var(--azul); color: #fff; font-size: 0.88rem; font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 100px; display: inline-block; transition: opacity 0.2s; }
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-back { all: unset; cursor: pointer; font-size: 0.85rem; color: var(--muted); transition: color 0.2s; flex-shrink: 0; }
.btn-back:hover { color: var(--azul); }
.dash-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }

/* Alertas */
.alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0.7rem 1.4rem; font-size: 0.82rem; margin: 0 1.4rem 1rem; }
.alert-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; padding: 0.7rem 1.4rem; font-size: 0.82rem; margin: 0 1.4rem 1rem; }

@media (max-width: 1200px) {
  .stats-grid-inicio { grid-template-columns: repeat(2, 1fr); }
  .inicio-bottom { grid-template-columns: 1fr; }
  .atp-header, .atp-row { grid-template-columns: 80px 100px 110px 140px 100px 90px; }
}
@media (max-width: 768px) {
  .stats-grid-inicio { grid-template-columns: 1fr 1fr; }
  .calendario-grid { gap: 1px; }
  .cal-dia-cell { min-height: 60px; }
}
.tipo-icon { font-size: 1.2rem; display: block; margin-bottom: 0.3rem; }
.tipo-options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.btn-guardar-reporte {
  all: unset; cursor: pointer;
  background: linear-gradient(135deg, #1E3A5F, #0C4A6E);
  color: #fff;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.88rem; font-weight: 700;
  padding: 0.75rem 1.8rem; border-radius: 100px;
  display: flex; align-items: center; gap: 0.5rem;
  transition: opacity 0.2s, transform 0.2s;
  -webkit-user-select: none; user-select: none;
}
.btn-guardar-reporte:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.btn-guardar-reporte:disabled { opacity: 0.4; cursor: not-allowed; }
.page-title    { letter-spacing: 0.05em; }
.section-title { letter-spacing: 0.05em; }
.banner-nombre { letter-spacing: 0.05em; }
.mf-nombre     { letter-spacing: 0.05em; }
.gc-val        { letter-spacing: 0.05em; }
.stat-prop-icon-svg { color: var(--cafe); margin-bottom: 0.5rem; }
.logo-img {
  width: 120px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
</style>