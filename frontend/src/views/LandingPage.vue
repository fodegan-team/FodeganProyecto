<template>
  <div class="landing-root">
    <div class="video-wrapper">
      <video
        class="video-bg"
        autoplay
        muted
        loop
        playsinline
        src="/video/finca.mp4"
      />
      <div class="video-overlay" />
    </div>

    <main class="main-content">

      <section class="hero">
        <h1 class="titulo">FODEGAN</h1>

        <p class="subtitulo" :class="{ show: ui.sub }">
          Conectamos inversionistas, propietarios y zootecnistas<br />
          en un ecosistema transparente, rentable y trazable.
        </p>

        <div class="cta-group" :class="{ show: ui.cta }">
          <button class="btn btn-ghost" @click="ir('')">
            <span>Inicio</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </section>

    <footer class="footer">
        © 2026 FODEGAN · Todos los derechos reservados ·
        <span style="color: #D4A373;">Plataforma Ganadera</span>
    </footer>

    </main>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'

const ui = reactive({
  sub: false,
  cta: false,
})

const timers = []
const wait = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t) }

function iniciar() {
  wait(() => { ui.sub = true }, 600)
  wait(() => { ui.cta = true }, 1100)
}

import { useRouter } from 'vue-router'
const router = useRouter()
function ir() {
  router.push('/home')
}

onMounted(iniciar)
onUnmounted(() => timers.forEach(clearTimeout))
</script>

<style scoped>
.landing-root {
  --verde:    #1B4332;
  --dorado:   #D4A373;
  --blanco:   #FFFFFF;
  --dorado-t: rgba(212, 163, 115, 0.18);
  --dorado-b: rgba(212, 163, 115, 0.45);
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background: var(--verde);
  color: var(--blanco);
  font-family: 'Playfair Display', Georgia, serif;
}

/* VIDEO */
.video-wrapper { position: fixed; inset: 0; z-index: 0; }
.video-bg {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center;
  opacity: 0.55;
}
.video-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    150deg,
    rgba(27, 67, 50, 0.90) 0%,
    rgba(27, 67, 50, 0.65) 45%,
    rgba(43, 45, 66, 0.82) 100%
  );
}

/* LAYOUT */
.main-content {
  position: relative; z-index: 10;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: 100vh; gap: 2.5rem; padding: 2rem 1.5rem;
}

/* HERO */
.hero {
  display: flex; flex-direction: column;
  align-items: center; gap: 2rem; text-align: center;
}

.titulo {
  font-size: clamp(4rem, 13vw, 10rem);
  font-weight: 700; line-height: 1; letter-spacing: 0.06em;
  text-shadow: 0 4px 40px rgba(0,0,0,0.4);
}

/* SUBTÍTULO */
.subtitulo {
  font-style: italic;
  font-size: clamp(0.95rem, 2.2vw, 1.15rem);
  line-height: 1.8; color: rgba(255,255,255,0.75); max-width: 500px;
  opacity: 0; transform: translateY(14px);
  transition: opacity 0.9s ease, transform 0.9s ease;
  font-family: 'Lora', Georgia, serif;
}
.subtitulo.show { opacity: 1; transform: translateY(0); }

/* BOTONES */
.cta-group {
  display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
  opacity: 0; transform: translateY(18px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.cta-group.show { opacity: 1; transform: translateY(0); }

.btn {
  all: unset; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.6rem;
  padding: 0.8rem 1.9rem; border-radius: 3px;
  font-family: 'Lora', Georgia, serif;
  font-size: 0.82rem; font-weight: 500;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--blanco) !important;
  -webkit-user-select: none; user-select: none;
  transition: background 0.28s ease, border-color 0.28s ease,
              box-shadow 0.28s ease, transform 0.18s ease;
}
.btn svg { flex-shrink: 0; transition: transform 0.25s ease; }
.btn:hover svg { transform: translateX(3px); }

.btn-ghost {
  border: 1.5px solid rgba(255,255,255,0.38);
  background: transparent;
}
.btn-ghost:hover {
  border-color: var(--dorado);
  background: var(--dorado-t);
  box-shadow: 0 0 20px rgba(212,163,115,0.18);
  transform: translateY(-2px);
}

.btn-filled {
  background: var(--dorado);
  border: 1.5px solid var(--dorado);
}
.btn-filled:hover {
  background: transparent;
  box-shadow: 0 0 24px rgba(212,163,115,0.3), inset 0 0 0 1px var(--dorado);
  transform: translateY(-2px);
}

/* FOOTER */
.footer {
  font-family: 'Lora', Georgia, serif;
  font-size: 0.75rem; color: rgba(255,255,255,0.35);
  letter-spacing: 0.05em; text-align: center;
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .titulo { font-size: clamp(3rem, 18vw, 5rem); }
  .cta-group { flex-direction: column; width: 100%; max-width: 300px; }
  .btn { justify-content: center; }
}
</style>