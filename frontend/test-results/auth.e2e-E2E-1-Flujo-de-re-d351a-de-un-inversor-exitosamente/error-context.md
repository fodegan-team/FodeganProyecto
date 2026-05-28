# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.e2e.test.js >> E2E 1: Flujo de registro de inversor >> debe completar el registro de un inversor exitosamente
- Location: tests\e2e\auth.e2e.test.js:8:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.alert-success')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.alert-success')

```

```yaml
- link "Volver":
  - /url: /home
  - img
  - text: Volver
- text: FODEGAN INVERSIONES GANADERAS
- img
- heading "Quiero Invertir" [level=1]
- paragraph: Crea tu cuenta como inversor y empieza a generar rentabilidad
- img
- text: Demasiados intentos. Espera 15 minutos. Nombre
- textbox "Tu nombre": Juan
- text: Apellido
- textbox "Tu apellido": Prueba
- text: Correo electrónico
- textbox "correo@ejemplo.com": e2e_1779945270695@test.com
- text: Contraseña
- textbox "Mínimo 8 caracteres": Fodegan2026
- button:
  - img
- paragraph: ✓ Contraseña válida
- text: Teléfono
- textbox "+57 300 000 0000": "3001234567"
- text: Cédula
- textbox "Número de cédula": "1779945270695"
- text: Ciudad
- textbox "Tu ciudad": Bogotá
- text: Información financiera Monto disponible para invertir (COP)
- 'textbox "Ej: 5.000.000"': 10.000.000
- text: Banco
- textbox "Nombre del banco": Bancolombia
- text: Tipo de cuenta
- combobox:
  - option "Selecciona"
  - option "Ahorros" [selected]
  - option "Corriente"
- text: Número de cuenta
- textbox "Número de cuenta bancaria": "123456789"
- button "Crear cuenta de inversor"
- paragraph:
  - text: ¿Ya tienes cuenta?
  - link "Inicia sesión aquí":
    - /url: /login
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
> 39 |     await expect(page.locator('.alert-success')).toBeVisible({ timeout: 10000 })
     |                                                  ^ Error: expect(locator).toBeVisible() failed
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
  63 |     await page.waitForURL(/dashboard/, { timeout: 15000 })
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