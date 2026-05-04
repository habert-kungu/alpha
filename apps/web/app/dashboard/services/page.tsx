"use client"

import * as React from "react"
import Link from "next/link"

const SERVICES = [
  {
    name: "Live Trading Sessions",
    description: "Trade live alongside our senior analyst in a private 60-minute session tailored to your portfolio.",
    price: "$1,000",
    period: "per session",
    features: ["60-minute private video session", "Live market analysis", "Real-time trade walkthrough", "Session recording"],
    popular: false,
  },
  {
    name: "Crypto Mentorship",
    description: "A structured program to take you from beginner to confident crypto trader with weekly check-ins.",
    price: "$500",
    period: "per month",
    features: ["Personalised trading roadmap", "Weekly 1-on-1 check-in", "Private trading playbook", "Technical analysis", "Portfolio review"],
    popular: true,
  },
  {
    name: "VIP Signals",
    description: "High-probability trade signals delivered directly to your Telegram with precise entry and exit levels.",
    price: "$350",
    period: "per month",
    features: ["5-10 premium signals/week", "Entry, TP1, TP2 & stop-loss", "Monday briefing", "VIP-only group"],
    popular: false,
  },
]

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export default function ServicesPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Services</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Premium offerings to boost your trading</p>
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {SERVICES.map((service, i) => (
          <Card 
            key={i} 
            className={`p-4 sm:p-5 lg:p-6 flex flex-col ${service.popular ? 'ring-1 ring-[oklch(0.21_0_0)] border-[oklch(0.21_0_0)]' : ''}`}
          >
            {service.popular && (
              <div className="text-[10px] sm:text-xs font-medium text-[oklch(1_0_180)] bg-[oklch(0.21_0_0)] inline-block px-2 py-0.5 rounded-full mb-3 w-fit">
                Most Popular
              </div>
            )}
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2">{service.name}</h3>
            <p className="text-[11px] sm:text-sm text-muted-foreground mb-3 sm:mb-4 flex-grow">{service.description}</p>
            
            <div className="mb-4 sm:mb-5">
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{service.price}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground ml-1.5 sm:ml-2">{service.period}</span>
            </div>

            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {service.features.map((feature, j) => (
                <li key={j} className="flex items-start gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[oklch(0.55_0_150)] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <a 
              href="https://t.me/Sir_khanbashiri" 
              target="_blank"
              className={`block text-center py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all mt-auto ${
                service.popular 
                  ? "bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)] hover:opacity-90" 
                  : "bg-secondary text-foreground hover:bg-[oklch(0.21_0_0)/10]"
              }`}
            >
              Contact via Telegram
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}