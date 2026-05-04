# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard >> should display dashboard overview
- Location: tests/dashboard.spec.ts:12:3

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
  3  | test.describe("Dashboard", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/login")
  6  |     await page.getByPlaceholder("name@example.com").fill("test@nextlevel.com")
  7  |     await page.getByPlaceholder("••••••••").fill("user123")
  8  |     await page.getByRole("button", { name: "Sign in" }).click()
  9  |     await expect(page).toHaveURL("/dashboard", { timeout: 10000 })
  10 |   })
  11 | 
  12 |   test("should display dashboard overview", async ({ page }) => {
> 13 |     await expect(page.getByText("Dashboard")).toBeVisible()
     |                                               ^ Error: expect(locator).toBeVisible() failed
  14 |     await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  15 |   })
  16 | 
  17 |   test("should display sidebar navigation", async ({ page }) => {
  18 |     await expect(page.getByRole("navigation").getByRole("link", { name: "Transactions" })).toBeVisible()
  19 |     await expect(page.getByRole("navigation").getByRole("link", { name: "Buy Crypto" })).toBeVisible()
  20 |     await expect(page.getByRole("navigation").getByRole("link", { name: "Withdraw" })).toBeVisible()
  21 |     await expect(page.getByRole("navigation").getByRole("link", { name: "Profile" })).toBeVisible()
  22 |   })
  23 | 
  24 |   test("should navigate to transactions page", async ({ page }) => {
  25 |     await page.getByRole("navigation").getByRole("link", { name: "Transactions" }).click()
  26 |     await expect(page).toHaveURL("/dashboard/transactions")
  27 |     await expect(page.getByRole("main").getByRole("heading", { name: "Transactions" })).toBeVisible()
  28 |   })
  29 | 
  30 |   test("should navigate to investments page", async ({ page }) => {
  31 |     await page.getByRole("navigation").getByRole("link", { name: "Buy Crypto" }).click()
  32 |     await expect(page).toHaveURL("/dashboard/investments")
  33 |     await expect(page.getByRole("main").getByRole("heading", { name: "Buy Crypto" })).toBeVisible()
  34 |   })
  35 | 
  36 |   test("should navigate to withdraw page", async ({ page }) => {
  37 |     await page.getByRole("navigation").getByRole("link", { name: "Withdraw", exact: true }).click()
  38 |     await expect(page).toHaveURL("/dashboard/withdraw")
  39 |     await expect(page.getByRole("heading", { name: "Withdraw", level: 1 })).toBeVisible()
  40 |   })
  41 | 
  42 |   test("should navigate to profile page", async ({ page }) => {
  43 |     await page.getByRole("navigation").getByRole("link", { name: "Profile" }).click()
  44 |     await expect(page).toHaveURL("/dashboard/profile")
  45 |     await expect(page.getByRole("main").getByRole("heading", { name: "Profile" })).toBeVisible()
  46 |   })
  47 | 
  48 |   test("should display user info in sidebar", async ({ page }) => {
  49 |     await expect(page.locator(".text-\\[13px\\]").first()).toBeVisible()
  50 |   })
  51 | })
```