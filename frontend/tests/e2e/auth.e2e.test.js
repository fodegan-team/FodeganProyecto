import { test, expect } from '@playwright/test'

test.describe('E2E 1: Flujo de registro de inversor', () => {

  test('debe completar el registro de un inversor exitosamente', async ({ page }) => {
    await page.goto('/register?rol=1')

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

    await page.locator('.btn-submit').click()

    await expect(page.locator('.alert-success')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.alert-success')).toContainText('Registro exitoso')
  })

})

test.describe('E2E 2: Flujo de login', () => {

  test('debe iniciar sesión y redirigir al dashboard', async ({ page }) => {
    await page.goto('/home')
    await page.locator('.fab').click()
    await page.waitForSelector('.fab-opciones', { state: 'visible' })
    await page.locator('.fab-opcion-label').filter({ hasText: 'Iniciar Sesión' }).click()
    await page.waitForSelector('.modal-split', { state: 'visible' })

    await page.fill('input[type="email"]',    'jairojocadi@hotmail.com')
    await page.fill('input[type="password"]', 'Fodegan2026')
    await page.locator('.btn-ingresar').click()

    await page.waitForURL(/dashboard/, { timeout: 15000 })
    await expect(page).toHaveURL(/dashboard/)
  })

  test('debe mostrar error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/home')
    await page.locator('.fab').click()
    await page.waitForSelector('.fab-opciones', { state: 'visible' })
    await page.locator('.fab-opcion-label').filter({ hasText: 'Iniciar Sesión' }).click()
    await page.waitForSelector('.modal-split', { state: 'visible' })

    await page.fill('input[type="email"]',    'noexiste@fodegan.com')
    await page.fill('input[type="password"]', 'ClaveWrong123')
    await page.locator('.btn-ingresar').click()

    await expect(page.locator('.alert-error')).toBeVisible({ timeout: 5000 })
  })

})