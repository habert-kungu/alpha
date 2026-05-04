import { test, expect } from "@playwright/test"

test.describe("Admin Panel", () => {
  test("should redirect regular user from admin panel", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("name@example.com").fill("test@nextlevel.com")
    await page.getByPlaceholder("••••••••").fill("user123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 })

    await page.goto("/admin")
    await expect(page).toHaveURL("/dashboard")
  })

  test("admin should access admin panel", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("name@example.com").fill("admin@nextlevel.com")
    await page.getByPlaceholder("••••••••").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page).toHaveURL("/admin", { timeout: 10000 })
  })

  test("admin should see dashboard stats", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("name@example.com").fill("admin@nextlevel.com")
    await page.getByPlaceholder("••••••••").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL("/admin", { timeout: 10000 })

    await expect(page.getByText("Total Users")).toBeVisible()
    await expect(page.getByText("Active Investments")).toBeVisible()
  })

  test("admin should navigate to deposits page", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("name@example.com").fill("admin@nextlevel.com")
    await page.getByPlaceholder("••••••••").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL("/admin", { timeout: 10000 })

    await page.getByRole("navigation").getByRole("link", { name: "Deposits", exact: true }).click()
    await expect(page).toHaveURL("/admin/deposits")
    await expect(page.getByRole("main").getByRole("heading", { name: "Deposits" })).toBeVisible()
  })

  test("admin should navigate to users page", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("name@example.com").fill("admin@nextlevel.com")
    await page.getByPlaceholder("••••••••").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL("/admin", { timeout: 10000 })

    await page.getByRole("navigation").getByRole("link", { name: "Users", exact: true }).click()
    await expect(page).toHaveURL("/admin/users")
    await expect(page.getByRole("main").getByRole("heading", { name: "Users" })).toBeVisible()
  })

  test("admin should navigate to investments page", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("name@example.com").fill("admin@nextlevel.com")
    await page.getByPlaceholder("••••••••").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL("/admin", { timeout: 10000 })

    await page.getByRole("navigation").getByRole("link", { name: "Investments", exact: true }).click()
    await expect(page).toHaveURL("/admin/investments")
    await expect(page.getByRole("main").getByRole("heading", { name: "Investments" })).toBeVisible()
  })

  test("admin should navigate to transactions page", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("name@example.com").fill("admin@nextlevel.com")
    await page.getByPlaceholder("••••••••").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL("/admin", { timeout: 10000 })

    await page.getByRole("navigation").getByRole("link", { name: "Transactions", exact: true }).click()
    await expect(page).toHaveURL("/admin/transactions")
    await expect(page.getByRole("main").getByRole("heading", { name: "Transactions" })).toBeVisible()
  })

  test("admin should be able to go back to user dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("name@example.com").fill("admin@nextlevel.com")
    await page.getByPlaceholder("••••••••").fill("admin123")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL("/admin", { timeout: 10000 })

    await page.getByRole("navigation").getByRole("link", { name: "Back to User" }).click()
    await expect(page).toHaveURL("/dashboard")
  })
})