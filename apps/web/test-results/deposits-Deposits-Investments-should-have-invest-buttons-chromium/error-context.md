# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: deposits.spec.ts >> Deposits & Investments >> should have invest buttons
- Location: tests/deposits.spec.ts:18:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /Submit via Telegram/i }).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('button', { name: /Submit via Telegram/i }).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]: Buy Crypto
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
        - link "Buy Crypto" [active] [ref=e34] [cursor=pointer]:
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
        - generic [ref=e98]: Buy Crypto
        - button [ref=e101] [cursor=pointer]:
          - img [ref=e102]
      - main [ref=e105]:
        - generic [ref=e106]:
          - generic [ref=e107]:
            - generic [ref=e108]:
              - heading "Buy Crypto" [level=1] [ref=e109]
              - paragraph [ref=e110]: Stake to earn guaranteed returns
            - link "← Back to Dashboard" [ref=e111] [cursor=pointer]:
              - /url: /dashboard
          - generic [ref=e112]:
            - button "24H Pool 24 hours 6.4x ROI" [ref=e113] [cursor=pointer]:
              - generic [ref=e115]:
                - generic [ref=e116]: 24H Pool
                - generic [ref=e117]: 24 hours
              - generic [ref=e118]: 6.4x ROI
            - button "Popular Weekly Pool 7 days 8x ROI" [ref=e119] [cursor=pointer]:
              - generic [ref=e120]: Popular
              - generic [ref=e122]:
                - generic [ref=e123]: Weekly Pool
                - generic [ref=e124]: 7 days
              - generic [ref=e125]: 8x ROI
          - generic [ref=e126]:
            - heading "Make a Deposit" [level=2] [ref=e127]
            - generic [ref=e128]:
              - generic [ref=e129]:
                - generic [ref=e130]: Deposit Address (Binance)
                - generic [ref=e132]:
                  - code [ref=e133]: TP3HUdgXCsVBwnRARKEouqYo9USdZTUcbg
                  - button "Copy" [ref=e134] [cursor=pointer]:
                    - img [ref=e135]
                    - text: Copy
              - paragraph [ref=e139]: "Important: Send exact amount. After sending, fill details below and submit."
              - generic [ref=e140]:
                - generic [ref=e141]:
                  - generic [ref=e142]: Amount (USD)
                  - spinbutton [ref=e143]
                - generic [ref=e144]:
                  - generic [ref=e145]: Network
                  - generic [ref=e146]: USDT (TRC20)
              - generic [ref=e147]:
                - generic [ref=e148]: Transaction Hash
                - textbox "Paste TX hash after sending" [ref=e149]
              - generic [ref=e150]:
                - generic [ref=e151]: Notes (optional)
                - textbox "Message for admin..." [ref=e152]
              - button "Submit Investment" [disabled] [ref=e153]
          - generic [ref=e154]:
            - heading "How it works" [level=3] [ref=e155]
            - generic [ref=e156]:
              - generic [ref=e157]:
                - generic [ref=e158]: "1"
                - generic [ref=e159]:
                  - generic [ref=e160]: Select Plan
                  - generic [ref=e161]: 24H or Weekly pool
              - generic [ref=e162]:
                - generic [ref=e163]: "2"
                - generic [ref=e164]:
                  - generic [ref=e165]: Send Crypto
                  - generic [ref=e166]: Transfer USDT to wallet
              - generic [ref=e167]:
                - generic [ref=e168]: "3"
                - generic [ref=e169]:
                  - generic [ref=e170]: Get Confirmed
                  - generic [ref=e171]: Admin verifies & updates balance
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
> 21 |     await expect(page.getByRole("button", { name: /Submit via Telegram/i }).first()).toBeVisible({ timeout: 10000 })
     |                                                                                      ^ Error: expect(locator).toBeVisible() failed
  22 |   })
  23 | 
  24 |   test("should display transactions page", async ({ page }) => {
  25 |     await page.getByRole("navigation").getByRole("link", { name: "Transactions" }).click()
  26 |     await expect(page).toHaveURL("/dashboard/transactions")
  27 |     await expect(page.getByRole("main").getByRole("heading", { name: "Transactions" })).toBeVisible()
  28 |   })
  29 | 
  30 |   test("should filter transactions by type", async ({ page }) => {
  31 |     await page.getByRole("navigation").getByRole("link", { name: "Transactions" }).click()
  32 |     await expect(page).toHaveURL("/dashboard/transactions")
  33 |     await expect(page.getByRole("button", { name: /all/i })).toBeVisible()
  34 |   })
  35 | })
```