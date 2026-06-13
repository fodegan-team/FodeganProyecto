<template>
  <div class="dashboard-root">

    <!-- ══ SIDEBAR ══ -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="/images/LogoFodegan.png" alt="FODEGAN" class="logo-img" />
          <span class="logo-sub" v-if="!sidebarCollapsed">INVERSIONES GANADERAS</span>
        </div>
        <button class="btn-collapse" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline :points="sidebarCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"/>
          </svg>
        </button>
      </div>

      <div class="sidebar-user">
        <FotoPerfil color="#1B4332" />
        <div class="user-info" v-if="!sidebarCollapsed">
          <p class="user-name">{{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</p>
          <p class="user-rol">Inversionista</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <button v-for="item in navItems" :key="item.id"
          class="nav-item" :class="{ active: seccionActiva === item.id }"
          @click="seccionActiva = item.id"
          :title="item.label">
          <span class="nav-icon" v-html="item.icon" />
          <span class="nav-label" v-if="!sidebarCollapsed">{{ item.label }}</span>
          <span class="nav-badge" v-if="item.badge > 0 && !sidebarCollapsed">{{ item.badge }}</span>
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

      <!-- ══ RESUMEN ══ -->
      <section v-if="seccionActiva === 'resumen'" class="seccion sin-padding">

        <!-- Notificación inversión finalizada -->
        <div class="notif-finalizada" v-if="inversionesFinalizadas.length > 0 && mostrarNotifFinalizada">
          <div class="notif-f-left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>{{ inversionesFinalizadas.length }} inversión(es) han llegado a su fin. Revisa tu historial.</span>
          </div>
          <div class="notif-f-right">
            <button @click="seccionActiva = 'historial'">Ver historial</button>
            <button class="notif-close-btn" @click="mostrarNotifFinalizada = false">✕</button>
          </div>
        </div>

        <!-- Hero banner con video -->
        <div class="hero-banner">
          <video autoplay muted loop playsinline class="hero-video">
            <source src="/video/VideoInversorDashboard.mp4" type="video/mp4" />
          </video>
          <div class="hero-overlay" />
          <div class="hero-content">
            <div class="hero-left">
              <p class="hero-tag">PANEL DE INVERSIONISTA</p>
              <h1 class="hero-titulo">Bienvenido, {{ auth.usuario?.nombre }}</h1>
              <p class="hero-sub">Gestiona tus inversiones ganaderas en tiempo real</p>
              <button class="btn-nueva-inversion" @click="seccionActiva = 'invertir'">
                + Nueva inversión
              </button>
            </div>
            <div class="hero-right">
              <div class="hero-mercado">
                <p class="hm-tag">MERCADO ACTUAL</p>
                <p class="hm-roi">12% - 18%</p>
                <p class="hm-lbl">ROI promedio</p>
                <p class="hm-desc">El sector ganadero colombiano presenta condiciones óptimas para nuevos ciclos de ceba.</p>
                <div class="hm-tags">
                  <span>Mercado activo</span>
                  <span>Contratos seguros</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-inv">
            <div class="stat-inv-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <p class="stat-inv-val">{{ formatCOP(totalInvertido) }}</p>
              <p class="stat-inv-lbl">Total invertido</p>
            </div>
          </div>
          <div class="stat-inv-sep"/>
          <div class="stat-inv">
            <div class="stat-inv-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <div>
              <p class="stat-inv-val">12-18%</p>
              <p class="stat-inv-lbl">Rendimiento est.</p>
            </div>
          </div>
          <div class="stat-inv-sep"/>
          <div class="stat-inv">
            <div class="stat-inv-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </svg>
            </div>
            <div>
              <p class="stat-inv-val">{{ misInversiones.length }}</p>
              <p class="stat-inv-lbl">Inversiones activas</p>
            </div>
          </div>
        </div>

        <!-- Mis inversiones cards -->
        <div class="mis-inv-section">
          <div class="mis-inv-header">
            <h2 class="mis-inv-titulo">Mis inversiones</h2>
            <button class="btn-invertir-sm" @click="seccionActiva = 'invertir'">+ Invertir</button>
          </div>

          <div class="empty-state" v-if="misInversiones.length === 0">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="1.2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            </svg>
            <p class="empty-title">Sin inversiones activas</p>
            <p class="empty-sub">Haz clic en "Invertir" para comenzar</p>
          </div>

          <div class="inv-cards-grid" v-else>
            <div class="inv-card" v-for="inv in misInversiones" :key="inv.id"
              @click="verDetalleInversion(inv)">
              <div class="inv-card-top">
                <div class="inv-card-finca">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>{{ inv.nombre_ficticio }}</span>
                </div>
                <span class="inv-card-estado" :class="inv.estado">● {{ inv.estado }}</span>
              </div>
              <p class="inv-card-monto">{{ formatCOP(inv.monto_cop) }}</p>
              <p class="inv-card-monto-lbl">Monto invertido</p>
              <div class="inv-card-stats">
                <div class="inv-cs">
                  <span class="inv-cs-val">{{ inv.cantidad_animales }}</span>
                  <span class="inv-cs-lbl">Animales</span>
                </div>
                <div class="inv-cs">
                  <span class="inv-cs-val">{{ inv.dias_ciclo }}d</span>
                  <span class="inv-cs-lbl">Ciclo</span>
                </div>
                <div class="inv-cs">
                  <span class="inv-cs-val green">{{ Math.max(inv.dias_restantes || 0, 0) }}d</span>
                  <span class="inv-cs-lbl">Restantes</span>
                </div>
              </div>
              <div class="inv-card-progress">
                <div class="inv-prog-bar">
                  <div class="inv-prog-fill" :style="{ width: Math.min(inv.progreso || 0, 100) + '%' }" />
                </div>
                <span>{{ Math.min(inv.progreso || 0, 100) }}%</span>
              </div>
              <p class="inv-card-fechas">
                Inicio: {{ formatFecha(inv.fecha_inicio_ciclo) }} · Fin: {{ formatFecha(inv.fecha_fin_ciclo) }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══ INVERTIR ══ -->
      <section v-if="seccionActiva === 'invertir'" class="seccion">
        <h1 class="page-titulo">Nueva Inversión</h1>

        <!-- Stepper -->
        <div class="stepper">
          <div v-for="(paso, idx) in pasos" :key="idx" class="step-item">
            <div class="step-circle" :class="{ done: stepActual > idx+1, active: stepActual === idx+1 }">
              <svg v-if="stepActual > idx+1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span v-else>{{ idx+1 }}</span>
            </div>
            <span class="step-label" :class="{ active: stepActual === idx+1 }">{{ paso }}</span>
            <div class="step-line" v-if="idx < pasos.length - 1" :class="{ done: stepActual > idx+1 }" />
          </div>
        </div>

        <!-- Paso 1: Monto -->
        <div class="step-content" v-if="stepActual === 1">
          <h2 class="step-titulo">¿Cuánto deseas invertir?</h2>
          <p class="step-sub">El monto determina cuántos animales puedes adquirir</p>
          <div class="monto-input-wrap">
            <span class="monto-prefix">COP</span>
            <input v-model="montoInversion" type="number" class="monto-input"
              placeholder="Ej: 20000000" min="1000000" step="1000000" />
          </div>
          <div class="monto-info" v-if="montoInversion > 0 && config">
            <p>Con <strong>{{ formatCOP(montoInversion) }}</strong> puedes comprar aproximadamente
              <strong class="green">{{ animalesAproximados }} animales</strong>
              a ${{ config.precio_kilo?.toLocaleString('es-CO') }}/kg con peso aproximado de {{ config.peso_animal_kg }} kg
            </p>
          </div>
          <button class="btn-step" @click="stepActual = 2" :disabled="!montoInversion || montoInversion < 1000000">
            Continuar →
          </button>
        </div>

        <!-- Paso 2: Finca -->
        <div class="step-content" v-if="stepActual === 2">
          <h2 class="step-titulo">Selecciona una finca</h2>
          <p class="step-sub">Fincas con capacidad para {{ animalesAproximados }} animales</p>
          <div v-if="cargandoFincas" class="loading-txt">Buscando fincas disponibles...</div>
          <div class="fincas-disponibles" v-else>
            <div class="empty-state" v-if="fincasDisponibles.length === 0">
              <p class="empty-title">Sin fincas disponibles</p>
              <p class="empty-sub">No hay fincas con capacidad suficiente para tu inversión</p>
            </div>
            <div class="finca-option" v-for="f in fincasDisponibles" :key="f.id"
              :class="{ selected: fincaSeleccionada?.id === f.id }"
              @click="fincaSeleccionada = f">
              <div class="fo-left">
                <p class="fo-nombre">{{ f.nombre_ficticio }}</p>
                <p class="fo-real">{{ f.nombre_real }}</p>
                <p class="fo-ubicacion">{{ f.ubicacion }}</p>
              </div>
              <div class="fo-right">
                <div class="fo-stat">
                  <span class="fo-stat-val">{{ f.hectareas }}</span>
                  <span class="fo-stat-lbl">ha</span>
                </div>
                <div class="fo-stat">
                  <span class="fo-stat-val">{{ f.capacidad_disponible }}</span>
                  <span class="fo-stat-lbl">disp.</span>
                </div>
              </div>
              <div class="fo-check" v-if="fincaSeleccionada?.id === f.id">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="step-btns">
            <button class="btn-step-back" @click="stepActual = 1">← Volver</button>
            <button class="btn-step" @click="stepActual = 3" :disabled="!fincaSeleccionada">Continuar →</button>
          </div>
        </div>

        <!-- Paso 3: Confirmar -->
        <div class="step-content" v-if="stepActual === 3">
          <h2 class="step-titulo">Confirma tu Inversión</h2>
          <div class="confirmar-card">
            <div class="confirm-row">
              <span>Finca</span>
              <strong>{{ fincaSeleccionada?.nombre_ficticio }}</strong>
            </div>
            <div class="confirm-row">
              <span>Monto</span>
              <strong class="green">{{ formatCOP(montoInversion) }} COP</strong>
            </div>
            <div class="confirm-row">
              <span>Animales</span>
              <strong>{{ animalesAproximados }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </strong>
            </div>
          </div>

          <p class="ciclo-label">Duración del ciclo</p>
          <div class="ciclos-opts">
            <button v-for="c in ciclos" :key="c.dias"
              class="ciclo-btn" :class="{ active: cicloSeleccionado === c.dias }"
              @click="cicloSeleccionado = c.dias">
              <span class="ciclo-dias">{{ c.dias }}</span>
              <span class="ciclo-lbl">días</span>
            </button>
          </div>

          <div class="rendimiento-banner">
            <p class="rb-tag">RENDIMIENTO ESTIMADO</p>
            <p class="rb-val">{{ cicloSeleccionado === 120 ? '12%' : cicloSeleccionado === 150 ? '15%' : '18%' }}</p>
            <p class="rb-sub">En {{ cicloSeleccionado }} días · Respaldado por seguro ganadero</p>
          </div>

          <div class="alert-error" v-if="errorInversion">{{ errorInversion }}</div>

          <div class="step-btns">
            <button class="btn-step-back" @click="stepActual = 2">← Volver</button>
            <button class="btn-confirmar-inv" @click="confirmarInversion" :disabled="enviandoInversion">
              {{ enviandoInversion ? 'Enviando...' : '✓ Confirmar inversión' }}
            </button>
          </div>
        </div>

        <!-- Paso 4: Éxito -->
        <div class="step-content exito" v-if="stepActual === 4">
          <div class="exito-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1B4332" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 class="exito-titulo">¡Inversión enviada!</h2>
          <p class="exito-sub">Tu solicitud fue enviada al equipo de FODEGAN. Te contactaremos pronto para la reunión de confirmación.</p>
          <button class="btn-step" @click="seccionActiva = 'resumen'; stepActual = 1">Ver mis inversiones</button>
        </div>

      </section>

      <!-- ══ MIS INVERSIONES ══ -->
      <section v-if="seccionActiva === 'mis-inversiones'" class="seccion">
        <h1 class="page-titulo">Mis Inversiones</h1>

        <div v-if="!inversionDetalle">
          <div class="empty-state" v-if="misInversiones.length === 0">
            <p class="empty-title">Sin inversiones activas</p>
          </div>
          <div class="inv-lista" v-else>
            <div class="inv-lista-row" v-for="inv in misInversiones" :key="inv.id"
              @click="verDetalleInversion(inv)">
              <div class="ilr-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <div class="ilr-info">
                <p class="ilr-finca">{{ inv.nombre_ficticio }}</p>
                <p class="ilr-fecha">Inicio: {{ formatFecha(inv.fecha_inicio_ciclo) }}</p>
              </div>
              <div class="ilr-stats">
                <div class="ilr-stat">
                  <span class="ilr-val">{{ formatCOP(inv.monto_cop) }}</span>
                  <span class="ilr-lbl">Monto</span>
                </div>
                <div class="ilr-stat">
                  <span class="ilr-val">{{ inv.cantidad_animales }}</span>
                  <span class="ilr-lbl">Animales</span>
                </div>
                <div class="ilr-stat">
                  <span class="ilr-val">{{ inv.dias_ciclo }}d</span>
                  <span class="ilr-lbl">Ciclo</span>
                </div>
                <div class="ilr-stat">
                  <span class="ilr-val green">{{ Math.max(inv.dias_restantes || 0, 0) }}d</span>
                  <span class="ilr-lbl">Restantes</span>
                </div>
              </div>
              <div class="ilr-progress">
                <div class="ilr-prog-bar">
                  <div class="ilr-prog-fill" :style="{ width: Math.min(inv.progreso || 0, 100) + '%' }" />
                </div>
                <span>{{ Math.min(inv.progreso || 0, 100) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Detalle inversión -->
        <div v-else>
          <button class="btn-back" @click="inversionDetalle = null">← Volver</button>
          <div v-if="cargandoDetalle" class="loading-txt">Cargando...</div>
          <div v-else class="detalle-layout">
            <div class="detalle-left">
              <div class="detalle-card">
                <div class="dc-header">
                  <div>
                    <p class="dc-tag">INVERSIÓN ACTIVA</p>
                    <h3 class="dc-finca">{{ inversionDetalle.inversion?.nombre_ficticio }}</h3>
                  </div>
                  <span class="inv-card-estado activa">● Activa</span>
                </div>
                <div class="dc-stats">
                  <div class="dc-stat">
                    <p class="dc-stat-val">{{ formatCOP(inversionDetalle.inversion?.monto_cop) }}</p>
                    <p class="dc-stat-lbl">Monto invertido</p>
                  </div>
                  <div class="dc-stat">
                    <p class="dc-stat-val">{{ inversionDetalle.inversion?.cantidad_animales }}</p>
                    <p class="dc-stat-lbl">Animales</p>
                  </div>
                  <div class="dc-stat">
                    <p class="dc-stat-val green">{{ Math.max(inversionDetalle.inversion?.dias_restantes || 0, 0) }}</p>
                    <p class="dc-stat-lbl">Días restantes</p>
                  </div>
                  <div class="dc-stat">
                    <p class="dc-stat-val">{{ inversionDetalle.inversion?.dias_ciclo }}</p>
                    <p class="dc-stat-lbl">Días del ciclo</p>
                  </div>
                </div>
                <div class="dc-progress">
                  <div class="dc-prog-header">
                    <span>Progreso</span>
                    <span>{{ Math.min(inversionDetalle.inversion?.progreso || 0, 100) }}%</span>
                  </div>
                  <div class="dc-prog-bar">
                    <div class="dc-prog-fill" :style="{ width: Math.min(inversionDetalle.inversion?.progreso || 0, 100) + '%' }" />
                  </div>
                </div>
              </div>

              <!-- Seguimiento animales -->
              <div class="detalle-card" style="margin-top: 1rem;">
                <h4 class="dc-section-title">Seguimiento por Animal</h4>
                <div class="animales-tabla-inv">
                  <div class="ati-header">
                    <span>Animal</span>
                    <span>Peso inicial</span>
                    <span>Peso actual</span>
                    <span>Ganancia</span>
                    <span>Registros</span>
                  </div>
                  <div class="ati-row" v-for="animal in inversionDetalle.animales" :key="animal.id">
                    <span class="ati-codigo">{{ animal.codigo }}</span>
                    <span>{{ animal.peso_inicial }} kg</span>
                    <span class="ati-peso">{{ animal.peso_actual || animal.peso_inicial }} kg</span>
                    <span :class="ganancia(animal) >= 0 ? 'green' : 'red'">
                      {{ ganancia(animal) >= 0 ? '+' : '' }}{{ ganancia(animal).toFixed(1) }} kg
                    </span>
                    <span class="ati-reg">{{ animal.registros }} reportes</span>
                  </div>
                  <div class="ati-empty" v-if="!inversionDetalle.animales?.length">
                    Sin registros aún
                  </div>
                </div>
              </div>
            </div>

            <!-- Panel derecho -->
            <div class="detalle-right">
              <!-- Historial de peso promedio -->
              <div class="detalle-card">
                <h4 class="dc-section-title">Historial de Peso Promedio</h4>
                <div class="seg-empty" v-if="!inversionDetalle.seguimiento?.length">
                  <p>Sin registros de peso aún</p>
                </div>
                <div class="seg-lista" v-else>
                  <div class="seg-item" v-for="seg in inversionDetalle.seguimiento" :key="seg.mes_numero">
                    <span class="seg-mes">Mes {{ seg.mes_numero }}</span>
                    <div class="seg-bar-wrap">
                      <div class="seg-bar">
                        <div class="seg-fill" :style="{ width: Math.min((parseFloat(seg.peso_promedio) / 600) * 100, 100) + '%' }" />
                      </div>
                    </div>
                    <span class="seg-peso">{{ parseFloat(seg.peso_promedio).toFixed(1) }} kg</span>
                  </div>
                </div>
              </div>

              <!-- Reportes del zootecnista -->
              <div class="detalle-card" style="margin-top: 1rem;">
                <h4 class="dc-section-title">Reportes del Zootecnista</h4>
                <div class="seg-empty" v-if="!inversionDetalle.reportes?.length">
                  <p>Sin reportes aún</p>
                </div>
                <div class="reporte-inv-item" v-for="rep in inversionDetalle.reportes" :key="rep.id">
                  <div class="rii-header">
                    <span class="rii-tipo">{{ tipoLabelReporte(rep.tipo_revision) }}</span>
                    <span class="rii-fecha">{{ formatFecha(rep.created_at) }}</span>
                  </div>
                  <p class="rii-animal" v-if="rep.animal_codigo">Animal: {{ rep.animal_codigo }}</p>
                  <p class="rii-obs">{{ rep.observaciones }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══ HISTORIAL ══ -->
      <section v-if="seccionActiva === 'historial'" class="seccion">
        <h1 class="page-titulo">Historial de Inversiones</h1>
        <div class="empty-state" v-if="inversionesFinalizadas.length === 0">
          <p class="empty-title">Sin inversiones finalizadas</p>
        </div>
        <div class="inv-lista" v-else>
          <div class="inv-lista-row finalizada" v-for="inv in inversionesFinalizadas" :key="inv.id">
            <div class="ilr-icon finalizada">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="ilr-info">
              <p class="ilr-finca">{{ inv.nombre_ficticio }}</p>
              <p class="ilr-fecha">Finalizada: {{ formatFecha(inv.fecha_fin_ciclo) }}</p>
            </div>
            <div class="ilr-stats">
              <div class="ilr-stat">
                <span class="ilr-val">{{ formatCOP(inv.monto_cop) }}</span>
                <span class="ilr-lbl">Monto</span>
              </div>
              <div class="ilr-stat">
                <span class="ilr-val">{{ inv.cantidad_animales }}</span>
                <span class="ilr-lbl">Animales</span>
              </div>
              <div class="ilr-stat">
                <span class="ilr-val">{{ inv.dias_ciclo }}d</span>
                <span class="ilr-lbl">Ciclo</span>
              </div>
              <div class="ilr-stat">
                <span class="ilr-val green">{{ inv.rendimiento_pct }}%</span>
                <span class="ilr-lbl">Rendimiento</span>
              </div>
            </div>
            <span class="inv-card-estado finalizada">● Finalizada</span>
          </div>
        </div>
      </section>

      <!-- ══ MI PERFIL ══ -->
      <section v-if="seccionActiva === 'perfil'" class="seccion">
        <h1 class="page-titulo">Mi Perfil</h1>
        <div class="perfil-card">
          <div class="perfil-avatar">
            {{ auth.usuario?.nombre?.charAt(0) }}{{ auth.usuario?.apellido?.charAt(0) }}
          </div>
          <div class="perfil-form">
            <div class="pf-row">
              <div class="pf-group">
                <label>Nombre</label>
                <input v-model="perfilForm.nombre" type="text" class="pf-input" />
              </div>
              <div class="pf-group">
                <label>Apellido</label>
                <input v-model="perfilForm.apellido" type="text" class="pf-input" />
              </div>
            </div>
            <div class="pf-row">
              <div class="pf-group">
                <label>Teléfono</label>
                <input v-model="perfilForm.telefono" type="tel" class="pf-input" />
              </div>
              <div class="pf-group">
                <label>Ciudad</label>
                <input v-model="perfilForm.ciudad" type="text" class="pf-input" />
              </div>
            </div>
            <div class="pf-group">
              <label>Correo (no editable)</label>
              <input :value="auth.usuario?.email" type="text" class="pf-input" disabled />
            </div>
            <div class="alert-success" v-if="exitoPerfil">{{ exitoPerfil }}</div>
            <button class="btn-guardar-perfil" @click="guardarPerfil">Guardar cambios</button>
          </div>
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
import FotoPerfil from '@/components/FotoPerfil.vue'

const router  = useRouter()
const auth    = useAuthStore()
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const headers = computed(() => ({ Authorization: `Bearer ${auth.token}` }))

const seccionActiva       = ref('resumen')
const sidebarCollapsed    = ref(false)
const misInversiones      = ref([])
const inversionesFinalizadas = ref([])
const mostrarNotifFinalizada = ref(true)
const fincasDisponibles   = ref([])
const cargandoFincas      = ref(false)
const config              = ref(null)
const inversionDetalle    = ref(null)
const cargandoDetalle     = ref(false)
const errorInversion      = ref('')
const enviandoInversion   = ref(false)
const exitoPerfil         = ref('')

const montoInversion    = ref('')
const fincaSeleccionada = ref(null)
const cicloSeleccionado = ref(120)
const stepActual        = ref(1)

const perfilForm = ref({
  nombre:   auth.usuario?.nombre   || '',
  apellido: auth.usuario?.apellido || '',
  telefono: '',
  ciudad:   ''
})

const pasos  = ['Monto', 'Finca', 'Confirmar']
const ciclos = [{ dias: 120 }, { dias: 150 }, { dias: 180 }]

const navItems = computed(() => [
  { id: 'resumen',        label: 'Resumen',        badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id: 'invertir',       label: 'Invertir',       badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>` },
  { id: 'mis-inversiones',label: 'Mis Inversiones',badge: misInversiones.value.length, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
  { id: 'historial',      label: 'Historial',      badge: inversionesFinalizadas.value.length, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` },
  { id: 'perfil',         label: 'Mi Perfil',      badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
])

const totalInvertido = computed(() =>
  misInversiones.value.reduce((a, i) => a + parseFloat(i.monto_cop || 0), 0)
)

const animalesAproximados = computed(() => {
  if (!montoInversion.value || !config.value) return 0
  const costoAnimal = config.value.precio_kilo * config.value.peso_animal_kg
  return Math.floor(montoInversion.value / costoAnimal)
})

function formatCOP(val) {
  if (!val) return '$0'
  return '$' + Math.round(val).toLocaleString('es-CO')
}
function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
function ganancia(a) {
  return parseFloat(a.peso_actual || a.peso_inicial) - parseFloat(a.peso_inicial)
}
function tipoLabelReporte(tipo) {
  const map = { control_sanitario: 'Control Sanitario', vacunacion: 'Vacunación', control_peso: 'Control de Peso', revision_general: 'Revisión General' }
  return map[tipo] || tipo
}

async function cargarInversiones() {
  try {
    const { data } = await axios.get(`${API}/inversiones/mias`, { headers: headers.value })
    misInversiones.value      = data.filter(i => i.estado === 'activa' || i.estado === 'pendiente_reunion')
    inversionesFinalizadas.value = data.filter(i => i.estado === 'finalizada' || i.estado === 'cancelada')
  } catch {}
}

async function cargarConfig() {
  try {
    const { data } = await axios.get(`${API}/inversiones/configuracion`)
    config.value = data
  } catch {}
}

async function buscarFincas() {
  if (!montoInversion.value) return
  cargandoFincas.value = true
  try {
    const { data } = await axios.get(`${API}/fincas/disponibles?monto=${montoInversion.value}`, { headers: headers.value })
    fincasDisponibles.value = data.fincas  // ← antes era solo data
  } catch {}
  cargandoFincas.value = false
}

async function verDetalleInversion(inv) {
  inversionDetalle.value = inv
  seccionActiva.value    = 'mis-inversiones'
  cargandoDetalle.value  = true
  try {
    const { data } = await axios.get(`${API}/inversiones/${inv.id}`, { headers: headers.value })
    inversionDetalle.value = data
  } catch {}
  cargandoDetalle.value = false
}

async function confirmarInversion() {
  if (!fincaSeleccionada.value || !montoInversion.value) return
  enviandoInversion.value = true
  errorInversion.value    = ''
  try {
    await axios.post(`${API}/inversiones`, {
      finca_id:    fincaSeleccionada.value.id,
      monto_cop:   montoInversion.value,
      dias_ciclo:  cicloSeleccionado.value
    }, { headers: headers.value })
    stepActual.value = 4
    await cargarInversiones()
  } catch (err) {
    errorInversion.value = err.response?.data?.error || 'Error creando inversión'
  } finally {
    enviandoInversion.value = false
  }
}

async function guardarPerfil() {
  try {
    await axios.put(`${API}/auth/perfil`, perfilForm.value, { headers: headers.value })
    exitoPerfil.value = '✓ Perfil actualizado correctamente'
    setTimeout(() => { exitoPerfil.value = '' }, 3000)
  } catch {}
}

async function cerrarSesion() {
  await auth.logout()
  router.push('/')
}

// Watch paso 2 para buscar fincas
import { watch } from 'vue'
watch(stepActual, (val) => {
  if (val === 2) buscarFincas()
})

onMounted(() => {
  cargarInversiones()
  cargarConfig()
})
</script>

<style scoped>
.dashboard-root {
  --verde:    #1B4332;
  --verde-mid:#2D6A4F;
  --verde-cl: #D8F3DC;
  --dorado:   #C8952A;
  --blanco:   #FFFFFF;
  --texto:    #111827;
  --muted:    #6B7280;
  --border:   #E5E7EB;
  --bg:       #F6F8F7;

  display: flex; min-height: 100vh;
  background: var(--bg);
  font-family: 'Open Sans', sans-serif;
}

/* SIDEBAR */
.sidebar {
  width: 220px; flex-shrink: 0;
  background: #132A1E;
  display: flex; flex-direction: column;
  padding: 1.2rem 0.8rem;
  position: sticky; top: 0; height: 100vh;
  transition: width 0.25s ease;
  box-shadow: 4px 0 20px rgba(0,0,0,0.2);
}
.sidebar.collapsed { width: 64px; }

.sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; padding: 0 0.4rem; }
.sidebar-logo { display: flex; flex-direction: column; overflow: hidden; }
.logo-img { width: 100px; object-fit: contain; filter: brightness(0) invert(1); }
.logo-sub { font-size: 0.48rem; letter-spacing: 0.12em; color: rgba(255,255,255,0.3); text-transform: uppercase; margin-top: 0.2rem; white-space: nowrap; }
.btn-collapse { all: unset; cursor: pointer; width: 24px; height: 24px; border-radius: 6px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); flex-shrink: 0; transition: background 0.2s; }
.btn-collapse:hover { background: rgba(255,255,255,0.15); color: #fff; }

.sidebar-user { display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 0.6rem; border-radius: 10px; background: rgba(255,255,255,0.07); margin-bottom: 1.2rem; overflow: hidden; }
.user-avatar  { width: 34px; height: 34px; border-radius: 50%; background: var(--dorado); color: #fff; font-family: 'Anton', sans-serif; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-name { font-size: 0.75rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-rol  { font-size: 0.6rem; color: rgba(255,255,255,0.4); }

.sidebar-nav { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; }
.nav-item { all: unset; cursor: pointer; display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 0.7rem; border-radius: 8px; font-size: 0.82rem; color: rgba(255,255,255,0.55); transition: all 0.2s; -webkit-user-select: none; user-select: none; white-space: nowrap; overflow: hidden; }
.nav-item:hover  { background: rgba(255,255,255,0.07); color: #fff; }
.nav-item.active { background: var(--verde); color: #fff; font-weight: 600; }
.nav-icon { flex-shrink: 0; display: flex; }
.nav-label { flex: 1; }
.nav-badge { background: var(--dorado); color: #fff; font-size: 0.62rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 100px; }

.btn-logout { all: unset; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 0.7rem; border-radius: 8px; font-size: 0.8rem; color: rgba(255,255,255,0.35); transition: all 0.2s; white-space: nowrap; overflow: hidden; }
.btn-logout:hover { color: #fff; background: rgba(220,38,38,0.2); }

/* MAIN */
.main-content { flex: 1; overflow-y: auto; }
.seccion { padding: 2rem; }
.seccion.sin-padding { padding: 0; }
.page-titulo { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: var(--verde); letter-spacing: 0.04em; margin-bottom: 1.5rem; }

/* NOTIF FINALIZADA */
.notif-finalizada {
  background: #D1FAE5; border-bottom: 1px solid #6EE7B7;
  padding: 0.8rem 1.5rem; display: flex; align-items: center; justify-content: space-between;
}
.notif-f-left { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: #065F46; font-weight: 600; }
.notif-f-right { display: flex; align-items: center; gap: 0.6rem; }
.notif-f-right button { all: unset; cursor: pointer; font-size: 0.78rem; font-weight: 700; color: #065F46; background: rgba(0,0,0,0.08); padding: 0.3rem 0.8rem; border-radius: 100px; }
.notif-close-btn { background: transparent !important; font-size: 0.85rem !important; }

/* HERO */
.hero-banner { position: relative; height: 280px; overflow: hidden; }
.hero-video  { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(19,42,30,0.88) 0%, rgba(27,67,50,0.75) 100%); }
.hero-content { position: relative; z-index: 1; height: 100%; display: flex; align-items: center; justify-content: space-between; padding: 2rem 2.5rem; gap: 2rem; }
.hero-left { flex: 1; }
.hero-tag  { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em; color: var(--dorado); text-transform: uppercase; margin-bottom: 0.5rem; }
.hero-titulo { font-family: 'Anton', sans-serif; font-size: 2.2rem; color: #fff; letter-spacing: 0.04em; margin-bottom: 0.4rem; }
.hero-sub    { font-size: 0.85rem; color: rgba(255,255,255,0.65); margin-bottom: 1.2rem; }
.btn-nueva-inversion {
  all: unset; cursor: pointer;
  background: var(--dorado); color: #fff;
  font-family: 'Open Sans', sans-serif; font-size: 0.88rem; font-weight: 700;
  padding: 0.75rem 1.6rem; border-radius: 100px;
  transition: opacity 0.2s;
}
.btn-nueva-inversion:hover { opacity: 0.88; }

.hero-right { flex-shrink: 0; }
.hero-mercado { background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); border-radius: 14px; padding: 1.2rem 1.4rem; min-width: 220px; border: 1px solid rgba(255,255,255,0.15); }
.hm-tag  { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; color: var(--dorado); text-transform: uppercase; margin-bottom: 0.3rem; }
.hm-roi  { font-family: 'Anton', sans-serif; font-size: 1.8rem; color: #fff; letter-spacing: 0.04em; }
.hm-lbl  { font-size: 0.72rem; color: rgba(255,255,255,0.5); margin-bottom: 0.5rem; }
.hm-desc { font-size: 0.72rem; color: rgba(255,255,255,0.6); line-height: 1.5; margin-bottom: 0.8rem; }
.hm-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.hm-tags span { font-size: 0.65rem; font-weight: 600; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); padding: 0.2rem 0.6rem; border-radius: 100px; }

/* STATS */
.stats-row { display: flex; align-items: center; background: var(--blanco); border-bottom: 1px solid var(--border); padding: 1.2rem 2.5rem; gap: 2rem; }
.stat-inv { display: flex; align-items: center; gap: 0.8rem; }
.stat-inv-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--bg); display: flex; align-items: center; justify-content: center; color: var(--muted); }
.stat-inv-val { font-family: 'Anton', sans-serif; font-size: 1.2rem; color: var(--texto); letter-spacing: 0.02em; }
.stat-inv-lbl { font-size: 0.72rem; color: var(--muted); }
.stat-inv-sep { width: 1px; height: 36px; background: var(--border); }

/* MIS INVERSIONES CARDS */
.mis-inv-section { padding: 1.5rem 2.5rem 2rem; }
.mis-inv-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.2rem; }
.mis-inv-titulo { font-family: 'Anton', sans-serif; font-size: 1.2rem; color: var(--texto); letter-spacing: 0.03em; }
.btn-invertir-sm { all: unset; cursor: pointer; background: var(--verde); color: #fff; font-size: 0.82rem; font-weight: 600; padding: 0.5rem 1.2rem; border-radius: 100px; font-family: 'Open Sans', sans-serif; transition: opacity 0.2s; }
.btn-invertir-sm:hover { opacity: 0.88; }

.inv-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 1rem; }
.inv-card { background: var(--blanco); border-radius: 14px; padding: 1.2rem; border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; }
.inv-card:hover { border-color: var(--verde-mid); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.inv-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
.inv-card-finca { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600; color: var(--texto); }
.inv-card-estado { font-size: 0.68rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 100px; }
.inv-card-estado.activa             { background: var(--verde-cl); color: var(--verde); }
.inv-card-estado.pendiente_reunion  { background: #FEF3C7; color: #92400E; }
.inv-card-estado.finalizada         { background: #F3F4F6; color: #374151; }
.inv-card-monto     { font-family: 'Anton', sans-serif; font-size: 1.2rem; color: var(--texto); letter-spacing: 0.02em; }
.inv-card-monto-lbl { font-size: 0.68rem; color: var(--muted); margin-bottom: 0.8rem; }
.inv-card-stats { display: flex; gap: 1rem; margin-bottom: 0.8rem; }
.inv-cs-val { font-weight: 700; color: var(--texto); font-size: 0.88rem; display: block; }
.inv-cs-lbl { font-size: 0.65rem; color: var(--muted); }
.inv-card-progress { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; font-size: 0.72rem; color: var(--muted); }
.inv-prog-bar  { flex: 1; height: 4px; background: #E5E7EB; border-radius: 100px; overflow: hidden; }
.inv-prog-fill { height: 100%; background: var(--verde); border-radius: 100px; }
.inv-card-fechas { font-size: 0.68rem; color: var(--muted); }

/* LISTA INVERSIONES */
.inv-lista { display: flex; flex-direction: column; gap: 0.6rem; }
.inv-lista-row { background: var(--blanco); border-radius: 12px; padding: 1rem 1.4rem; border: 1px solid var(--border); display: flex; align-items: center; gap: 1.2rem; cursor: pointer; transition: all 0.2s; }
.inv-lista-row:hover { border-color: var(--verde-mid); }
.inv-lista-row.finalizada { cursor: default; opacity: 0.85; }
.inv-lista-row.finalizada:hover { border-color: var(--border); }
.ilr-icon { width: 44px; height: 44px; border-radius: 10px; background: var(--verde-cl); color: var(--verde); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ilr-icon.finalizada { background: #F3F4F6; color: var(--muted); }
.ilr-info { flex: 1; min-width: 0; }
.ilr-finca { font-weight: 700; color: var(--texto); font-size: 0.88rem; }
.ilr-fecha { font-size: 0.72rem; color: var(--muted); margin-top: 0.1rem; }
.ilr-stats { display: flex; gap: 1.5rem; }
.ilr-val { font-weight: 700; color: var(--texto); font-size: 0.88rem; display: block; }
.ilr-lbl { font-size: 0.65rem; color: var(--muted); }
.ilr-progress { display: flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; color: var(--muted); min-width: 100px; }
.ilr-prog-bar  { flex: 1; height: 4px; background: #E5E7EB; border-radius: 100px; overflow: hidden; }
.ilr-prog-fill { height: 100%; background: var(--verde); border-radius: 100px; }

/* INVERTIR STEPPER */
.stepper { display: flex; align-items: center; margin-bottom: 2rem; }
.step-item { display: flex; align-items: center; gap: 0.5rem; }
.step-circle { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.82rem; font-weight: 700; color: var(--muted); transition: all 0.3s; flex-shrink: 0; }
.step-circle.active { border-color: var(--verde); background: var(--verde); color: #fff; }
.step-circle.done   { border-color: var(--verde); background: var(--verde); color: #fff; }
.step-label { font-size: 0.8rem; color: var(--muted); white-space: nowrap; }
.step-label.active { color: var(--verde); font-weight: 600; }
.step-line { flex: 1; height: 2px; background: var(--border); margin: 0 0.8rem; min-width: 40px; transition: background 0.3s; }
.step-line.done { background: var(--verde); }

.step-content { max-width: 540px; }
.step-titulo { font-family: 'Anton', sans-serif; font-size: 1.2rem; color: var(--texto); letter-spacing: 0.03em; margin-bottom: 0.4rem; }
.step-sub    { font-size: 0.82rem; color: var(--muted); margin-bottom: 1.2rem; }

.monto-input-wrap { display: flex; align-items: center; border: 2px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 1rem; transition: border-color 0.2s; }
.monto-input-wrap:focus-within { border-color: var(--verde); }
.monto-prefix { padding: 0.9rem 1rem; background: #F9FAFB; font-weight: 700; color: var(--muted); font-size: 0.85rem; border-right: 1px solid var(--border); }
.monto-input  { all: unset; flex: 1; padding: 0.9rem 1rem; font-size: 1rem; color: var(--texto); }
.monto-info   { background: var(--verde-cl); border-radius: 10px; padding: 0.8rem 1rem; font-size: 0.82rem; color: var(--verde); margin-bottom: 1.2rem; line-height: 1.6; }

.fincas-disponibles { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.2rem; max-height: 350px; overflow-y: auto; }
.finca-option { background: var(--blanco); border: 2px solid var(--border); border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: all 0.2s; position: relative; }
.finca-option:hover    { border-color: var(--verde-mid); }
.finca-option.selected { border-color: var(--verde); background: #F0FDF4; }
.fo-left    { flex: 1; }
.fo-nombre  { font-weight: 700; color: var(--texto); font-size: 0.88rem; }
.fo-real    { font-size: 0.75rem; color: var(--muted); margin-top: 0.1rem; }
.fo-ubicacion { font-size: 0.7rem; color: var(--muted); }
.fo-right   { display: flex; gap: 0.8rem; flex-shrink: 0; }
.fo-stat    { text-align: center; }
.fo-stat-val { font-family: 'Anton', sans-serif; font-size: 1rem; color: var(--texto); display: block; }
.fo-stat-lbl { font-size: 0.62rem; color: var(--muted); text-transform: uppercase; }
.fo-check   { width: 24px; height: 24px; border-radius: 50%; background: var(--verde); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.confirmar-card { background: #F0FDF4; border-radius: 12px; padding: 1.2rem; margin-bottom: 1.2rem; }
.confirm-row    { display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--muted); padding: 0.5rem 0; border-bottom: 1px solid #D1FAE5; }
.confirm-row:last-child { border-bottom: none; }
.confirm-row strong { color: var(--texto); }

.ciclo-label { font-size: 0.82rem; font-weight: 600; color: var(--texto); margin-bottom: 0.6rem; }
.ciclos-opts { display: flex; gap: 0.6rem; margin-bottom: 1.2rem; }
.ciclo-btn { all: unset; cursor: pointer; border: 2px solid var(--border); border-radius: 10px; padding: 0.8rem 1.2rem; text-align: center; transition: all 0.2s; -webkit-user-select: none; user-select: none; }
.ciclo-btn.active { border-color: var(--verde); background: var(--verde); }
.ciclo-dias { display: block; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: var(--texto); }
.ciclo-btn.active .ciclo-dias { color: #fff; }
.ciclo-lbl  { display: block; font-size: 0.65rem; color: var(--muted); text-transform: uppercase; }
.ciclo-btn.active .ciclo-lbl { color: rgba(255,255,255,0.7); }

.rendimiento-banner { background: var(--verde); border-radius: 12px; padding: 1.5rem; text-align: center; margin-bottom: 1.2rem; }
.rb-tag { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; color: rgba(255,255,255,0.6); text-transform: uppercase; margin-bottom: 0.4rem; }
.rb-val { font-family: 'Anton', sans-serif; font-size: 2rem; color: #fff; letter-spacing: 0.04em; }
.rb-sub { font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-top: 0.3rem; }

.step-btns { display: flex; gap: 0.8rem; margin-top: 1rem; }
.btn-step { all: unset; cursor: pointer; background: var(--verde); color: #fff; font-family: 'Open Sans', sans-serif; font-size: 0.88rem; font-weight: 700; padding: 0.85rem 2rem; border-radius: 100px; transition: opacity 0.2s; -webkit-user-select: none; user-select: none; }
.btn-step:hover:not(:disabled) { opacity: 0.88; }
.btn-step:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-step-back { all: unset; cursor: pointer; font-size: 0.85rem; color: var(--muted); transition: color 0.2s; }
.btn-step-back:hover { color: var(--texto); }
.btn-confirmar-inv { all: unset; cursor: pointer; background: var(--verde); color: #fff; font-family: 'Open Sans', sans-serif; font-size: 0.88rem; font-weight: 700; padding: 0.85rem 2rem; border-radius: 100px; width: 100%; text-align: center; box-sizing: border-box; transition: opacity 0.2s; }
.btn-confirmar-inv:hover:not(:disabled) { opacity: 0.88; }
.btn-confirmar-inv:disabled { opacity: 0.45; cursor: not-allowed; }

.exito { text-align: center; padding-top: 3rem; }
.exito-icon { width: 80px; height: 80px; border-radius: 50%; background: var(--verde-cl); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem; }
.exito-titulo { font-family: 'Anton', sans-serif; font-size: 1.5rem; color: var(--verde); margin-bottom: 0.5rem; letter-spacing: 0.04em; }
.exito-sub    { font-size: 0.88rem; color: var(--muted); margin-bottom: 1.5rem; line-height: 1.6; max-width: 400px; margin-left: auto; margin-right: auto; }

/* DETALLE INVERSIÓN */
.btn-back { all: unset; cursor: pointer; font-size: 0.85rem; color: var(--muted); transition: color 0.2s; display: inline-block; margin-bottom: 1.2rem; }
.btn-back:hover { color: var(--verde); }
.detalle-layout { display: grid; grid-template-columns: 1fr 380px; gap: 1.2rem; }
.detalle-card { background: var(--blanco); border-radius: 14px; padding: 1.4rem; border: 1px solid var(--border); }
.dc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem; }
.dc-tag   { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.12em; color: var(--muted); text-transform: uppercase; }
.dc-finca { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--verde); letter-spacing: 0.03em; }
.dc-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1rem; }
.dc-stat-val { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--texto); }
.dc-stat-lbl { font-size: 0.68rem; color: var(--muted); margin-top: 0.1rem; }
.dc-progress { }
.dc-prog-header { display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--muted); margin-bottom: 0.4rem; }
.dc-prog-bar  { height: 6px; background: #E5E7EB; border-radius: 100px; overflow: hidden; }
.dc-prog-fill { height: 100%; background: var(--verde); border-radius: 100px; }

.dc-section-title { font-family: 'Anton', sans-serif; font-size: 0.9rem; color: var(--texto); letter-spacing: 0.03em; margin-bottom: 1rem; }

.animales-tabla-inv { }
.ati-header { display: grid; grid-template-columns: 80px 90px 90px 80px 80px; gap: 0.5rem; padding: 0.5rem 0; font-size: 0.65rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid var(--border); }
.ati-row    { display: grid; grid-template-columns: 80px 90px 90px 80px 80px; gap: 0.5rem; padding: 0.7rem 0; border-bottom: 1px solid #F3F4F6; font-size: 0.82rem; align-items: center; }
.ati-row:last-child { border-bottom: none; }
.ati-codigo { font-weight: 700; color: var(--verde); font-family: monospace; }
.ati-peso   { font-weight: 700; }
.ati-reg    { font-size: 0.72rem; color: var(--muted); }
.ati-empty  { text-align: center; padding: 1rem; font-size: 0.82rem; color: var(--muted); }

.seg-lista { display: flex; flex-direction: column; gap: 0.6rem; }
.seg-item  { display: flex; align-items: center; gap: 0.6rem; font-size: 0.78rem; }
.seg-mes   { color: var(--muted); width: 40px; flex-shrink: 0; }
.seg-bar-wrap { flex: 1; }
.seg-bar   { height: 6px; background: #E5E7EB; border-radius: 100px; overflow: hidden; }
.seg-fill  { height: 100%; background: var(--verde); border-radius: 100px; }
.seg-peso  { color: var(--texto); font-weight: 600; width: 60px; text-align: right; flex-shrink: 0; }
.seg-empty { text-align: center; padding: 1.5rem; font-size: 0.82rem; color: var(--muted); }

.reporte-inv-item { padding: 0.8rem 0; border-bottom: 1px solid #F3F4F6; }
.reporte-inv-item:last-child { border-bottom: none; }
.rii-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }
.rii-tipo   { font-size: 0.72rem; font-weight: 700; background: var(--verde-cl); color: var(--verde); padding: 0.2rem 0.6rem; border-radius: 100px; }
.rii-fecha  { font-size: 0.7rem; color: var(--muted); }
.rii-animal { font-size: 0.72rem; color: var(--muted); margin-bottom: 0.2rem; }
.rii-obs    { font-size: 0.82rem; color: var(--texto); line-height: 1.5; }

/* PERFIL */
.perfil-card { background: var(--blanco); border-radius: 16px; padding: 2rem; border: 1px solid var(--border); max-width: 600px; }
.perfil-avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--verde); color: #fff; font-family: 'Anton', sans-serif; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
.perfil-form { display: flex; flex-direction: column; gap: 1rem; }
.pf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.pf-group { display: flex; flex-direction: column; gap: 0.35rem; }
.pf-group label { font-size: 0.75rem; font-weight: 600; color: var(--texto); }
.pf-input { all: unset; border: 1.5px solid var(--border); border-radius: 10px; padding: 0.7rem 0.9rem; font-size: 0.88rem; color: var(--texto); background: var(--blanco); width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
.pf-input:focus { border-color: var(--verde); }
.pf-input:disabled { background: #F9FAFB; color: var(--muted); }
.btn-guardar-perfil { all: unset; cursor: pointer; background: var(--verde); color: #fff; font-family: 'Open Sans', sans-serif; font-size: 0.88rem; font-weight: 600; padding: 0.8rem 1.8rem; border-radius: 100px; display: inline-block; margin-top: 0.5rem; transition: opacity 0.2s; }
.btn-guardar-perfil:hover { opacity: 0.88; }

/* MISC */
.green { color: #16a34a; font-weight: 700; }
.red   { color: #dc2626; font-weight: 700; }
.loading-txt { text-align: center; padding: 2rem; color: var(--muted); font-size: 0.88rem; }
.alert-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 8px; padding: 0.7rem 1rem; font-size: 0.82rem; margin-bottom: 1rem; }
.alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0.7rem 1rem; font-size: 0.82rem; margin-bottom: 1rem; }
.empty-state { text-align: center; padding: 3rem; background: var(--blanco); border-radius: 14px; border: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.empty-title { font-family: 'Anton', sans-serif; font-size: 1rem; color: #9CA3AF; letter-spacing: 0.03em; }
.empty-sub   { font-size: 0.78rem; color: #D1D5DB; }

@media (max-width: 1100px) {
  .detalle-layout { grid-template-columns: 1fr; }
  .hero-right { display: none; }
}
@media (max-width: 768px) {
  .inv-cards-grid { grid-template-columns: 1fr; }
  .stats-row { flex-wrap: wrap; }
}
</style>