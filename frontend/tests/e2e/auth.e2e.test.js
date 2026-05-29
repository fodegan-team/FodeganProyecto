import { test, expect } from '@playwright/test'

// ══════════════════════════════════════════════════
// PRUEBA E2E 1 — Flujo de registro de inversor
// ══════════════════════════════════════════════════
test.describe('E2E 1: Flujo de registro de inversor', () => {

  test('debe completar el registro de un inversor exitosamente', async ({ page }) => {
    // 1. Ir al home
    await page.goto('/home')

   // 2. Abrir el FAB y esperar las opciones
    await page.locator('.fab').click()
    await page.waitForTimeout(800)

    // 3. Navegar directamente a la ruta de registro
    await page.goto('/register?rol=1')
    await page.waitForURL(/register\?rol=1/, { timeout: 10000 })

    // 4. Llenar el formulario
    const timestamp = Date.now()
    await page.fill('input[placeholder="Tu nombre"]',            'Juan')
    await page.fill('input[placeholder="Tu apellido"]',          'Prueba')
    await page.fill('input[placeholder="correo@ejemplo.com"]',   `e2e_${timestamp}@test.com`)
    await page.fill('input[placeholder="Mínimo 8 caracteres"]',  'Fodegan2026')
    await page.fill('input[placeholder="+57 300 000 0000"]',     '3001234567')
    await page.fill('input[placeholder="Número de cédula"]',     `${timestamp}`)
    await page.fill('input[placeholder="Tu ciudad"]',            'Bogotá')

    await page.fill('input[placeholder="Ej: 5.000.000"]',            '10000000')
    await page.fill('input[placeholder="Nombre del banco"]',          'Bancolombia')
    await page.selectOption('select',                                  'ahorros')
    await page.fill('input[placeholder="Número de cuenta bancaria"]', '123456789')

    // 5. Enviar
    await page.locator('.btn-submit').click()

    // 6. Verificar éxito
    await expect(page.locator('.alert-success')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.alert-success')).toContainText('Registro exitoso')
  })

})

// ══════════════════════════════════════════════════
// PRUEBA E2E 2 — Flujo de login
// ══════════════════════════════════════════════════
test.describe('E2E 2: Flujo de login', () => {

  test('debe iniciar sesión y redirigir al dashboard', async ({ page }) => {
    // 1. Ir al login
    await page.goto('/login')
    await expect(page.locator('.card-title')).toContainText('Iniciar Sesión')

    // 2. Llenar credenciales
    await page.fill('input[type="email"]',    'jairojocadi@hotmail.com')
    await page.fill('input[type="password"]', 'Mariajose1728')

    // 3. Enviar
    await page.locator('.btn-submit').click()

    // 4. Esperar redirección al dashboard
    await page.waitForURL(/dashboard/, { timeout: 15000 })
    await expect(page).toHaveURL(/dashboard/)
  })

  test('debe mostrar error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]',    'noexiste@fodegan.com')
    await page.fill('input[type="password"]', 'ClaveWrong123')
    await page.locator('.btn-submit').click()
    await expect(page.locator('.alert-error')).toBeVisible({ timeout: 5000 })
  })

})