# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: deposits.spec.ts >> Deposits & Investments >> should display transactions page
- Location: tests/deposits.spec.ts:24:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('main').getByRole('heading', { name: 'Transactions' })
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('main').getByRole('heading', { name: 'Transactions' })

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Deposits & Investments", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/login")
  6  |     await page.getByPlaceholder("name@example.com").fill("test@nextlevel.com")
  7  |     await page.getByPlaceholder("••••••••").fill("user123")
  8  |     await page.getByRole("button", { name: "Sign in" }).click()
  9  |     await expect(page).toHaveURL("/dashboard", { timeout: 10000 })
  10 |   })
  11 | 
  12 |   test("should display investment page", async ({ page }) => {
  13 |     await page.getByRole("navigation").getByRole("link", { name: "Buy Crypto" }).click()
  14 |     await expect(page).toHaveURL("/dashboard/investments")
  15 |     await expect(page.getByRole("main").getByRole("heading", { name: "Buy Crypto" })).toBeVisible()
  16 |   })
  17 | 
  18 |   test("should have invest buttons", async ({ page }) => {
  19 |     await page.getByRole("navigation").getByRole("link", { name: "Buy Crypto" }).click()
  20 |     await expect(page).toHaveURL("/dashboard/investments")
  21 |     await expect(page.getByRole("button", { name: /Submit via Telegram/i }).first()).toBeVisible({ timeout: 10000 })
  22 |   })
  23 | 
  24 |   test("should display transactions page", async ({ page }) => {
  25 |     await page.getByRole("navigation").getByRole("link", { name: "Transactions" }).click()
  26 |     await expect(page).toHaveURL("/dashboard/transactions")
> 27 |     await expect(page.getByRole("main").getByRole("heading", { name: "Transactions" })).toBeVisible()
     |                                                                                         ^ Error: expect(locator).toBeVisible() failed
  28 |   })
  29 | 
  30 |   test("should filter transactions by type", async ({ page }) => {
  31 |     await page.getByRole("navigation").getByRole("link", { name: "Transactions" }).click()
  32 |     await expect(page).toHaveURL("/dashboard/transactions")
  33 |     await expect(page.getByRole("button", { name: /all/i })).toBeVisible()
  34 |   })
  35 | })
```