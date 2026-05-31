# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.e2e.test.js >> E2E 2: Flujo de login >> debe iniciar sesión y redirigir al dashboard
- Location: tests\e2e\auth.e2e.test.js:31:3

# Error details

```
Error: page.waitForURL: Target page, context or browser has been closed
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:5173/login"
============================================================
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('E2E 1: Flujo de registro de inversor', () => {
  4  | 
  5  |   test('debe completar el registro de un inversor exitosamente', async ({ page }) => {
  6  |     await page.goto('/register?rol=1')
  7  | 
  8  |     const timestamp = Date.now()
  9  |     await page.fill('input[placeholder="Tu nombre"]',            'Juan')
  10 |     await page.fill('input[placeholder="Tu apellido"]',          'Prueba')
  11 |     await page.fill('input[placeholder="correo@ejemplo.com"]',   `e2e_${timestamp}@test.com`)
  12 |     await page.fill('input[placeholder="Mínimo 8 caracteres"]',  'Fodegan2026')
  13 |     await page.fill('input[placeholder="+57 300 000 0000"]',     '3001234567')
  14 |     await page.fill('input[placeholder="Número de cédula"]',     `${timestamp}`)
  15 |     await page.fill('input[placeholder="Tu ciudad"]',            'Bogotá')
  16 |     await page.fill('input[placeholder="Ej: 5.000.000"]',            '10000000')
  17 |     await page.fill('input[placeholder="Nombre del banco"]',          'Bancolombia')
  18 |     await page.selectOption('select',                                  'ahorros')
  19 |     await page.fill('input[placeholder="Número de cuenta bancaria"]', '123456789')
  20 | 
  21 |     await page.locator('.btn-submit').click()
  22 | 
  23 |     await expect(page.locator('.alert-success')).toBeVisible({ timeout: 15000 })
  24 |     await expect(page.locator('.alert-success')).toContainText('Registro exitoso')
  25 |   })
  26 | 
  27 | })
  28 | 
  29 | test.describe('E2E 2: Flujo de login', () => {
  30 | 
  31 |   test('debe iniciar sesión y redirigir al dashboard', async ({ page }) => {
  32 |     await page.goto('/home')
  33 |     await page.locator('.fab').click()
  34 |     await page.waitForSelector('.fab-opciones', { state: 'visible' })
  35 |     await page.locator('.fab-opcion-label').filter({ hasText: 'Iniciar Sesión' }).click()
  36 |     await page.waitForSelector('.modal-split', { state: 'visible' })
  37 | 
  38 |     await page.fill('input[type="email"]',    'jairojocadi@hotmail.com')
  39 |     await page.fill('input[type="password"]', 'Mariajose1728')
  40 |     await page.locator('.btn-ingresar').click()
  41 | 
> 42 |     await page.waitForURL(/dashboard/, { timeout: 15000 })
     |                ^ Error: page.waitForURL: Target page, context or browser has been closed
  43 |     await expect(page).toHaveURL(/dashboard/)
  44 |   })
  45 | 
  46 |   test('debe mostrar error con credenciales incorrectas', async ({ page }) => {
  47 |     await page.goto('/home')
  48 |     await page.locator('.fab').click()
  49 |     await page.waitForSelector('.fab-opciones', { state: 'visible' })
  50 |     await page.locator('.fab-opcion-label').filter({ hasText: 'Iniciar Sesión' }).click()
  51 |     await page.waitForSelector('.modal-split', { state: 'visible' })
  52 | 
  53 |     await page.fill('input[type="email"]',    'noexiste@fodegan.com')
  54 |     await page.fill('input[type="password"]', 'ClaveWrong123')
  55 |     await page.locator('.btn-ingresar').click()
  56 | 
  57 |     await expect(page.locator('.alert-error')).toBeVisible({ timeout: 5000 })
  58 |   })
  59 | 
  60 | })
```