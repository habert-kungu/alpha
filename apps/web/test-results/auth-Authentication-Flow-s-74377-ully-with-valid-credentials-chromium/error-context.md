# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should login successfully with valid credentials
- Location: tests/auth.spec.ts:23:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Dashboard')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Dashboard')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e12]:
    - complementary [ref=e13]:
      - link "Next Level" [ref=e15] [cursor=pointer]:
        - /url: /
        - img [ref=e16]
        - generic [ref=e18]: Next Level
      - navigation [ref=e19]:
        - generic [ref=e20]: Main
        - link "Overview" [ref=e21] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e23]
          - generic [ref=e26]: Overview
        - link "Transactions" [ref=e27] [cursor=pointer]:
          - /url: /dashboard/transactions
          - img [ref=e29]
          - generic [ref=e32]: Transactions
        - generic [ref=e33]: Actions
        - link "Buy Crypto" [ref=e34] [cursor=pointer]:
          - /url: /dashboard/investments
          - img [ref=e36]
          - generic [ref=e38]: Buy Crypto
        - link "Withdraw" [ref=e39] [cursor=pointer]:
          - /url: /dashboard/withdraw
          - img [ref=e41]
          - generic [ref=e44]: Withdraw
        - link "Services" [ref=e45] [cursor=pointer]:
          - /url: /dashboard/services
          - img [ref=e47]
          - generic [ref=e51]: Services
        - generic [ref=e52]: Insights
        - link "Strategies" [ref=e53] [cursor=pointer]:
          - /url: /dashboard/strategies
          - img [ref=e55]
          - generic [ref=e58]: Strategies
        - link "Risk Management" [ref=e59] [cursor=pointer]:
          - /url: /dashboard/risk
          - img [ref=e61]
          - generic [ref=e63]: Risk Management
        - link "Explore Markets" [ref=e64] [cursor=pointer]:
          - /url: /dashboard/explore
          - img [ref=e66]
          - generic [ref=e69]: Explore Markets
        - generic [ref=e70]: Account
        - link "Profile" [ref=e71] [cursor=pointer]:
          - /url: /dashboard/profile
          - img [ref=e73]
          - generic [ref=e76]: Profile
        - link "Support" [ref=e77] [cursor=pointer]:
          - /url: /dashboard/support
          - img [ref=e79]
          - generic [ref=e82]: Support
      - button "Sign Out" [ref=e84] [cursor=pointer]:
        - img [ref=e85]
        - generic [ref=e88]: Sign Out
      - generic [ref=e90]:
        - generic [ref=e91]: U
        - generic [ref=e92]:
          - paragraph [ref=e93]: User
          - paragraph [ref=e94]: Investor
    - generic [ref=e95]:
      - banner [ref=e96]:
        - generic [ref=e98]: Overview
        - button [ref=e101] [cursor=pointer]:
          - img [ref=e102]
      - main [ref=e105]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Authentication Flow", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/login")
  6  |   })
  7  | 
  8  |   test("should display login page correctly", async ({ page }) => {
  9  |     await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
  10 |     await expect(page.getByPlaceholder("name@example.com")).toBeVisible()
  11 |     await expect(page.getByPlaceholder("••••••••")).toBeVisible()
  12 |     await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible()
  13 |   })
  14 | 
  15 |   test("should show error for invalid credentials", async ({ page }) => {
  16 |     await page.getByPlaceholder("name@example.com").fill("invalid@test.com")
  17 |     await page.getByPlaceholder("••••••••").fill("wrongpassword")
  18 |     await page.getByRole("button", { name: "Sign in" }).click()
  19 | 
  20 |     await expect(page.getByText("Invalid email or password")).toBeVisible({ timeout: 10000 })
  21 |   })
  22 | 
  23 | test("should login successfully with valid credentials", async ({ page }) => {
  24 |     await page.goto("/login")
  25 |     await page.getByPlaceholder("name@example.com").fill("test@nextlevel.com")
  26 |     await page.getByPlaceholder("••••••••").fill("user123")
  27 |     await page.getByRole("button", { name: "Sign in" }).click()
  28 |     await expect(page).toHaveURL("/dashboard", { timeout: 10000 })
> 29 |     await expect(page.getByText("Dashboard")).toBeVisible()
     |                                               ^ Error: expect(locator).toBeVisible() failed
  30 |   })
  31 | 
  32 |   test("should redirect to login when accessing dashboard without auth", async ({ page }) => {
  33 |     await page.goto("/dashboard")
  34 |     await expect(page).toHaveURL("/login")
  35 |   })
  36 | 
  37 |   test("should navigate to signup page", async ({ page }) => {
  38 |     await page.getByRole("link", { name: "Sign up" }).click()
  39 |     await expect(page).toHaveURL("/signup")
  40 |     await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible()
  41 |   })
  42 | 
  43 |   test("should create new account successfully", async ({ page }) => {
  44 |     const timestamp = Date.now()
  45 |     await page.goto("/signup")
  46 | 
  47 |     await page.getByPlaceholder("John Doe").fill(`New User ${timestamp}`)
  48 |     await page.getByPlaceholder("name@example.com").fill(`new${timestamp}@test.com`)
  49 |     await page.getByPlaceholder("••••••••").fill("password123")
  50 |     await page.getByRole("button", { name: "Create account" }).click()
  51 | 
  52 |     await expect(page).toHaveURL("/dashboard", { timeout: 15000 })
  53 |   })
  54 | 
  55 |   test("should show error for duplicate email on signup", async ({ page }) => {
  56 |     await page.goto("/signup")
  57 | 
  58 |     await page.getByPlaceholder("John Doe").fill("Duplicate User")
  59 |     await page.getByPlaceholder("name@example.com").fill("test@nextlevel.com")
  60 |     await page.getByPlaceholder("••••••••").fill("password123")
  61 |     await page.getByRole("button", { name: "Create account" }).click()
  62 | 
  63 |     await expect(page.getByText("Email already in use")).toBeVisible({ timeout: 10000 })
  64 |   })
  65 | })
```