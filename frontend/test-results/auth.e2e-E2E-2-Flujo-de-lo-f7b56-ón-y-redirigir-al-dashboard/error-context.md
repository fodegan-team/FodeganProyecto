# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.e2e.test.js >> E2E 2: Flujo de login >> debe iniciar sesión y redirigir al dashboard
- Location: tests\e2e\auth.e2e.test.js:50:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e6]:
    - link "Volver" [ref=e7] [cursor=pointer]:
      - /url: /home
      - img [ref=e8]
      - text: Volver
    - generic [ref=e10]:
      - text: FODEGAN
      - generic [ref=e11]: INVERSIONES GANADERAS
  - generic [ref=e12]:
    - generic [ref=e13]:
      - img [ref=e15]
      - generic [ref=e18]:
        - heading "Iniciar Sesión" [level=1] [ref=e19]
        - paragraph [ref=e20]: Bienvenido de vuelta a FODEGAN
    - generic [ref=e21]:
      - img [ref=e22]
      - text: Demasiados intentos. Espera 15 minutos.
    - generic [ref=e24]:
      - generic [ref=e25]:
        - generic [ref=e26]: Correo electrónico
        - textbox "correo@ejemplo.com" [ref=e27]: jairojocadi@hotmail.com
      - generic [ref=e28]:
        - generic [ref=e29]: Contraseña
        - generic [ref=e30]:
          - textbox "Tu contraseña" [ref=e31]: Mariajose1728
          - button [active] [ref=e32] [cursor=pointer]:
            - img [ref=e33]
      - button "Ingresar" [ref=e36] [cursor=pointer]
      - paragraph [ref=e37]:
        - text: ¿No tienes cuenta?
        - link "Regístrate aquí" [ref=e38] [cursor=pointer]:
          - /url: /home
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | // ══════════════════════════════════════════════════
  4  | // PRUEBA E2E 1 — Flujo de registro de inversor
  5  | // ══════════════════════════════════════════════════
  6  | test.describe('E2E 1: Flujo de registro de inversor', () => {
  7  | 
  8  |   test('debe completar el registro de un inversor exitosamente', async ({ page }) => {
  9  |     // 1. Ir al home
  10 |     await page.goto('/home')
  11 | 
  12 |    // 2. Abrir el FAB y esperar las opciones
  13 |     await page.locator('.fab').click()
  14 |     await page.waitForTimeout(800)
  15 | 
  16 |     // 3. Navegar directamente a la ruta de registro
  17 |     await page.goto('/register?rol=1')
  18 |     await page.waitForURL(/register\?rol=1/, { timeout: 10000 })
  19 | 
  20 |     // 4. Llenar el formulario
  21 |     const timestamp = Date.now()
  22 |     await page.fill('input[placeholder="Tu nombre"]',            'Juan')
  23 |     await page.fill('input[placeholder="Tu apellido"]',          'Prueba')
  24 |     await page.fill('input[placeholder="correo@ejemplo.com"]',   `e2e_${timestamp}@test.com`)
  25 |     await page.fill('input[placeholder="Mínimo 8 caracteres"]',  'Fodegan2026')
  26 |     await page.fill('input[placeholder="+57 300 000 0000"]',     '3001234567')
  27 |     await page.fill('input[placeholder="Número de cédula"]',     `${timestamp}`)
  28 |     await page.fill('input[placeholder="Tu ciudad"]',            'Bogotá')
  29 | 
  30 |     await page.fill('input[placeholder="Ej: 5.000.000"]',            '10000000')
  31 |     await page.fill('input[placeholder="Nombre del banco"]',          'Bancolombia')
  32 |     await page.selectOption('select',                                  'ahorros')
  33 |     await page.fill('input[placeholder="Número de cuenta bancaria"]', '123456789')
  34 | 
  35 |     // 5. Enviar
  36 |     await page.locator('.btn-submit').click()
  37 | 
  38 |     // 6. Verificar éxito
  39 |     await expect(page.locator('.alert-success')).toBeVisible({ timeout: 10000 })
  40 |     await expect(page.locator('.alert-success')).toContainText('Registro exitoso')
  41 |   })
  42 | 
  43 | })
  44 | 
  45 | // ══════════════════════════════════════════════════
  46 | // PRUEBA E2E 2 — Flujo de login
  47 | // ══════════════════════════════════════════════════
  48 | test.describe('E2E 2: Flujo de login', () => {
  49 | 
  50 |   test('debe iniciar sesión y redirigir al dashboard', async ({ page }) => {
  51 |     // 1. Ir al login
  52 |     await page.goto('/login')
  53 |     await expect(page.locator('.card-title')).toContainText('Iniciar Sesión')
  54 | 
  55 |     // 2. Llenar credenciales
  56 |     await page.fill('input[type="email"]',    'jairojocadi@hotmail.com')
  57 |     await page.fill('input[type="password"]', 'Mariajose1728')
  58 | 
  59 |     // 3. Enviar
  60 |     await page.locator('.btn-submit').click()
  61 | 
  62 |     // 4. Esperar redirección al dashboard
> 63 |     await page.waitForURL(/dashboard/, { timeout: 15000 })
     |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  64 |     await expect(page).toHaveURL(/dashboard/)
  65 |   })
  66 | 
  67 |   test('debe mostrar error con credenciales incorrectas', async ({ page }) => {
  68 |     await page.goto('/login')
  69 |     await page.fill('input[type="email"]',    'noexiste@fodegan.com')
  70 |     await page.fill('input[type="password"]', 'ClaveWrong123')
  71 |     await page.locator('.btn-submit').click()
  72 |     await expect(page.locator('.alert-error')).toBeVisible({ timeout: 5000 })
  73 |   })
  74 | 
  75 | })
```