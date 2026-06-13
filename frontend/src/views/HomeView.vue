<template>
  <div class="app-wrapper">

    <!-- LOGO CENTRADO (visible al inicio) -->
    <div class="logo-hero" :class="{ hidden: navbarVisible }">
      <span class="logo-text">FODEGAN</span>
      <span class="logo-sub">INVERSIONES GANADERAS</span>
    </div>

    <!-- NAVBAR (aparece al hacer scroll) -->
    <nav class="navbar" :class="{ visible: navbarVisible }">
      <div class="navbar-inner">
        <div class="nav-logo">
          <img src="/images/LogoFodegan.png" alt="FODEGAN" class="logo-img" />
          <span class="logo-sub">INVERSIONES GANADERAS</span>
        </div>
        <button class="nav-user" @click="ir('login')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>
    </nav>

    <main class="main-scroll" ref="mainEl">

      <!-- SECCIÓN 1: HERO -->
      <section id="inicio" class="section hero-section">
        <div class="video-wrapper">
          <video class="video-bg" autoplay muted loop playsinline
            src="/video/VideoHomeView1.mp4" />
          <div class="video-overlay" />
          <div class="grain" />
        </div>
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-star">★</span>
            Fondo de Inversiones Ganadero · Colombia
          </div>
          <h1 class="hero-title">
            Su capital crece<br />
            <span class="hero-accent">mientras el ganado</span><br />
            se valoriza.
          </h1>
          <p class="hero-desc">
            Conectamos inversionistas con propietarios de fincas ganaderas
            certificadas. Ciclos de engorde supervisados, retornos transparentes
            y respaldo técnico permanente.
          </p>
          <div class="hero-stats">
            <div class="hstat">
              <span class="hstat-val">12–18%</span>
              <span class="hstat-lbl">Rendimiento</span>
            </div>
            <div class="hstat">
              <span class="hstat-val">4–6 m</span>
              <span class="hstat-lbl">Por ciclo</span>
            </div>
            <div class="hstat">
              <span class="hstat-val">100%</span>
              <span class="hstat-lbl">Asegurado</span>
            </div>
          </div>
          <div class="hero-btns">
            <button class="btn-primary" @click="ir('register')">
              Comenzar a Invertir →
            </button>
            <button class="btn-secondary" @click="scrollTo('modelo')">
              <svg width="14" height="14" viewBox="0 0 24 24"
                fill="currentColor" style="margin-right: 6px; vertical-align: middle;">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
              Ver el proceso
            </button>
          </div>
        </div>
      </section>

      <!-- SECCIÓN 2: MODELO DE NEGOCIO -->
      <section id="modelo" class="section light-section">
        <div class="section-inner">
          <p class="section-tag">MODELO DE NEGOCIO</p>
          <h2 class="section-title">Inversión en Ganado de<br />Engorde y Ceba</h2>
          <p class="section-desc">
            La ceba bovina lleva novillos de ~280 kg al peso comercial de ~500 kg
            en 4–6 meses, generando valorización directamente proporcional a la
            ganancia de peso y al precio del mercado.
          </p>
          <div class="tabs">
            <button
              v-for="(fase, i) in fases" :key="i"
              class="tab-btn" :class="{ active: faseActiva === i }"
              @click="faseActiva = i">
              <span class="tab-num">0{{ i + 1 }}</span> {{ fase.nombre }}
            </button>
          </div>
          <Transition name="fade" mode="out-in">
            <div class="fase-card" :key="faseActiva">
                <p class="fase-tag">FASE 0{{ faseActiva + 1 }}</p>
                <h3 class="fase-title">{{ fases[faseActiva].titulo }}</h3>
                <p class="fase-desc">{{ fases[faseActiva].descripcion }}</p>
                <div class="fase-tags">
                <span v-for="t in fases[faseActiva].tags" :key="t" class="etiqueta">{{ t }}</span>
                </div>
            </div>
            </Transition>
          <div class="mini-stats">
            <div class="mini-stat" v-for="s in miniStats" :key="s.label">
              <span class="mini-icon">{{ s.icon }}</span>
              <span class="mini-val">{{ s.value }}</span>
              <span class="mini-lbl">{{ s.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓN 3: PROCESO -->
        <section id="invertir" class="section green-section">
        <div class="section-inner">
            <p class="section-tag gold">PROCESO DE VINCULACIÓN</p>
            <h2 class="section-title white">¿Cómo Participar como<br />Inversionista?</h2>
            <p class="section-desc white-muted">
            En tres pasos estructurados vinculará su capital al modelo productivo
            ganadero más transparente de Colombia.
            </p>

            <div class="proceso-list">

            <!-- PASO 01 -->
            <div class="proceso-item">
                <div class="proceso-left">
                <svg class="proceso-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="12" y="6" width="24" height="36" rx="3"/>
                    <circle cx="24" cy="20" r="6"/>
                    <path d="M14 38c0-5.5 4.5-10 10-10s10 4.5 10 10"/>
                    <line x1="20" y1="10" x2="28" y2="10"/>
                </svg>
                <span class="proceso-num">01</span>
                </div>
                <div class="proceso-body">
                <h4 class="proceso-title">Registro y Verificación de Identidad</h4>
                <p class="proceso-desc">
                    Complete su perfil, <strong>valide documentos</strong> (cédula y domicilio)
                    y defina su capacidad patrimonial.
                    <span class="proceso-highlight">Proceso 100% digital en menos de 10 minutos.</span>
                </p>
                </div>
            </div>

            <!-- PASO 02 -->
            <div class="proceso-item">
                <div class="proceso-left">
                <svg class="proceso-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                    <ellipse cx="24" cy="28" rx="12" ry="8"/>
                    <path d="M12 28c0-4 5.4-8 12-8s12 4 12 8"/>
                    <path d="M24 20V12"/>
                    <path d="M18 14l6-6 6 6"/>
                    <circle cx="36" cy="14" r="4"/>
                    <path d="M34 14l2 2 4-4"/>
                </svg>
                <span class="proceso-num">02</span>
                </div>
                <div class="proceso-body">
                <h4 class="proceso-title">Seleccione su Participación en el Lote</h4>
                <p class="proceso-desc">
                    Explore lotes disponibles, <strong>revise informes técnicos</strong> de cada
                    predio y <span class="proceso-highlight">defina el número de animales a financiar.</span>
                    Firme y realice su aporte.
                </p>
                </div>
            </div>

            <!-- PASO 03 -->
            <div class="proceso-item">
                <div class="proceso-left">
                <svg class="proceso-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polyline points="8,36 18,24 26,30 38,14"/>
                    <circle cx="38" cy="14" r="3"/>
                    <circle cx="26" cy="30" r="2"/>
                    <circle cx="18" cy="24" r="2"/>
                    <path d="M10 42h28"/>
                    <path d="M28 38l4 4-4 4"/>
                </svg>
                <span class="proceso-num">03</span>
                </div>
                <div class="proceso-body">
                <h4 class="proceso-title">Seguimiento y Liquidación de Rendimientos</h4>
                <p class="proceso-desc">
                    <strong>Monitoree el crecimiento</strong> del ganado en tiempo real.
                    Al finalizar el ciclo,
                    <span class="proceso-highlight">reciba su capital más los rendimientos.</span>
                </p>
                </div>
            </div>

            </div>

            <!-- CTA FINAL -->
            <div class="proceso-cta">
            <button class="btn-cta-grande" @click="ir('register')">
                COMIENZA TU INVERSIÓN AHORA
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" style="margin-left:8px; vertical-align:middle;">
                <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </button>
            </div>

        </div>
        </section>

      <!-- SECCIÓN 4: PROPIETARIOS -->
        <section id="propietario" class="section light-section">
        <div class="section-inner propietario-inner">

            <!-- Columna izquierda -->
            <div class="propietario-content">
            <p class="section-tag">PARA DUEÑOS DE PREDIOS RURALES</p>
            <h2 class="section-title">¿Es Propietario de una<br />Finca Ganadera?</h2>
            <p class="section-desc">
                FODEGAN <strong>financia el 100% de la compra del ganado.</strong>
                <strong>Usted aporta la tierra,</strong> infraestructura y conocimiento
                del campo; nosotros aportamos el capital y la
                <strong>asesoría técnica profesional.</strong>
            </p>

            <ul class="beneficios-list">

                <li class="beneficio-item">
                <span class="beneficio-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                    </svg>
                </span>
                <span>Financiamiento del <strong>100%</strong> en la compra del lote ganadero</span>
                </li>

                <li class="beneficio-item">
                <span class="beneficio-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </span>
                <span>Asesoría <strong>zootécnica profesional</strong> sin costo durante el ciclo</span>
                </li>

                <li class="beneficio-item">
                <span class="beneficio-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                    </svg>
                </span>
                <span>Contratos <strong>transparentes</strong> con distribución de utilidades definida</span>
                </li>

                <li class="beneficio-item">
                <span class="beneficio-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </span>
                <span>Cobertura de <strong>seguro ganadero</strong> incluida en cada ciclo productivo</span>
                </li>

            </ul>

            <button class="btn-finca" @click="ir('register')">
                Registrar mi finca
                <svg class="btn-arrow" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </button>
            </div>

            <!-- Columna derecha — video -->
            <div class="propietario-imagen">
            <video
                class="finca-foto"
                autoplay
                muted
                loop
                playsinline
                src="/video/VideoHomeView2.mp4"
            />
            <div class="imagen-overlay-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Fincas certificadas FODEGAN
            </div>
            </div>

        </div>
        </section>

        <!-- SECCIÓN 5: ALIADOS -->
        <section id="aliados" class="section light-section">
        <div class="section-inner">
            <p class="section-tag">ECOSISTEMA GANADERO</p>
            <h2 class="section-title">Nuestros Aliados Estratégicos</h2>
            <p class="section-desc">
            Articulamos con las principales entidades del sector agropecuario
            colombiano para garantizar transparencia, trazabilidad y respaldo institucional.
            </p>

            <div class="aliados-grid">
            <div class="aliado-logo" v-for="a in aliados" :key="a.sigla">
                <img :src="a.logo" :alt="a.nombre" class="aliado-img" />
                <p class="aliado-nombre">{{ a.nombre }}</p>
                <p class="aliado-tipo">{{ a.tipo }}</p>
            </div>
            </div>
        </div>
        </section>

        <!-- SECCIÓN 6: CONTACTO -->
        <section id="contacto" class="section contacto-section">
        <div class="section-inner">
            <p class="section-tag">ATENCIÓN AL CLIENTE</p>
            <h2 class="section-title">Comuníquese con<br />Nuestro Equipo</h2>

            <div class="contacto-cards">

            <div class="contacto-card">
                <div class="contacto-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                </div>
                <h4 class="contacto-titulo">Correo Electrónico</h4>
                <p class="contacto-sub">Respuesta en menos de 24 horas hábiles.</p>
                <a href="mailto:fodeganoficial@gmail.com" class="contacto-val contacto-link">
                fodeganoficial@gmail.com
                </a>
            </div>

            <div class="contacto-card">
                <div class="contacto-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                </div>
                <h4 class="contacto-titulo">Línea de Atención</h4>
                <p class="contacto-sub">Lun–Vie 8am–5pm</p>
                <a href="tel:+573214815336" class="contacto-val contacto-link">
                +57 321 481 5336
                </a>
            </div>

            <div class="contacto-card">
                <div class="contacto-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
                </div>
                <h4 class="contacto-titulo">Oficina Principal</h4>
                <p class="contacto-sub">Aguachica, Cesar</p>
                <p class="contacto-val">Calle 14 # 27a - 31</p>
            </div>

            </div>
        </div>
        </section>

      <footer class="footer-main">
        © 2026 FODEGAN · Todos los derechos reservados
      </footer>

    </main>

    <!-- FAB principal -->
    <div class="fab-container">
      <!-- Botones secundarios que aparecen al hover -->
      <Transition name="fab-slide">
        <div class="fab-opciones" v-if="fabAbierto">
          <div class="fab-opcion" @click="irA('login')">
            <span class="fab-opcion-label">Iniciar Sesión</span>
            <button class="fab-btn fab-login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </button>
          </div>

          <div class="fab-opcion" @click="irA('/register?rol=1')">
            <span class="fab-opcion-label">Quiero inventir ahora</span>
            <button class="fab-btn fab-inversor">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </button>
          </div>

          <div class="fab-opcion" @click="irA('/register?rol=2')">
            <span class="fab-opcion-label">Soy Propietario de finca</span>
            <button class="fab-btn fab-propietario">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </button>
          </div>

          <div class="fab-opcion" @click="irA('/register?rol=3')">
            <span class="fab-opcion-label">Soy Zootecnista</span>
            <button class="fab-btn fab-zootecnista">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Botón principal -->
      <button
        class="fab"
        @click="fabAbierto = !fabAbierto"
        :class="{ abierto: fabAbierto }"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          style="transition: transform 0.3s ease"
          :style="{ transform: fabAbierto ? 'rotate(45deg)' : 'rotate(0deg)' }">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
      <span class="fab-label" v-if="!fabAbierto">Registrarse</span>
    </div>
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { computed, watch } from 'vue'

const router = useRouter()
const navbarVisible = ref(false)
const seccionActiva = ref('inicio')
const faseActiva    = ref(0)
const mainEl        = ref(null)
const fabAbierto = ref(false)
const montoFormateado = ref('')

function onScroll() {
  navbarVisible.value = (mainEl.value?.scrollTop || 0) > 80
}

function scrollTo(id) {
  seccionActiva.value = id
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function irA(ruta) {
  fabAbierto.value = false
  router.push(ruta)
}

function ir(ruta) {
  fabAbierto.value = false
  if (ruta === 'register') router.push('/register?rol=1')
  else if (ruta === 'login') router.push('/login')
  else router.push(ruta)
}

let observer

onMounted(() => {
  mainEl.value?.addEventListener('scroll', onScroll)

  const secciones = document.querySelectorAll('.section')
  observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) seccionActiva.value = e.target.id }),
    { threshold: 0.4 }
  )
  secciones.forEach(s => observer.observe(s))
})

onUnmounted(() => {
  mainEl.value?.removeEventListener('scroll', onScroll)
  observer?.disconnect()
})

watch(montoFormateado, (val) => {
  const solo = val.replace(/\D/g, '')
  form.monto_disponible = solo
  montoFormateado.value = solo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
})

const fases = [
  { nombre: 'Selección',       titulo: 'Selección Técnica del Ganado',    descripcion: 'Nuestro equipo zootécnico evalúa y selecciona novillos de razas aptas para ceba (Brahman, Gyr, Angus) con peso de entrada entre 250 y 320 kg, garantizando la calidad genética y el estado sanitario óptimo del lote previo a su ingreso al sistema.', tags: ['Razas certificadas', 'Peso controlado', 'Examen sanitario'] },
  { nombre: 'Nutrición',       titulo: 'Plan Nutricional Supervisado',     descripcion: 'Cada lote recibe un plan nutricional diseñado por zootecnistas certificados, con suplementación estratégica, pastoreo rotacional y control de conversión alimenticia para maximizar la ganancia de peso por ciclo.', tags: ['Pastoreo rotacional', 'Suplementación', 'Control de peso'] },
  { nombre: 'Sanidad',         titulo: 'Control Sanitario Permanente',     descripcion: 'Protocolo de vacunación completo, desparasitación y seguimiento veterinario mensual. Todos los animales cuentan con seguro ganadero que cubre mortalidad y enfermedades durante el ciclo productivo.', tags: ['Vacunación', 'Seguro ganadero', 'Control mensual'] },
  { nombre: 'Comercialización',titulo: 'Venta y Liquidación',              descripcion: 'Al alcanzar el peso objetivo (~500 kg), el ganado se comercializa con frigoríficos aliados al mejor precio del mercado. Las utilidades se liquidan y distribuyen entre propietario, inversionista y plataforma en máximo 5 días hábiles.', tags: ['Frigoríficos aliados', 'Precio de mercado', 'Liquidación rápida'] },
]

const miniStats = [
  { icon: '📊', value: '220–240 kg',   label: 'Ganancia por novillo' },
  { icon: '⏱',  value: '120–180 días', label: 'Duración del ciclo'  },
  { icon: '🛡',  value: '100%',         label: 'Asegurado'           },
  { icon: '👁',  value: 'Tiempo real',  label: 'Seguimiento'         },
]

const proceso = [
  { num: '01', titulo: 'Registro y Verificación de Identidad',      descripcion: 'Complete su perfil, valide documentos (cédula y domicilio) y defina su capacidad patrimonial. Proceso 100% digital en menos de 10 minutos.' },
  { num: '02', titulo: 'Seleccione su Participación en el Lote',    descripcion: 'Explore lotes disponibles, revise informes técnicos de cada predio y defina el número de cabezas a financiar. Firme digitalmente y realice su aporte.' },
  { num: '03', titulo: 'Seguimiento y Liquidación de Rendimientos', descripcion: 'Monitoree el crecimiento del ganado en tiempo real. Al finalizar el ciclo, reciba su capital más los rendimientos directamente en su cuenta.' },
]

const beneficios = [
  { icon: '💰',  texto: 'Financiamiento del 100% en la compra del lote ganadero'         },
  { icon: '👨‍⚕️', texto: 'Asesoría zootécnica profesional sin costo durante el ciclo'     },
  { icon: '📄',  texto: 'Contratos transparentes con distribución de utilidades definida' },
  { icon: '🛡',  texto: 'Cobertura de seguro ganadero incluida en cada ciclo productivo'  },
]

const aliados = [
  { sigla: 'BA',  nombre: 'Banco Agrario',       tipo: 'Financiamiento rural',              logo: '/images/BancoAgrario.png'  },
  { sigla: 'EG',  nombre: 'Entornos Ganaderos',  tipo: 'Medios especializados',             logo: '/images/EntornoGanadero.png'   },
  { sigla: 'FDG', nombre: 'FEDEGAN',             tipo: 'Fed. Colombiana de Ganaderos',     logo: '/images/Fedegan.png'             },
  { sigla: 'FIN', nombre: 'FINAGRO',             tipo: 'Fondo agropecuario',               logo: '/images/Finagro.png'         },
  { sigla: 'FK',  nombre: 'Freskaleche',         tipo: 'Procesadora láctea y cárnica',     logo: '/images/Fkl.png'             },
  { sigla: 'ICA', nombre: 'ICA',                 tipo: 'Instituto Colombiano Agropecuario',logo: '/images/Ica.png'            },
]

const contacto = [
  { icon: '✉️', titulo: 'Correo Electrónico', subtitulo: 'Respuesta en menos de 24 horas hábiles.', valor: 'inversiones@fodegan.com'        },
  { icon: '📞', titulo: 'Línea de Atención',  subtitulo: 'Lun–Vie 8am–5pm',                         valor: '+57 314 805 8248'               },
  { icon: '📍', titulo: 'Oficina Principal',  subtitulo: 'Medellín, Antioquia',                      valor: 'El Poblado · Cra 43A #1 Sur-100' },
]
</script>

<style scoped>
.app-wrapper {
  --verde:      #1B4332;
  --verde-mid:  #2D6A4F;
  --dorado:     #D4A373;
  --crema:      #F5F0E8;
  --crema-card: #EDEAE0;
  --texto:      #1a1a1a;
  --texto-muted:#555;
  --blanco:     #FFFFFF;
  --nav-h:      64px;

  font-family: 'Open Sans', sans-serif;
  /* SIN overflow:hidden ni height:100vh aquí */
}

/* NAVBAR */
.navbar {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 200;
  background: var(--verde);
  height: var(--nav-h);
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity 0.4s ease, transform 0.4s ease;
  pointer-events: none;
}
.navbar.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}
.navbar-inner {
  max-width: 900px; margin: 0 auto; height: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1.2rem;
}
.nav-logo { display: flex; flex-direction: column; }
.logo-text {
  font-family: 'Anton', sans-serif;
  font-size: 1.15rem; font-weight: 400;
  letter-spacing: 0.18em; color: var(--dorado); line-height: 1;
}
.logo-sub {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.55rem; letter-spacing: 0.14em;
  color: rgba(255,255,255,0.6); text-transform: uppercase;
}
.nav-user {
  all: unset; cursor: pointer;
  width: 38px; height: 38px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.8);
  transition: border-color 0.2s, background 0.2s;
}
.nav-user:hover { border-color: var(--dorado); background: rgba(212,163,115,0.1); }

/* LOGO HERO */
.logo-hero {
  position: fixed; top: 1.4rem; left: 0; right: 0;
  z-index: 100;
  display: flex; flex-direction: column; align-items: center;
  transition: opacity 0.4s ease, transform 0.4s ease;
  pointer-events: none;
}
.logo-hero.hidden {
  opacity: 0;
  transform: translateY(-10px);
}

/* SCROLL PRINCIPAL — este es el elemento que hace scroll */
.main-scroll {
  height: 100vh;
  overflow-y: scroll;
}

/* HERO */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex; align-items: center;
}
.video-wrapper { position: absolute; inset: 0; z-index: 0; }
.video-bg { width: 100%; height: 100%; object-fit: cover; opacity: 0.85; }
.video-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    to right,
    rgba(27,67,50,0.88) 0%,
    rgba(27,67,50,0.55) 40%,
    rgba(27,67,50,0.15) 70%,
    rgba(27,67,50,0.0)  100%
  );
}
.grain {
  position: absolute; inset: 0; z-index: 1;
  pointer-events: none; opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  mix-blend-mode: overlay;
}
.hero-content {
  position: relative; z-index: 2;
  max-width: 900px; margin: 0 auto;
  padding: 6rem 1.4rem 2rem; width: 100%;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-family: 'Open Sans', sans-serif; font-size: 0.78rem;
  color: rgba(255,255,255,0.85);
  border: 1px solid rgba(212,163,115,0.5); border-radius: 100px;
  padding: 0.4rem 1rem; background: rgba(212,163,115,0.12);
  margin-bottom: 1.5rem;
}
.badge-star { color: var(--dorado); }
.hero-title {
  font-family: 'Anton', sans-serif;
  font-size: clamp(2.4rem, 8vw, 5rem);
  font-weight: 400; color: var(--blanco);
  line-height: 1.1; margin-bottom: 1.2rem; letter-spacing: 0.02em;
}
.hero-accent { color: var(--dorado); }
.hero-desc {
  font-family: 'Open Sans', sans-serif;
  font-size: clamp(0.9rem, 2.5vw, 1.05rem);
  color: rgba(255,255,255,0.78); line-height: 1.75;
  max-width: 540px; margin-bottom: 2.8rem;
}
.hero-stats {
  display: flex; gap: 2.5rem; flex-wrap: wrap;
  margin-top: 2.5rem; margin-bottom: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.15);
}
.hstat { display: flex; flex-direction: column; gap: 0.2rem; }
.hstat-val {
  font-family: 'Anton', sans-serif;
  font-size: clamp(1.2rem, 3.5vw, 1.6rem);
  font-weight: 400; color: var(--dorado); letter-spacing: 0.04em;
}
.hstat-lbl {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.7rem; color: rgba(255,255,255,0.55);
  text-transform: uppercase; letter-spacing: 0.1em;
}
.hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.8rem; }

/* BOTONES */
.btn-primary {
  all: unset; cursor: pointer;
  background: var(--dorado); color: var(--blanco);
  font-family: 'Open Sans', sans-serif; font-size: 0.88rem; font-weight: 600;
  padding: 0.85rem 1.8rem; border-radius: 100px;
  -webkit-user-select: none; user-select: none;
  transition: opacity 0.2s, transform 0.2s;
}
.btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

.btn-secondary {
  all: unset; cursor: pointer;
  border: 1.5px solid rgba(255,255,255,0.45); color: var(--blanco);
  font-family: 'Open Sans', sans-serif; font-size: 0.88rem; font-weight: 600;
  padding: 0.85rem 1.8rem; border-radius: 100px;
  -webkit-user-select: none; user-select: none;
  transition: border-color 0.2s, background 0.2s;
  display: inline-flex; align-items: center;
}
.btn-secondary:hover { border-color: var(--dorado); background: rgba(212,163,115,0.1); }

.btn-dark {
  all: unset; cursor: pointer;
  background: var(--verde); color: var(--blanco);
  font-family: 'Open Sans', sans-serif; font-size: 0.88rem; font-weight: 600;
  padding: 0.85rem 1.8rem; border-radius: 100px;
  -webkit-user-select: none; user-select: none;
  transition: opacity 0.2s, transform 0.2s;
  display: inline-block; margin-top: 1.5rem;
}
.btn-dark:hover { opacity: 0.85; transform: translateY(-1px); }

/* SECCIONES */
.section { scroll-margin-top: var(--nav-h); }
.section-inner { max-width: 900px; margin: 0 auto; padding: 3.5rem 1.4rem; }
.light-section  { background: var(--crema); }
.green-section  { background: var(--verde); }

.section-tag {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.68rem; font-weight: 600;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--verde); margin-bottom: 0.8rem;
}
.section-title {
  font-family: 'Anton', sans-serif;
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  font-weight: 400; color: var(--verde);
  line-height: 1.15; margin-bottom: 1rem; letter-spacing: 0.02em;
}
.section-title.white { color: var(--blanco); }
.section-desc {
  font-family: 'Open Sans', sans-serif;
  font-size: clamp(0.88rem, 2vw, 1rem);
  color: var(--texto-muted); line-height: 1.8;
  max-width: 600px; margin-bottom: 2rem;
}
.section-desc.white-muted { color: rgba(255,255,255,0.7); }

/* TABS */
.tabs { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.tab-btn {
  all: unset; cursor: pointer;
  font-family: 'Open Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
  padding: 0.5rem 1.1rem; border-radius: 100px;
  border: 1.5px solid #ccc; color: var(--verde);
  -webkit-user-select: none; user-select: none; transition: all 0.2s;
}
.tab-btn.active {
  background: var(--verde); color: var(--blanco); border-color: var(--verde);
}
.tab-num { color: var(--verde); margin-right: 4px; font-weight: 700; }
.tab-btn.active .tab-num { color: var(--dorado); }

.fase-card {
  background: var(--blanco); border-radius: 16px;
  padding: 1.5rem; margin-bottom: 1.5rem;
}
.fase-tag {
  font-family: 'Open Sans', sans-serif; font-size: 0.65rem; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--dorado); margin-bottom: 0.5rem;
}
.fase-title {
  font-family: 'Anton', sans-serif; font-size: 1.3rem; font-weight: 400;
  color: var(--verde); margin-bottom: 0.8rem; letter-spacing: 0.02em;
}
.fase-desc {
  font-family: 'Open Sans', sans-serif; font-size: 0.88rem;
  color: var(--texto-muted); line-height: 1.75; margin-bottom: 1rem;
}
.fase-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.etiqueta {
  font-family: 'Open Sans', sans-serif; font-size: 0.75rem;
  padding: 0.35rem 0.8rem; border-radius: 100px;
  background: rgba(27, 67, 50, 0.08);
  color: var(--verde); border: none;
}

/* MINI STATS */
.mini-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0;
  margin-top: 1rem;
}
.mini-stat {
  display: flex; flex-direction: column;
  align-items: center; gap: 0.3rem; text-align: center;
  padding: 1.2rem 1rem;
  border-left: 1px solid rgba(27, 67, 50, 0.12);
}
.mini-stat:first-child { border-left: none; }
.mini-icon { font-size: 1.3rem; }
.mini-val {
  font-family: 'Anton', sans-serif; font-size: 1.1rem;
  font-weight: 400; color: var(--verde);
}
.mini-lbl {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.7rem; color: var(--texto-muted);
}

/* PROCESO */
.proceso-list { display: flex; flex-direction: column; gap: 1.2rem; }
.proceso-item {
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px; padding: 1.3rem;
  display: flex; gap: 1rem; align-items: flex-start;
}
.proceso-num {
  font-family: 'Anton', sans-serif; font-size: 2rem; font-weight: 400;
  color: var(--dorado); flex-shrink: 0; line-height: 1;
}
.proceso-title {
  font-family: 'Anton', sans-serif; font-size: 1.05rem; font-weight: 400;
  color: var(--blanco); margin-bottom: 0.4rem; letter-spacing: 0.02em;
}
.proceso-desc {
  font-family: 'Open Sans', sans-serif; font-size: 0.85rem;
  color: rgba(255,255,255,0.7); line-height: 1.7;
}

/* BENEFICIOS */
.beneficios-list {
  list-style: none; padding: 0;
  display: flex; flex-direction: column; gap: 1rem;
}
.beneficio-item {
  display: flex; align-items: flex-start; gap: 0.8rem;
  font-family: 'Open Sans', sans-serif; font-size: 0.92rem;
  color: var(--texto); line-height: 1.6;
}
.beneficio-icon {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(212,163,115,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}

/* ALIADOS */
.aliados-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;
}
.aliado-card {
  background: var(--blanco); border-radius: 12px;
  padding: 1rem; display: flex; gap: 0.8rem; align-items: center;
}
.aliado-badge {
  width: 40px; height: 40px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 700; color: #1a1a1a; flex-shrink: 0;
}
.aliado-nombre {
  font-family: 'Anton', sans-serif; font-size: 0.9rem;
  font-weight: 400; color: var(--texto); letter-spacing: 0.02em;
}
.aliado-tipo { font-family: 'Open Sans', sans-serif; font-size: 0.72rem; color: var(--texto-muted); }

/* CONTACTO */
.contacto-cards { display: flex; flex-direction: column; gap: 1rem; }
.contacto-card { background: var(--crema-card); border-radius: 16px; padding: 1.3rem; }
.contacto-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
.contacto-titulo {
  font-family: 'Anton', sans-serif; font-size: 1.05rem; font-weight: 400;
  color: var(--texto); margin-bottom: 0.3rem; letter-spacing: 0.02em;
}
.contacto-sub  { font-family: 'Open Sans', sans-serif; font-size: 0.82rem; color: var(--texto-muted); margin-bottom: 0.3rem; }
.contacto-val  { font-family: 'Open Sans', sans-serif; font-size: 0.88rem; color: var(--verde); font-weight: 600; }

/* FAB */
.fab {
  all: unset; cursor: pointer;
  position: fixed; bottom: 24px; right: 16px;
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--dorado); color: var(--blanco);
  font-size: 1.6rem;
  display: flex; align-items: center; justify-content: center;
  z-index: 90; box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}
.fab:hover { transform: scale(1.08); }
.fab-label {
  position: fixed; bottom: 10px; right: 12px;
  font-family: 'Open Sans', sans-serif; font-size: 0.6rem;
  color: var(--texto-muted); z-index: 90;
}

/* FOOTER */
.footer-main {
  background: var(--verde);
  font-family: 'Open Sans', sans-serif; font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  text-align: center; padding: 1.5rem; letter-spacing: 0.05em;
}

/* RESPONSIVE */
@media (min-width: 768px) {
  .hero-btns { flex-wrap: nowrap; }
  .contacto-cards { display: grid; grid-template-columns: repeat(3, 1fr); }
  .aliados-grid { grid-template-columns: repeat(3, 1fr); }
}
/* Fade entre pestañas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from {
  opacity: 0; transform: translateY(6px);
}
.fade-leave-to {
  opacity: 0; transform: translateY(-6px);
}
/* ── Proceso rediseñado ── */
.proceso-item {
  display: flex;
  gap: 1.4rem;
  align-items: flex-start;
  padding: 1.6rem;
  border-radius: 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  transition: background 0.3s ease;
}
.proceso-item:hover {
  background: rgba(255,255,255,0.09);
}
.proceso-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}
.proceso-icon {
  width: 44px; height: 44px;
  color: var(--dorado);
  opacity: 0.85;
}
.proceso-num {
  font-family: 'Anton', sans-serif;
  font-size: 1.6rem; font-weight: 400;
  color: var(--dorado); line-height: 1;
  letter-spacing: 0.04em;
}
.proceso-title {
  font-family: 'Anton', sans-serif;
  font-size: 1.05rem; font-weight: 400;
  color: var(--blanco); margin-bottom: 0.5rem;
  letter-spacing: 0.02em;
}
.proceso-desc {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.75;
}
.proceso-desc strong {
  color: var(--blanco);
  font-weight: 600;
}
.proceso-highlight {
  color: var(--dorado);
  font-weight: 600;
}

/* ── CTA grande ── */
.proceso-cta {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}
.btn-cta-grande {
  all: unset; cursor: pointer;
  display: inline-flex; align-items: center;
  background: var(--dorado);
  color: var(--blanco);
  font-family: 'Anton', sans-serif;
  font-size: 1rem; letter-spacing: 0.1em;
  padding: 1rem 2.4rem;
  border-radius: 100px;
  -webkit-user-select: none; user-select: none;
  box-shadow: 0 4px 24px rgba(212,163,115,0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-cta-grande:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(212,163,115,0.45);
}

/* ── Textura fondo verde sección ── */
.green-section {
  background: var(--verde);
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'%3E%3Ccircle cx='30' cy='30' r='28'/%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 60px 60px;
}
/* ── Propietarios rediseñado ── */
.propietario-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.propietario-content { display: flex; flex-direction: column; gap: 0; }

.beneficio-item {
  display: flex; align-items: flex-start; gap: 0.9rem;
  font-family: 'Open Sans', sans-serif; font-size: 0.92rem;
  color: var(--texto); line-height: 1.6;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(27,67,50,0.08);
}
.beneficio-item:last-child { border-bottom: none; }

.beneficio-icon {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(27,67,50,0.07);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--verde);
}

/* Botón finca con hover elegante */
.btn-finca {
  all: unset; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.6rem;
  background: var(--verde); color: var(--blanco);
  font-family: 'Open Sans', sans-serif; font-size: 0.88rem; font-weight: 600;
  padding: 0.9rem 1.8rem; border-radius: 100px;
  margin-top: 1.8rem;
  -webkit-user-select: none; user-select: none;
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}
.btn-finca:hover {
  background: var(--dorado);
  box-shadow: 0 6px 24px rgba(212,163,115,0.35);
  transform: translateY(-1px);
}
.btn-arrow {
  transition: transform 0.25s ease;
}
.btn-finca:hover .btn-arrow {
  transform: translateX(4px);
}

/* Imagen propietario */
.propietario-imagen {
  position: relative;
}
.finca-foto {
  width: 100%; height: 420px;
  object-fit: cover;
  border-radius: 20px;
  display: block;
}
.imagen-overlay-badge {
  position: absolute; bottom: 1rem; left: 1rem;
  background: rgba(27,67,50,0.88);
  color: var(--blanco);
  font-family: 'Open Sans', sans-serif; font-size: 0.72rem;
  font-weight: 600; letter-spacing: 0.06em;
  padding: 0.45rem 0.9rem; border-radius: 100px;
  display: flex; align-items: center; gap: 0.4rem;
  backdrop-filter: blur(6px);
}

/* Responsive — en móvil va en columna */
@media (max-width: 767px) {
  .propietario-inner {
    grid-template-columns: 1fr;
  }
  .finca-foto { height: 260px; }
  .propietario-imagen { order: -1; }
}
/* ── Aliados rediseñado — Logo Farm ── */
.aliados-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0;
  border: 1px solid rgba(27,67,50,0.1);
  border-radius: 16px;
  overflow: hidden;
}
.aliado-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  border-right: 1px solid rgba(27,67,50,0.08);
  border-bottom: 1px solid rgba(27,67,50,0.08);
  filter: grayscale(100%);
  opacity: 0.5;
  transition: filter 0.3s ease, opacity 0.3s ease;
  cursor: default;
}
.aliado-logo:hover {
  filter: grayscale(0%);
  opacity: 1;
}
.aliado-sigla-logo {
  font-family: 'Anton', sans-serif;
  font-size: 1.4rem; letter-spacing: 0.1em;
  color: var(--verde);
}
.aliado-nombre {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.8rem; font-weight: 600;
  color: var(--texto); text-align: center;
}
.aliado-tipo {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.68rem; color: var(--texto-muted);
  text-align: center;
}

/* ── Contacto con fondo sutil ── */
.contacto-section {
  background-color: var(--crema);
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(27,67,50,0.06)' stroke-width='0.8'%3E%3Cellipse cx='100' cy='100' rx='90' ry='60'/%3E%3Cellipse cx='100' cy='100' rx='70' ry='45'/%3E%3Cellipse cx='100' cy='100' rx='50' ry='30'/%3E%3Cellipse cx='100' cy='100' rx='30' ry='18'/%3E%3Cline x1='10' y1='100' x2='190' y2='100'/%3E%3Cline x1='100' y1='40' x2='100' y2='160'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 300px 300px;
  background-position: center;
}

.contacto-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
}
.contacto-card {
  background: var(--blanco);
  border-radius: 16px;
  padding: 1.6rem;
  border: 1px solid rgba(27,67,50,0.08);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}
.contacto-card:hover {
  box-shadow: 0 8px 24px rgba(27,67,50,0.1);
  transform: translateY(-2px);
}
.contacto-icon-box {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: rgba(27,67,50,0.07);
  display: flex; align-items: center; justify-content: center;
  color: var(--verde);
  margin-bottom: 1rem;
}
.contacto-titulo {
  font-family: 'Anton', sans-serif;
  font-size: 1rem; font-weight: 400;
  color: var(--texto); margin-bottom: 0.3rem;
  letter-spacing: 0.02em;
}
.contacto-sub {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.8rem; color: var(--texto-muted);
  margin-bottom: 0.5rem;
}
.contacto-val {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.88rem; color: var(--verde); font-weight: 600;
}
.contacto-link {
  text-decoration: none;
  display: inline-block;
  transition: color 0.2s ease;
}
.contacto-link:hover {
  color: var(--dorado);
  text-decoration: underline;
}

/* Responsive aliados móvil */
@media (max-width: 767px) {
  .aliados-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.aliado-img {
  height: 48px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
}
/* ── FAB Container ── */
.fab-container {
  position: fixed;
  bottom: 24px; right: 16px;
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
}

.fab {
  all: unset; cursor: pointer;
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--dorado); color: var(--blanco);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  transition: transform 0.2s, background 0.2s;
  flex-shrink: 0;
}
.fab:hover { transform: scale(1.08); }
.fab.abierto { background: var(--verde); }

.fab-label {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.6rem; color: var(--texto-muted);
  text-align: right; margin-top: 4px;
}

/* ── Opciones del FAB ── */
.fab-opciones {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 0.8rem;
  align-items: flex-end;
}

.fab-opcion {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
}

.fab-opcion-label {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.78rem; font-weight: 600;
  color: var(--verde);
  background: var(--blanco);
  padding: 0.35rem 0.8rem;
  border-radius: 100px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  white-space: nowrap;
}

.fab-btn {
  all: unset; cursor: pointer;
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--blanco);
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s;
  flex-shrink: 0;
}
.fab-btn:hover { transform: scale(1.1); }

.fab-login      { background: #1B4332; }
.fab-inversor   { background: #D4A373; }
.fab-propietario{ background: #2D6A4F; }
.fab-zootecnista{ background: #52796F; }

/* ── Animación FAB ── */
.fab-slide-enter-active,
.fab-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fab-slide-enter-from,
.fab-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.label-login       { color: #1B4332; border-left: 3px solid #1B4332; }
.label-inversor    { color: #92400E; border-left: 3px solid #D4A373; }
.label-propietario { color: #1B4332; border-left: 3px solid #2D6A4F; }
.label-zootecnista { color: #2C4A3E; border-left: 3px solid #52796F; }

.fab-opcion-label {
  padding-left: 0.9rem;
}
.logo-img {
  width: 120px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
</style>