<template>
  <div class="dashboard-root">

    <!-- ══ SIDEBAR ══ -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="sidebar-logo">
          <img src="/images/LogoFodegan.png" alt="FODEGAN" class="logo-img" />
          <span class="logo-sub">ADMINISTRADOR</span>
        </div>
      </div>

      <div class="sidebar-user">
        <FotoPerfil color="#374151" />
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
                      <!-- Pendiente reunion -->
                      <template v-if="inv.estado === 'pendiente_reunion'">
                        <button class="btn-ver-animales" @click="abrirRegistroAnimales(inv)">
                          ✏ Registrar animales
                        </button>
                        <button class="btn-aprobar" @click="aprobarInversion(inv.id)">✓ Aprobar</button>
                        <button class="btn-rechazar" @click="abrirRechazarInversion(inv)">✗ Rechazar</button>
                      </template>
                      <!-- Activa -->
                      <template v-else-if="inv.estado === 'activa'">
                        <button class="btn-ver-animales" @click="verAnimales(inv)">
                          {{ inversionExpandida?.id === inv.id ? '▲ Ocultar' : '▼ Animales' }}
                        </button>
                        <button class="btn-ver-animales" style="background:#EDE9FE;color:#6D28D9;" @click="verReportes(inv)">
                          {{ reportesExpandidos?.id === inv.id ? '▲ Ocultar' : '▼ Reportes' }}
                        </button>
                        <button class="btn-finalizar" @click="abrirFinalizarInversion(inv)">⏹ Finalizar</button>
                      </template>
                      <span v-else class="td-email">—</span>
                    </div>
                  </td>
                </tr>

                <!-- Fila expandida animales -->
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

                <!-- Fila expandida reportes -->
                <tr v-if="reportesExpandidos?.id === inv.id" class="fila-expandida">
                  <td colspan="8">
                    <div class="animales-expand" v-if="cargandoReportes">Cargando reportes...</div>
                    <div class="animales-expand" v-else>
                      <p class="animales-titulo">Reportes técnicos — {{ inv.nombre_ficticio }}</p>
                      <div class="sin-animales" v-if="reportesInversion.length === 0">
                        No hay reportes registrados aún.
                      </div>
                      <div class="reportes-lista-admin" v-else>
                        <div class="reporte-admin-item" v-for="rep in reportesInversion" :key="rep.id">
                          <div class="rai-header">
                            <div class="rai-left">
                              <span class="rai-tipo" :class="tipoColorReporte(rep.tipo_revision)">
                                {{ tipoLabelReporte(rep.tipo_revision) }}
                              </span>
                              <span class="rai-animal" v-if="rep.animal_codigo">
                                {{ rep.animal_codigo }}
                              </span>
                              <span class="rai-estado">
                                {{ estadoAnimalLabel(rep.estado_animal) }}
                              </span>
                            </div>
                            <div class="rai-right">
                              <span class="rai-zoo">Dr. {{ rep.zootecnista_nombre }}</span>
                              <span class="rai-fecha">{{ formatFecha(rep.created_at) }}</span>
                              <span class="rai-evid" v-if="rep.evidencias > 0">
                                📷 {{ rep.evidencias }} evidencia(s)
                              </span>
                            </div>
                          </div>
                          <p class="rai-obs">{{ rep.observaciones }}</p>
                        </div>
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
              <div style="flex:1;">
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

            <button class="btn-asignar-finca" @click="abrirAsignarFinca(zoo)">
              + Asignar finca
            </button>
          </div>
        </div>
      </section>

      <!-- ══ VISITAS ══ -->
      <section v-if="seccionActiva === 'visitas'" class="seccion">
        <div class="section-header">
          <h2 class="section-title">Calendario de Visitas</h2>
        </div>

        <div class="calendario-wrap">
          <div class="calendario-nav">
            <button class="cal-nav-btn" @click="mesAnterior">‹</button>
            <h3 class="cal-mes-titulo">{{ nombreMes }}</h3>
            <button class="cal-nav-btn" @click="mesSiguiente">›</button>
          </div>

          <div class="cal-leyenda">
            <span class="leyenda-item cal-azul">Pesaje</span>
            <span class="leyenda-item cal-verde">Vacunación</span>
            <span class="leyenda-item cal-cyan">Revisión</span>
            <span class="leyenda-item cal-naranja">Control Sanitario</span>
          </div>

          <div class="calendario-grid">
            <div class="cal-dia-header" v-for="d in ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']" :key="d">{{ d }}</div>
            <div
              v-for="(dia, idx) in diasCalendario" :key="idx"
              class="cal-dia-cell"
              :class="{
                'otro-mes':     !dia.esEsteMes,
                'es-pasado':    dia.esPasado && dia.esEsteMes,
                'es-hoy':       dia.esHoy,
                'es-futuro':    !dia.esPasado && dia.esEsteMes && !dia.esHoy,
                'tiene-visita': dia.visitas.length > 0
              }"
              @click="abrirModalVisita(dia)"
            >
              <span class="cal-num">{{ dia.numero }}</span>
              <div class="cal-visitas">
                <div v-for="v in dia.visitas.slice(0,2)" :key="v.id"
                  class="cal-visita-chip" :class="'cal-' + tipoColor(v.tipo)">
                  <span class="cal-chip-zoo">{{ v.zootecnista_nombre }}</span>
                  <span class="cal-chip-tipo">{{ tipoLabel(v.tipo) }}</span>
                  <span class="cal-chip-estado" :class="v.estado">● {{ v.estado }}</span>
                </div>
                <span v-if="dia.visitas.length > 2" class="cal-mas">+{{ dia.visitas.length - 2 }} más</span>
              </div>
            </div>
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

    <!-- ══ MODAL CREAR VISITA ══ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modalVisita" @click.self="modalVisita = false">
        <div class="modal-card" style="max-width: 520px;">
          <h3 class="modal-titulo">Programar Visita</h3>
          <p class="modal-sub">{{ diaSeleccionado ? formatFecha(diaSeleccionado.fecha) : '' }}</p>

          <div class="visita-form">
            <div class="vf-group">
              <label class="vf-label">Zootecnista</label>
              <div class="vf-select-wrap">
                <select v-model="visitaForm.zootecnista_id" @change="cargarInversionesZootecnista" class="vf-select">
                  <option value="">Selecciona un zootecnista</option>
                  <option v-for="z in zootecnistas" :key="z.id" :value="z.id">
                    {{ z.nombre }} {{ z.apellido }}
                  </option>
                </select>
              </div>
            </div>

            <div class="vf-group" v-if="visitaForm.zootecnista_id">
              <label class="vf-label">Inversión / Finca</label>
              <div v-if="cargandoInversiones" class="vf-loading">Cargando inversiones...</div>
              <div class="vf-select-wrap" v-else>
                <select v-model="visitaForm.finca_id" class="vf-select">
                  <option value="">Selecciona una inversión</option>
                  <option v-for="inv in inversionesZootecnista" :key="inv.id" :value="inv.finca_id">
                    {{ inv.nombre_ficticio }} — {{ inv.cantidad_animales }} animales
                  </option>
                </select>
              </div>
            </div>

            <div class="vf-group">
              <label class="vf-label">Tipo de visita</label>
              <div class="tipo-visita-options">
                <button
                  v-for="t in [
                    { val: 'pesaje',            label: 'Pesaje',            color: 'azul'    },
                    { val: 'vacunacion',        label: 'Vacunación',        color: 'verde'   },
                    { val: 'revision',          label: 'Revisión',          color: 'cyan'    },
                    { val: 'control_sanitario', label: 'Control Sanitario', color: 'naranja' }
                  ]"
                  :key="t.val"
                  class="tipo-visita-btn"
                  :class="{ active: visitaForm.tipo === t.val, ['tv-' + t.color]: visitaForm.tipo === t.val }"
                  @click="visitaForm.tipo = t.val">
                  {{ t.label }}
                </button>
              </div>
            </div>

            <div class="vf-row">
              <div class="vf-group">
                <label class="vf-label">Hora</label>
                <input v-model="visitaForm.hora_visita" type="time" class="vf-input" />
              </div>
            </div>

            <div class="vf-group">
              <label class="vf-label">Notas (opcional)</label>
              <textarea v-model="visitaForm.notas" rows="2" placeholder="Instrucciones adicionales..." class="vf-textarea"></textarea>
            </div>
          </div>

          <div class="modal-btns">
            <button class="btn-secondary" @click="modalVisita = false">Cancelar</button>
            <button class="btn-primary" @click="crearVisita"
              :disabled="!visitaForm.zootecnista_id || !visitaForm.finca_id">
              📅 Guardar visita
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ MODAL REGISTRO ANIMALES ══ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modalAnimales" @click.self="modalAnimales = false">
        <div class="modal-animales-wrap">
          <div class="modal-animales-header">
            <div>
              <h3 class="modal-titulo">Registrar Pesos de Animales</h3>
              <p class="modal-sub">
                {{ inversionAnimales?.inversor_nombre }} —
                {{ inversionAnimales?.cantidad_animales }} animales en {{ inversionAnimales?.nombre_ficticio }}
              </p>
            </div>
            <button class="modal-close" @click="modalAnimales = false">✕</button>
          </div>

          <div class="modal-animales-body">
            <div class="af-header">
              <span>Código</span>
              <span>Peso Inicial (kg) *</span>
            </div>
            <div class="af-row" v-for="(animal, idx) in animalesForm" :key="idx">
              <input v-model="animal.codigo" type="text" class="af-input codigo" placeholder="GAN001" />
              <div class="af-peso-wrap">
                <input
                  v-model="animal.peso_inicial" type="number"
                  class="af-input" :class="{ 'af-filled': animal.peso_inicial > 0 }"
                  placeholder="Ej: 285" min="0"
                />
                <span class="af-kg">kg</span>
              </div>
            </div>

            <div class="af-resumen" v-if="animalesForm.filter(a => a.peso_inicial > 0).length > 0">
              <span>Registrados: <strong>{{ animalesForm.filter(a => a.peso_inicial > 0).length }}</strong>/{{ animalesForm.length }}</span>
              <span>Peso promedio: <strong>{{ promedioAnimales }}</strong> kg</span>
            </div>

            <div class="alert-success" v-if="exitoAnimales">{{ exitoAnimales }}</div>
            <div class="alert-error"   v-if="errorAnimales">{{ errorAnimales }}</div>
          </div>

          <div class="modal-animales-footer">
            <button class="btn-secondary" @click="modalAnimales = false">Cancelar</button>
            <button class="btn-primary" @click="guardarAnimales" :disabled="guardandoAnimales">
              {{ guardandoAnimales ? 'Guardando...' : '✓ Guardar pesos' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- ══ MODAL FINALIZAR INVERSIÓN ══ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modalFinalizar" @click.self="modalFinalizar = false">
        <div class="modal-card" style="max-width: 460px;">
          <div class="modal-finalizar-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3 class="modal-titulo" style="text-align:center;">Finalizar Inversión</h3>
          <p class="modal-sub" style="text-align:center; margin-bottom: 1.2rem;">
            ¿Confirmas que la inversión de
            <strong>{{ inversionAFinalizar?.inversor_nombre }}</strong>
            en <strong>{{ inversionAFinalizar?.nombre_ficticio }}</strong> ha finalizado correctamente?
          </p>

          <div class="modal-finalizar-info">
            <div class="mfi-row">
              <span>Monto invertido</span>
              <strong>{{ formatCOP(inversionAFinalizar?.monto_cop) }}</strong>
            </div>
            <div class="mfi-row">
              <span>Animales</span>
              <strong>{{ inversionAFinalizar?.cantidad_animales }}</strong>
            </div>
            <div class="mfi-row">
              <span>Ciclo</span>
              <strong>{{ inversionAFinalizar?.dias_ciclo }} días</strong>
            </div>
            <div class="mfi-row">
              <span>Rendimiento</span>
              <strong class="green">{{ inversionAFinalizar?.rendimiento_pct }}%</strong>
            </div>
          </div>

          <p class="modal-finalizar-aviso">
            ⚠ Esta acción es irreversible. La capacidad de la finca será restaurada.
          </p>

          <div class="modal-btns">
            <button class="btn-secondary" @click="modalFinalizar = false">Cancelar</button>
            <button class="btn-finalizar-modal" @click="confirmarFinalizarInversion">
              ✓ Confirmar finalización
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══ MODAL ASIGNAR FINCA ══ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modalAsignarFinca" @click.self="modalAsignarFinca = false">
        <div class="modal-animales-wrap" style="max-width: 480px;">
          <!-- Header fijo -->
          <div class="modal-animales-header">
            <div>
              <h3 class="modal-titulo">Asignar Finca</h3>
              <p class="modal-sub">
                Asignar una finca a <strong>{{ zootecnistaAsignar?.nombre }} {{ zootecnistaAsignar?.apellido }}</strong>
              </p>
            </div>
            <button class="modal-close" @click="modalAsignarFinca = false">✕</button>
          </div>

          <!-- Contenido con scroll -->
          <div class="modal-animales-body">
            <div class="asignar-fincas-lista">
              <div
                v-for="f in todasFincas.filter(f => f.estado === 'aprobada')"
                :key="f.id"
                class="asignar-finca-item"
                :class="{ selected: fincaAsignarId === f.id }"
                @click="fincaAsignarId = f.id">
                <div class="afi-icon">🌿</div>
                <div class="afi-info">
                  <p class="afi-nombre">{{ f.nombre_ficticio }}</p>
                  <p class="afi-real">{{ f.nombre_real }}</p>
                  <p class="afi-propietario">Propietario: {{ f.nombre }} {{ f.apellido }}</p>
                </div>
                <div class="afi-stats">
                  <div class="afi-stat">
                    <span class="afi-stat-val">{{ f.hectareas }}</span>
                    <span class="afi-stat-lbl">ha</span>
                  </div>
                  <div class="afi-stat">
                    <span class="afi-stat-val">{{ f.capacidad_disponible }}</span>
                    <span class="afi-stat-lbl">disp.</span>
                  </div>
                </div>
                <div class="afi-check" v-if="fincaAsignarId === f.id">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>

              <div class="asignar-empty" v-if="todasFincas.filter(f => f.estado === 'aprobada').length === 0">
                <p>No hay fincas aprobadas disponibles</p>
              </div>
            </div>
          </div>

          <!-- Footer fijo -->
          <div class="modal-animales-footer">
            <button class="btn-secondary" @click="modalAsignarFinca = false">Cancelar</button>
            <button class="btn-primary" @click="confirmarAsignarFinca" :disabled="!fincaAsignarId">
              ✓ Asignar finca
            </button>
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
import FotoPerfil from '@/components/FotoPerfil.vue'

const router = useRouter()
const auth   = useAuthStore()
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const headers = computed(() => ({ Authorization: `Bearer ${auth.token}` }))

const seccionActiva = ref('resumen')

// ── Nav items ─────────────────────────────────────
const navItems = computed(() => [
  { id: 'resumen',      label: 'Resumen',        badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id: 'fincas',       label: 'Fincas',         badge: fincasPendientes.value.length, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` },
  { id: 'inversiones',  label: 'Inversiones',    badge: inversionesPendientes.value.length, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>` },
  { id: 'usuarios',     label: 'Usuarios',       badge: usuariosPendientes.value.length, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { id: 'visitas',      label: 'Visitas',        badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { id: 'zootecnistas', label: 'Zootecnistas',   badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { id: 'config',       label: 'Configuración',  badge: 0, icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>` },
])

// ── Datos ─────────────────────────────────────────
const todasFincas      = ref([])
const todasInversiones = ref([])
const todosUsuarios    = ref([])
const zootecnistas     = ref([])
const config           = ref(null)
const todasVisitas     = ref([])
const reportesInversion  = ref([])
const cargandoReportes   = ref(false)
const reportesExpandidos = ref(null)
const modalAsignarFinca  = ref(false)
const zootecnistaAsignar = ref(null)
const fincaAsignarId     = ref('')

const filtroFincas      = ref('todas')
const filtroInversiones = ref('todas')
const filtroUsuarios    = ref('todos')

const fincasPendientes      = computed(() => todasFincas.value.filter(f => f.estado === 'pendiente'))
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
const configForm      = reactive({ precio_kilo: 0, peso_animal_kg: 0 })
const configExito     = ref('')
const configError     = ref('')
const guardandoConfig = ref(false)

// ── Modales fincas/inversiones ────────────────────
const modalRechazarFinca     = ref(false)
const modalRechazarInversion = ref(false)
const motivoRechazo          = ref('')
const motivoRechazoInversion = ref('')
const fincaArechazar         = ref(null)
const inversionArechazar     = ref(null)
const inversionExpandida     = ref(null)
const animalesInversion      = ref([])
const cargandoAnimales       = ref(false)
const modalAnimales     = ref(false)
const inversionAnimales = ref(null)
const animalesForm      = ref([])
const guardandoAnimales = ref(false)
const exitoAnimales     = ref('')
const errorAnimales     = ref('')

// ── Calendario visitas ────────────────────────────
const mesActual              = ref(new Date().getMonth())
const anioActual             = ref(new Date().getFullYear())
const diaSeleccionado        = ref(null)
const modalVisita            = ref(false)
const inversionesZootecnista = ref([])
const cargandoInversiones    = ref(false)
const modalFinalizar     = ref(false)
const inversionAFinalizar = ref(null)

const visitaForm = reactive({
  zootecnista_id: '',
  finca_id:       '',
  fecha_visita:   '',
  hora_visita:    '08:00',
  tipo:           'pesaje',
  notas:          ''
})

const nombreMes = computed(() => {
  return new Date(anioActual.value, mesActual.value).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
})

const diasCalendario = computed(() => {
  const primer = new Date(anioActual.value, mesActual.value, 1)
  const ultimo = new Date(anioActual.value, mesActual.value + 1, 0)
  const hoy    = new Date()
  const dias   = []

  for (let i = 0; i < primer.getDay(); i++) {
    const d = new Date(anioActual.value, mesActual.value, -primer.getDay() + i + 1)
    dias.push({ numero: d.getDate(), esEsteMes: false, esPasado: true, fecha: d, visitas: [] })
  }

  for (let d = 1; d <= ultimo.getDate(); d++) {
    const fecha    = new Date(anioActual.value, mesActual.value, d)
    const esPasado = fecha < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const esHoy    = fecha.toDateString() === hoy.toDateString()
    const visitasDia = todasVisitas.value.filter(v => {
      const fv = new Date(v.fecha_visita)
      return fv.getDate() === d && fv.getMonth() === mesActual.value && fv.getFullYear() === anioActual.value
    })
    dias.push({ numero: d, esEsteMes: true, esPasado, esHoy, fecha, visitas: visitasDia })
  }

  while (dias.length < 42) {
    const d = new Date(anioActual.value, mesActual.value + 1, dias.length - ultimo.getDate() - primer.getDay() + 1)
    dias.push({ numero: d.getDate(), esEsteMes: false, esPasado: true, fecha: d, visitas: [] })
  }
  return dias
})

// ── Helpers ───────────────────────────────────────
function formatCOP(val) {
  if (!val) return '$0'
  return '$' + Math.round(val).toLocaleString('es-CO')
}
function formatFecha(f) {
  if (!f) return '—'
  return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatHora(f) {
  if (!f) return ''
  return new Date(f).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
function tipoLabel(tipo) {
  const map = { pesaje: 'Pesaje', vacunacion: 'Vacunación', revision: 'Revisión', control_sanitario: 'Control Sanitario' }
  return map[tipo] || tipo
}
function tipoColor(tipo) {
  const map = { pesaje: 'azul', vacunacion: 'verde', revision: 'cyan', control_sanitario: 'naranja' }
  return map[tipo] || 'azul'
}
function tipoLabelReporte(tipo) {
  const map = { control_sanitario: 'Control Sanitario', vacunacion: 'Vacunación', control_peso: 'Control de Peso', revision_general: 'Revisión General' }
  return map[tipo] || tipo
}
function tipoColorReporte(tipo) {
  const map = { control_sanitario: 'rep-rojo', vacunacion: 'rep-verde', control_peso: 'rep-azul', revision_general: 'rep-naranja' }
  return map[tipo] || 'rep-gris'
}
function estadoAnimalLabel(estado) {
  const map = { excelente: 'Excelente', bueno: 'Bueno', regular: 'Regular', enfermo: 'Enfermo', muerto: 'Muerto' }
  return map[estado] || estado
}

// ── Funciones calendario ──────────────────────────
function mesAnterior() {
  if (mesActual.value === 0) { mesActual.value = 11; anioActual.value-- }
  else mesActual.value--
}
function mesSiguiente() {
  if (mesActual.value === 11) { mesActual.value = 0; anioActual.value++ }
  else mesActual.value++
}

async function abrirModalVisita(dia) {
  if (dia.esPasado || !dia.esEsteMes) return
  diaSeleccionado.value = dia
  const fecha = dia.fecha
  visitaForm.fecha_visita   = `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}-${String(fecha.getDate()).padStart(2,'0')}`
  visitaForm.zootecnista_id = ''
  visitaForm.finca_id       = ''
  visitaForm.hora_visita    = '08:00'
  visitaForm.tipo           = 'pesaje'
  visitaForm.notas          = ''
  inversionesZootecnista.value = []
  modalVisita.value = true
}

async function cargarInversionesZootecnista() {
  if (!visitaForm.zootecnista_id) return
  cargandoInversiones.value = true
  try {
    const { data } = await axios.get(
      `${API}/admin/zootecnistas/${visitaForm.zootecnista_id}/inversiones`,
      { headers: headers.value }
    )
    inversionesZootecnista.value = data
    visitaForm.finca_id = ''
  } catch {}
  cargandoInversiones.value = false
}

async function crearVisita() {
  try {
    const fechaHora = `${visitaForm.fecha_visita}T${visitaForm.hora_visita}:00`
    await axios.post(`${API}/admin/visitas`, {
      zootecnista_id: visitaForm.zootecnista_id,
      finca_id:       visitaForm.finca_id,
      fecha_visita:   fechaHora,
      tipo:           visitaForm.tipo,
      notas:          visitaForm.notas
    }, { headers: headers.value })
    modalVisita.value = false
    await cargarVisitas()
  } catch (err) {
    alert(err.response?.data?.error || 'Error creando visita')
  }
}

async function cargarVisitas() {
  try {
    const { data } = await axios.get(`${API}/admin/visitas`, { headers: headers.value })
    todasVisitas.value = data
  } catch {}
}

// ── Funciones principales ─────────────────────────
async function cargarTodo() {
  try {
    const [fincasRes, invRes, usersRes, configRes] = await Promise.all([
      axios.get(`${API}/fincas`,             { headers: headers.value }),
      axios.get(`${API}/inversiones`,        { headers: headers.value }),
      axios.get(`${API}/admin/usuarios`,     { headers: headers.value }),
      axios.get(`${API}/inversiones/configuracion`)
    ])
    todasFincas.value      = fincasRes.data
    todasInversiones.value = invRes.data
    todosUsuarios.value    = usersRes.data
    config.value           = configRes.data
    configForm.precio_kilo    = configRes.data.precio_kilo
    configForm.peso_animal_kg = configRes.data.peso_animal_kg
    cargarZootecnistas()
    cargarVisitas()
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
  fincaArechazar.value     = finca
  motivoRechazo.value      = ''
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
  inversionArechazar.value     = inv
  motivoRechazoInversion.value = ''
  modalRechazarInversion.value = true
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

function abrirFinalizarInversion(inv) {
  inversionAFinalizar.value = inv
  modalFinalizar.value = true
}

async function confirmarFinalizarInversion() {
  try {
    await axios.put(`${API}/inversiones/${inversionAFinalizar.value.id}/finalizar`, {}, { headers: headers.value })
    modalFinalizar.value = false
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
  configExito.value     = ''
  configError.value     = ''
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
  } catch {}
  cargandoAnimales.value = false
}

async function cargarZootecnistas() {
  try {
    const { data } = await axios.get(`${API}/admin/zootecnistas`, { headers: headers.value })
    zootecnistas.value = data
  } catch {}
}

function abrirRegistroAnimales(inv) {
  inversionAnimales.value = inv
  // Generar lista de animales con campos vacíos
  animalesForm.value = Array.from({ length: inv.cantidad_animales }, (_, i) => ({
    codigo:        `GAN${String(i + 1).padStart(3, '0')}`,
    peso_inicial:  ''
  }))
  exitoAnimales.value = ''
  errorAnimales.value = ''
  modalAnimales.value = true
}

async function verReportes(inv) {
  if (reportesExpandidos.value?.id === inv.id) {
    reportesExpandidos.value = null
    reportesInversion.value  = []
    return
  }
  reportesExpandidos.value = inv
  cargandoReportes.value   = true
  try {
    const { data } = await axios.get(`${API}/admin/inversiones/${inv.id}/reportes`, { headers: headers.value })
    reportesInversion.value = data
  } catch {}
  cargandoReportes.value = false
}

async function abrirAsignarFinca(zoo) {
  zootecnistaAsignar.value = zoo
  fincaAsignarId.value     = ''
  modalAsignarFinca.value  = true
}

async function confirmarAsignarFinca() {
  console.log('finca_id:', fincaAsignarId.value, typeof fincaAsignarId.value)
  console.log('zootecnista_id:', zootecnistaAsignar.value.id)
  if (!fincaAsignarId.value) return alert('Selecciona una finca')
  try {
    await axios.post(`${API}/admin/asignar-zootecnista`, {
      zootecnista_id: zootecnistaAsignar.value.id,
      finca_id:       fincaAsignarId.value
    }, { headers: headers.value })
    modalAsignarFinca.value = false
    await cargarZootecnistas()
  } catch (err) {
    console.error('Error:', err.response?.data)
    alert(err.response?.data?.error || 'Error asignando finca')
  }
}

async function guardarAnimales() {
  const incompletos = animalesForm.value.filter(a => !a.peso_inicial || a.peso_inicial <= 0)
  if (incompletos.length > 0) {
    errorAnimales.value = `Faltan ${incompletos.length} animal(es) sin peso registrado`
    return
  }
  guardandoAnimales.value = true
  errorAnimales.value = ''
  try {
    await axios.post(
      `${API}/inversiones/${inversionAnimales.value.id}/animales`,
      { animales: animalesForm.value },
      { headers: headers.value }
    )
    exitoAnimales.value = `✓ ${animalesForm.value.length} animales registrados correctamente`
    await cargarTodo()
  } catch (err) {
    errorAnimales.value = err.response?.data?.error || 'Error registrando animales'
  } finally {
    guardandoAnimales.value = false
  }
}

const promedioAnimales = computed(() => {
  const conPeso = animalesForm.value.filter(a => a.peso_inicial > 0)
  if (conPeso.length === 0) return 0
  return (conPeso.reduce((a, b) => a + parseFloat(b.peso_inicial), 0) / conPeso.length).toFixed(1)
})

async function cerrarSesion() {
  await auth.logout()
  router.push('/')
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
  background: var(--gris) !important; color: #fff !important;
  font-size: 0.88rem; font-weight: 600;
  padding: 0.85rem 1.8rem; border-radius: 100px;
  display: inline-block; text-align: center;
  transition: opacity 0.2s;
  -webkit-user-select: none; user-select: none;
}
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-card {
  background: #FFFFFF;
  border-radius: 16px; padding: 2rem;
  width: 100%; max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0,0,0,0.3);
  position: relative; z-index: 1001;
}
.modal-titulo { font-family: 'Anton', sans-serif; font-size: 1.2rem; color: var(--gris); margin-bottom: 0.4rem; }
.modal-sub    { font-size: 0.83rem; color: var(--muted); margin-bottom: 1.2rem; }
.modal-btns {
  display: flex; gap: 0.8rem;
  justify-content: flex-end;
  margin-top: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  position: sticky;
  bottom: 0;
  background: #fff;
}
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

/* Calendario admin */
.calendario-wrap { background: var(--blanco); border-radius: 16px; padding: 1.5rem; border: 1px solid var(--border); }
.calendario-nav  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.cal-mes-titulo  { font-family: 'Anton', sans-serif; font-size: 1.1rem; color: var(--texto); text-transform: capitalize; }
.cal-nav-btn     { all: unset; cursor: pointer; width: 32px; height: 32px; border-radius: 8px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--texto); transition: background 0.2s; }
.cal-nav-btn:hover { background: #E5E7EB; }

.cal-leyenda { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1rem; }
.leyenda-item { font-size: 0.72rem; font-weight: 600; padding: 0.25rem 0.7rem; border-radius: 100px; color: #fff; }
.cal-azul    { background: #2563EB; }
.cal-verde   { background: #16A34A; }
.cal-cyan    { background: #0891B2; }
.cal-naranja { background: #D97706; }

.calendario-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.cal-dia-header  { text-align: center; font-size: 0.72rem; font-weight: 700; color: var(--muted); padding: 0.5rem; text-transform: uppercase; }
.cal-dia-cell    { min-height: 90px; padding: 0.4rem; border: 1px solid #F3F4F6; border-radius: 6px; background: var(--blanco); }
.cal-dia-cell.otro-mes  { background: #FAFAFA; }
.cal-dia-cell.es-pasado { background: #FAFAFA; cursor: not-allowed; }
.cal-dia-cell.es-hoy    { background: #EFF6FF; border-color: var(--gris); }
.cal-dia-cell.es-futuro { cursor: pointer; transition: background 0.2s; }
.cal-dia-cell.es-futuro:hover { background: #F3F4F6; border-color: var(--gris-mid); }
.cal-dia-cell.tiene-visita { background: #F0FDF4; }
.cal-num { font-size: 0.82rem; font-weight: 600; color: var(--texto); display: block; margin-bottom: 0.3rem; }
.cal-dia-cell.es-hoy .cal-num { background: var(--gris); color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; }
.cal-dia-cell.otro-mes .cal-num { color: #D1D5DB; }
.cal-dia-cell.es-pasado .cal-num { color: #D1D5DB; }

.cal-visitas { display: flex; flex-direction: column; gap: 2px; }
.cal-visita-chip { border-radius: 4px; padding: 0.25rem 0.4rem; }
.cal-chip-zoo    { font-size: 0.62rem; color: #fff; font-weight: 700; display: block; }
.cal-chip-tipo   { font-size: 0.58rem; color: rgba(255,255,255,0.85); display: block; }
.cal-chip-estado { font-size: 0.58rem; color: rgba(255,255,255,0.75); display: block; }
.cal-mas { font-size: 0.62rem; color: var(--muted); }

/* Tipo visita options */
.tipo-visita-options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.tipo-visita-btn {
  all: unset; cursor: pointer;
  border: 1.5px solid var(--border); border-radius: 8px;
  padding: 0.6rem; text-align: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.8rem; color: var(--muted);
  transition: all 0.2s; -webkit-user-select: none; user-select: none;
}
.tipo-visita-btn:hover { border-color: var(--gris-mid); }
.tipo-visita-btn.active.tv-azul    { background: #DBEAFE; border-color: #2563EB; color: #2563EB; font-weight: 700; }
.tipo-visita-btn.active.tv-verde   { background: #D1FAE5; border-color: #16A34A; color: #16A34A; font-weight: 700; }
.tipo-visita-btn.active.tv-cyan    { background: #CFFAFE; border-color: #0891B2; color: #0891B2; font-weight: 700; }
.tipo-visita-btn.active.tv-naranja { background: #FEF3C7; border-color: #D97706; color: #D97706; font-weight: 700; }

/* Visita form */
.visita-form { display: flex; flex-direction: column; gap: 1rem; margin: 1.2rem 0; }
.vf-group    { display: flex; flex-direction: column; gap: 0.35rem; }
.vf-label    { font-family: 'Open Sans', sans-serif; font-size: 0.75rem; font-weight: 700; color: var(--texto); letter-spacing: 0.04em; text-transform: uppercase; }
.vf-select-wrap { position: relative; }
.vf-select {
  all: unset; display: block; width: 100%; box-sizing: border-box;
  border: 1.5px solid var(--border); border-radius: 10px;
  padding: 0.75rem 0.9rem;
  font-family: 'Open Sans', sans-serif; font-size: 0.88rem; color: var(--texto);
  background: #F9FAFB; cursor: pointer;
  transition: border-color 0.2s;
}
.vf-select:focus { border-color: var(--gris); background: #fff; }
.vf-input {
  all: unset; display: block; width: 100%; box-sizing: border-box;
  border: 1.5px solid var(--border); border-radius: 10px;
  padding: 0.75rem 0.9rem;
  font-family: 'Open Sans', sans-serif; font-size: 0.88rem; color: var(--texto);
  background: #F9FAFB; transition: border-color 0.2s;
}
.vf-input:focus { border-color: var(--gris); background: #fff; }
.vf-textarea {
  all: unset; display: block; width: 100%; box-sizing: border-box;
  border: 1.5px solid var(--border); border-radius: 10px;
  padding: 0.75rem 0.9rem; min-height: 70px;
  font-family: 'Open Sans', sans-serif; font-size: 0.85rem; color: var(--texto);
  background: #F9FAFB; resize: vertical; transition: border-color 0.2s;
}
.vf-textarea:focus { border-color: var(--gris); background: #fff; }
.vf-loading { font-size: 0.8rem; color: var(--muted); padding: 0.5rem 0; }
.vf-row { display: grid; grid-template-columns: 1fr; gap: 1rem; }

/* Registro animales */
.animales-form-wrap { margin: 1.2rem 0; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.af-header {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1rem; padding: 0.7rem 1rem;
  background: #F9FAFB; font-size: 0.72rem; font-weight: 700;
  color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em;
}
.af-row {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1rem; padding: 0.6rem 1rem;
  border-top: 1px solid #F3F4F6; align-items: center;
}
.af-row:hover { background: #FAFAFA; }
.af-codigo-wrap, .af-peso-wrap { display: flex; align-items: center; gap: 0.4rem; }
.af-input {
  all: unset; border: 1.5px solid var(--border); border-radius: 8px;
  padding: 0.5rem 0.7rem; font-size: 0.85rem; color: var(--texto);
  width: 100%; box-sizing: border-box; transition: border-color 0.2s;
  font-family: monospace;
}
.af-input:focus { border-color: var(--gris); }
.af-input.af-filled { border-color: #16A34A; background: #F0FDF4; }
.af-input.codigo { font-weight: 700; color: var(--gris); }
.af-kg { font-size: 0.78rem; color: var(--muted); flex-shrink: 0; }
.af-resumen {
  display: flex; justify-content: space-between;
  background: #F0FDF4; border-radius: 8px; padding: 0.7rem 1rem;
  font-size: 0.82rem; color: var(--muted); margin-bottom: 0.5rem;
}
.af-resumen strong { color: var(--verde, #1B4332); }
.modal-animales-wrap {
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%; max-width: 560px;
  max-height: 85vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,0.3);
  position: relative; z-index: 1001;
  overflow: hidden;
}
.modal-animales-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1.4rem 1.6rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: #fff;
}
.modal-animales-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.6rem;
}
.modal-animales-footer {
  display: flex; justify-content: flex-end; gap: 0.8rem;
  padding: 1rem 1.6rem;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  background: #fff;
}
.page-title    { letter-spacing: 0.05em; }
.section-title { letter-spacing: 0.05em; }
.banner-nombre { letter-spacing: 0.05em; }
.mf-nombre     { letter-spacing: 0.05em; }
.gc-val        { letter-spacing: 0.05em; }
.stat-prop-icon-svg { color: var(--cafe); margin-bottom: 0.5rem; }
.modal-animales-footer .btn-primary {
  background: #374151 !important;
  color: #ffffff !important;
  padding: 0.7rem 1.4rem;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: 'Open Sans', sans-serif;
}
.logo-img {
  width: 120px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
/* Reportes admin */
.reportes-lista-admin { display: flex; flex-direction: column; gap: 0.8rem; }
.reporte-admin-item {
  background: var(--blanco); border-radius: 10px; padding: 1rem;
  border: 1px solid var(--border);
}
.rai-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem; }
.rai-left   { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.rai-right  { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
.rai-tipo {
  font-size: 0.72rem; font-weight: 700;
  padding: 0.25rem 0.7rem; border-radius: 100px;
}
.rai-tipo.rep-rojo    { background: #FEE2E2; color: #991B1B; }
.rai-tipo.rep-verde   { background: #D1FAE5; color: #065F46; }
.rai-tipo.rep-azul    { background: #DBEAFE; color: #1E40AF; }
.rai-tipo.rep-naranja { background: #FEF3C7; color: #92400E; }
.rai-tipo.rep-gris    { background: #F3F4F6; color: #374151; }
.rai-animal { font-family: monospace; font-size: 0.78rem; font-weight: 700; color: var(--gris); background: #F3F4F6; padding: 0.2rem 0.6rem; border-radius: 6px; }
.rai-estado { font-size: 0.72rem; color: var(--muted); }
.rai-zoo    { font-size: 0.75rem; font-weight: 600; color: var(--texto); }
.rai-fecha  { font-size: 0.72rem; color: var(--muted); }
.rai-evid   { font-size: 0.72rem; color: #7C3AED; }
.rai-obs    { font-size: 0.82rem; color: var(--texto); line-height: 1.6; }
.modal-finalizar-icon {
  display: flex; justify-content: center; margin-bottom: 1rem;
  background: #F0FDF4; width: 72px; height: 72px; border-radius: 50%;
  align-items: center; margin: 0 auto 1rem;
}
.modal-finalizar-info {
  background: #F9FAFB; border-radius: 10px; padding: 1rem;
  margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.6rem;
}
.mfi-row {
  display: flex; justify-content: space-between;
  font-size: 0.85rem; color: var(--muted);
}
.mfi-row strong { color: var(--texto); }
.modal-finalizar-aviso {
  font-size: 0.78rem; color: #D97706;
  background: #FEF3C7; border-radius: 8px;
  padding: 0.6rem 0.9rem; margin-bottom: 1rem;
}
.btn-finalizar-modal {
  all: unset; cursor: pointer;
  background: #16A34A; color: #fff;
  font-family: 'Open Sans', sans-serif;
  font-size: 0.88rem; font-weight: 600;
  padding: 0.75rem 1.6rem; border-radius: 100px;
  transition: opacity 0.2s;
}
.btn-finalizar-modal:hover { opacity: 0.88; }
.btn-asignar-finca {
  all: unset; cursor: pointer;
  display: block; width: 100%; box-sizing: border-box;
  text-align: center; margin-top: 0.8rem;
  padding: 0.6rem; border-radius: 8px;
  border: 1.5px dashed var(--border);
  font-size: 0.8rem; font-weight: 600; color: var(--muted);
  transition: all 0.2s; font-family: 'Open Sans', sans-serif;
}
.btn-asignar-finca:hover {
  border-color: var(--gris); color: var(--gris);
  background: #F9FAFB;
}
/* Asignar finca */
.asignar-fincas-lista { display: flex; flex-direction: column; gap: 0.6rem; margin: 1.2rem 0; max-height: 340px; overflow-y: auto; }
.asignar-finca-item {
  display: flex; align-items: center; gap: 0.8rem;
  padding: 0.9rem 1rem; border-radius: 12px;
  border: 2px solid var(--border); cursor: pointer;
  transition: all 0.2s; background: var(--blanco);
  position: relative;
}
.asignar-finca-item:hover { border-color: var(--gris-mid); background: #F9FAFB; }
.asignar-finca-item.selected { border-color: var(--gris); background: #F3F4F6; }
.afi-icon { font-size: 1.6rem; flex-shrink: 0; }
.afi-info { flex: 1; }
.afi-nombre { font-weight: 700; color: var(--texto); font-size: 0.88rem; }
.afi-real   { font-size: 0.75rem; color: var(--muted); margin-top: 0.1rem; }
.afi-propietario { font-size: 0.7rem; color: var(--muted); margin-top: 0.2rem; }
.afi-stats  { display: flex; gap: 0.8rem; flex-shrink: 0; }
.afi-stat   { text-align: center; }
.afi-stat-val { font-family: 'Anton', sans-serif; font-size: 1rem; color: var(--texto); display: block; }
.afi-stat-lbl { font-size: 0.6rem; color: var(--muted); text-transform: uppercase; }
.afi-check {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--gris); display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.asignar-empty { text-align: center; padding: 1.5rem; color: var(--muted); font-size: 0.82rem; }
.modal-close {
  all: unset; cursor: pointer;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 0.9rem;
  transition: background 0.2s; flex-shrink: 0;
}
.modal-close:hover { background: rgba(255,255,255,0.25); }
</style>