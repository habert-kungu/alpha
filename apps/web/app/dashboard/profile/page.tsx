"use client"

import * as React from "react"
import Link from "next/link"

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Profile</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage your account</p>
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-medium text-foreground mb-4 sm:mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="Alex Morgan"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-[oklch(0.21_0_0)] bg-background"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="alex@example.com"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-[oklch(0.21_0_0)] bg-background"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.21_0_0)] bg-background"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Telegram</label>
                <input
                  type="text"
                  placeholder="@username"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[oklch(0.21_0_0)] bg-background"
                />
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border flex justify-end">
              <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)] rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-medium text-foreground mb-4 sm:mb-6">Security</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-secondary/50 rounded-lg">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-foreground">Password</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Changed 30 days ago</div>
                </div>
                <button className="text-xs sm:text-sm text-foreground hover:text-[oklch(0.21_0_0)] font-medium">Change</button>
              </div>
              
              <div className="flex items-center justify-between p-3 sm:p-4 bg-secondary/50 rounded-lg">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-foreground">Two-Factor Auth</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">Add extra security</div>
                </div>
                <button className="text-xs sm:text-sm text-foreground hover:text-[oklch(0.21_0_0)] font-medium">Enable</button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Card className="p-4 sm:p-6 text-center">
            <div className="w-16 sm:w-24 h-16 sm:h-24 mx-auto mb-3 sm:mb-4 bg-[oklch(0.21_0_0)/10] rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-3xl font-bold text-foreground">AM</span>
            </div>
            <div className="text-base sm:text-xl font-semibold text-foreground">Alex Morgan</div>
            <div className="text-xs sm:text-sm text-muted-foreground">alex@example.com</div>
            <div className="mt-3 sm:mt-4 inline-flex items-center px-2 sm:px-3 py-1 bg-[oklch(0.55_0_150)/8] text-[oklch(0.55_0_150)] rounded-full text-xs sm:text-sm font-medium">
              <span className="w-1.5 h-1.5 bg-[oklch(0.55_0_150)] rounded-full mr-1.5 sm:mr-2"></span>
              Verified
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-medium text-foreground mb-3 sm:mb-4">Account Stats</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Member since</span>
                <span className="text-xs sm:text-sm font-medium text-foreground">Jan 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Total deposits</span>
                <span className="text-xs sm:text-sm font-medium text-foreground">$4,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Total returns</span>
                <span className="text-xs sm:text-sm font-medium text-[oklch(0.55_0_150)]">$10,400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Active orders</span>
                <span className="text-xs sm:text-sm font-medium text-foreground">2</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}