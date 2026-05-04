"use client"

import * as React from "react"
import Link from "next/link"

const FAQS = [
  {
    q: "How do I start investing?",
    a: "Create an account, choose a plan (24H or Weekly Pool), and contact us via Telegram to initiate your investment."
  },
  {
    q: "What is the minimum investment?",
    a: "The minimum investment is $500 USDT for both pools."
  },
  {
    q: "How are returns calculated?",
    a: "Returns are fixed: 6.4x for 24H pool and 8x for Weekly pool. No trading experience needed."
  },
  {
    q: "When do I receive returns?",
    a: "24H pool returns within 24 hours after cycle completes. Weekly pool within 7 days."
  },
  {
    q: "Is my capital guaranteed?",
    a: "Yes, 100% track record of delivering promised returns. Risk management ensures capital protection."
  },
  {
    q: "How do I withdraw?",
    a: "Go to Withdraw section, enter wallet address, select network, and submit request."
  },
]

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export default function SupportPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Support</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Get help with your account</p>
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-3 sm:space-y-4">
          <Card className="p-4 sm:p-5">
            <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Contact Us</h3>
            
            <a 
              href="https://t.me/Sir_khanbashiri" 
              target="_blank"
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[oklch(0.21_0_0)/8] rounded-xl hover:bg-[oklch(0.21_0_0)/12] transition-colors mb-3 sm:mb-4"
            >
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-[oklch(0.21_0_0)/15] flex items-center justify-center">
                <svg className="w-5 sm:w-6 h-5 sm:h-6 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 6.8-1.23 5.1-4.91 6.5-7.47 6.5-1.4 0-2.6-.8-3.4-1.8l-1.4 1.4c.9.9 2.4 1.5 3.8 1.5 4.3 0 8.6-3.3 9.8-7.3 1.1-3.6.7-5.6-.5-7.8l-1.4 1.4c.8 1.1 1.2 2.5 1.2 3.9z"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Telegram</div>
                <div className="text-xs text-muted-foreground">Chat with us directly</div>
              </div>
            </a>

            <div className="p-3 sm:p-4 bg-secondary rounded-xl">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <svg className="w-5 sm:w-6 h-5 sm:h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Email</div>
                  <div className="text-xs text-muted-foreground">support@nextlevel.com</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Response Time</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Telegram</span>
                <span className="text-xs sm:text-sm font-medium text-[oklch(0.55_0_150)]">~5 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-muted-foreground">Email</span>
                <span className="text-xs sm:text-sm font-medium text-foreground">~24 hours</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-4 sm:p-5">
          <h3 className="text-sm sm:text-base font-medium text-foreground mb-3 sm:mb-4">Frequently Asked Questions</h3>
          
          <div className="space-y-2 sm:space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-medium text-foreground">{faq.q}</span>
                  <svg className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ml-2 ${openIndex === i ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openIndex === i && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}