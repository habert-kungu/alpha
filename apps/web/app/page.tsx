"use client"

import * as React from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import Link from "next/link"
import { Badge } from "@workspace/ui/components/badge"
import { CryptoTicker } from "@/components/PriceTicker"
import { 
  RiTelegramLine, 
  RiArrowRightLine,
  RiFlashlightFill,
  RiFireFill,
  RiCheckLine,
  RiSignalWifiLine,
  RiGraduationCapLine,
  RiBarChartLine,
} from "@remixicon/react"

gsap.registerPlugin(ScrollTrigger)

const prices = [
  { symbol: "BTC", price: "43,245", change: "+2.34%", positive: true },
  { symbol: "ETH", price: "2,342", change: "+1.87%", positive: true },
  { symbol: "SOL", price: "108.50", change: "+4.21%", positive: true },
  { symbol: "BNB", price: "312.80", change: "+0.92%", positive: true },
  { symbol: "XRP", price: "0.62", change: "+1.45%", positive: true },
  { symbol: "ADA", price: "0.58", change: "-0.34%", positive: false },
  { symbol: "DOGE", price: "0.12", change: "+3.21%", positive: true },
  { symbol: "AVAX", price: "38.90", change: "+2.11%", positive: true },
]

const plan24h = [
  { deposit: "500", return: "3,200", profit: "2,700" },
  { deposit: "600", return: "3,800", profit: "3,200" },
  { deposit: "700", return: "4,200", profit: "3,500" },
  { deposit: "800", return: "4,800", profit: "4,000" },
  { deposit: "900", return: "5,000", profit: "4,100" },
  { deposit: "1,000", return: "6,000", profit: "5,000" },
]

const planWeekly = [
  { deposit: "2,000", return: "16,000", profit: "14,000" },
  { deposit: "3,000", return: "24,000", profit: "21,000" },
  { deposit: "4,000", return: "32,000", profit: "28,000" },
  { deposit: "5,000", return: "40,000", profit: "35,000" },
  { deposit: "6,000", return: "48,000", profit: "42,000" },
  { deposit: "7,000", return: "56,000", profit: "49,000" },
]

const services = [
  { icon: <RiSignalWifiLine className="w-4 h-4" />, title: "Live Trading", price: "$1,000/session" },
  { icon: <RiGraduationCapLine className="w-4 h-4" />, title: "Mentorship", price: "$500/month", popular: true },
  { icon: <RiBarChartLine className="w-4 h-4" />, title: "VIP Signals", price: "$350/month" },
]

const steps = [
  { number: "01", title: "Join Telegram", desc: "Connect with our team" },
  { number: "02", title: "Choose Plan", desc: "Select your cycle amount" },
  { number: "03", title: "Send Crypto", desc: "Transfer stake to wallet" },
  { number: "04", title: "Get Returns", desc: "Receive guaranteed profit" },
]

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[oklch(1_0_180)]/90 backdrop-blur-md border-b border-[oklch(0.922_0_0)]">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg className="w-10 h-10" viewBox="0 0 44 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M18.4201 9.7905C19.2053 10.2438 19.4743 11.2477 19.021 12.0329L10.8134 26.2488C10.3601 27.034 9.35616 27.3029 8.57104 26.8497C7.78592 26.3964 7.51689 25.3924 7.9702 24.6073L16.1778 10.3913C16.6311 9.60622 17.635 9.33722 18.4201 9.7905ZM27.7561 13.3169C28.5412 13.7702 28.8102 14.7741 28.3569 15.5592L18.5078 32.6184C18.0545 33.4035 17.0506 33.6725 16.2655 33.2192C15.4803 32.7659 15.2113 31.762 15.6646 30.9769L25.5137 13.9177C25.967 13.1326 26.9709 12.8636 27.7561 13.3169ZM36.7357 20.7424C37.2646 19.8265 37.0569 18.7165 36.2717 18.2632C35.4866 17.8099 34.4214 18.185 33.8926 19.1009L24.317 35.6862C23.7882 36.6022 23.9959 37.7122 24.7811 38.1655C25.5662 38.6188 26.6314 38.2437 27.1602 37.3277L36.7357 20.7424Z" fill="oklch(0.145 0 0)"/>
            <path opacity="0.4" fillRule="evenodd" clipRule="evenodd" d="M26.5658 8.82095C27.0191 8.03583 26.7501 7.03188 25.965 6.57859C25.1799 6.1253 24.1759 6.39431 23.7227 7.17943L8.949 32.7682C8.49569 33.5533 8.76471 34.5572 9.54983 35.0105C10.335 35.4638 11.3389 35.1948 11.7922 34.4097L26.5658 8.82095ZM30.3507 21.9609C30.8398 21.1139 30.5998 20.0597 29.8146 19.6064C29.0295 19.1531 27.9966 19.4723 27.5075 20.3194L22.1946 29.5216C21.7056 30.3686 21.9456 31.4227 22.7308 31.876C23.5159 32.3293 24.5488 32.0102 25.0378 31.1631L30.3507 21.9609ZM36.4308 27.8462C37.216 28.2995 37.485 29.3034 37.0317 30.0885L35.3901 32.9317C34.9368 33.7169 33.9329 33.9859 33.1478 33.5326C32.3626 33.0792 32.0936 32.0753 32.547 31.2902L34.1885 28.447C34.6418 27.6619 35.6457 27.3929 36.4308 27.8462ZM11.5007 15.2144C11.9641 14.4118 11.7032 13.3937 10.9181 12.9404C10.133 12.4871 9.1209 12.7703 8.65749 13.5729L6.9794 16.4794C6.516 17.2821 6.77684 18.3002 7.56196 18.7535C8.34708 19.2068 9.35919 18.9236 9.8226 18.121L11.5007 15.2144Z" fill="oklch(0.145 0 0)"/>
          </svg>
          <span className="text-lg font-semibold tracking-tight text-primary">
            Next Level
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#plans" className="text-sm text-[oklch(0.556_0_0)] hover:text-[oklch(0.145_0_0)] transition-colors">Plans</a>
          <a href="#services" className="text-sm text-[oklch(0.556_0_0)] hover:text-[oklch(0.145_0_0)] transition-colors">Services</a>
          <a href="#how-it-works" className="text-sm text-[oklch(0.556_0_0)] hover:text-[oklch(0.145_0_0)] transition-colors">How it Works</a>
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://t.me/Sir_khanbashiri" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-[oklch(0.556_0_0)] border border-[oklch(0.88_0_0)] hover:border-[oklch(0.21_0_0)] hover:text-[oklch(0.145_0_0)] transition-colors">
            <RiTelegramLine className="w-4 h-4" />
            Telegram
          </a>
          <Link href="/login" className="text-sm font-medium text-[oklch(0.556_0_0)] hover:text-[oklch(0.145_0_0)] px-3 py-1.5">Log in</Link>
          <Link href="/signup" className="text-sm font-medium bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)] px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity">Get Started</Link>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const heroRef = React.useRef<HTMLDivElement>(null)
  const globeRef = React.useRef<HTMLDivElement>(null)
  const tickerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!heroRef.current) return
    
    const ctx = gsap.context(() => {
      if (!heroRef.current) return
      const heroTexts = heroRef.current.querySelectorAll('.hero-text')
      gsap.from(heroTexts, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out"
      })
      
      if (globeRef.current) {
        gsap.from(globeRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 1,
          delay: 0.3,
          ease: "power3.out"
        })
      }
      
      if (tickerRef.current) {
        gsap.from(tickerRef.current, {
          x: -100,
          opacity: 0,
          duration: 0.8,
          delay: 0.6,
          ease: "power2.out"
        })
      }
    }, heroRef)
    
    return () => ctx.revert()
  }, [])

  const duplicatedPrices = [...prices, ...prices, ...prices]

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-gradient-to-b from-surface to-canvas">
      {/* Full width hero image */}
      <div ref={globeRef} className="absolute inset-0 pointer-events-none">
        <img 
          src="/hero-gemini.webp" 
          alt="Hero"
          className="w-full h-full object-cover opacity-90"
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              

              <h1 className="hero-text text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6">
                Your Crypto <br />
                <span className="text-white">Always In Profit</span>
              </h1>

              <p className="hero-text text-lg text-white/80 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Join Next Level's proven trading pool. Choose your plan and receive guaranteed fixed returns on your deposit.
              </p>

              <div className="hero-text flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
                <Link href="#plans" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-all hover:scale-105">
                  View Plans
                  <RiArrowRightLine className="w-4 h-4" />
                </Link>
                <a href="https://t.me/Sir_khanbashiri" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm bg-accent text-accent-foreground hover:opacity-90 transition-all">
                  <RiTelegramLine className="w-4 h-4" />
                  Join Telegram
                </a>
              </div>

              {/* Stats */}
              <div className="hero-text grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">6.4x</div>
                  <div className="text-xs text-white/70">24H Returns</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">8x</div>
                  <div className="text-xs text-white/70">Weekly Returns</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-white/70">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PriceTicker() {
  const allPrices = [...prices, ...prices, ...prices, ...prices, ...prices]
  
  return (
    <div className="w-full border-y border-white/10 overflow-hidden bg-black/40 backdrop-blur-sm">
      <div className="flex animate-ticker-fast py-3">
        {allPrices.slice(0, 8).map((price, i) => (
          <div key={i} className="flex items-center gap-2 px-6 whitespace-nowrap border-r border-white/10">
            <span className="text-sm font-bold text-white tracking-tight">{price.symbol}</span>
            <span className="text-sm text-white/80">${price.price}</span>
            <span className={`text-xs font-semibold ${price.positive ? 'text-green-400' : 'text-red-400'}`}>
              {price.change}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ml-1 ${price.positive ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

function PoolStats() {
  const stats = [
    { value: 284750, prefix: "$", suffix: "", label: "Total Pool (USDT)", change: "+12.4%", trend: "Pool growing daily", sparkline: [20,35,28,45,52,48,65,72,68,85,92,88], hero: true },
    { value: 1842, prefix: "", suffix: "", label: "Cycles Completed", change: "+28", trend: "100% paid on time", sparkline: [10,15,12,20,25,22,30,35,40,45,48,52] },
    { value: 2413, prefix: "", suffix: "", label: "Active Stakers", change: "+156", trend: "12 stakers joined", sparkline: [30,35,40,38,45,50,55,52,60,65,70,75] },
    { value: 97400, prefix: "$", suffix: "", label: "Total Paid Out", change: "+$18.2K", trend: "All USDT returns paid", sparkline: [50,45,55,60,58,65,70,75,80,78,85,90] },
    { value: 6.4, prefix: "", suffix: "x", label: "24H Cycle Return", change: "+0.8", trend: "Avg. across 24h", sparkline: [40,42,45,48,50,52,55,58,60,62,65,68] },
    { value: 8, prefix: "", suffix: "x", label: "Weekly Cycle Return", change: "+1.2", trend: "Avg. across weekly", sparkline: [35,40,45,50,55,60,65,70,75,80,85,90] },
  ]

  const [lastUpdated, setLastUpdated] = React.useState("Just now")

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated("Just now")
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const Sparkline = ({ data, positive }: { data: number[]; positive: boolean }) => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const width = 80
    const height = 24
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * height
      return `${x},${y}`
    }).join(" ")

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={positive ? "#84CC16" : "#EF4444"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle cx={width} cy={height - ((data[data.length - 1] ?? 0 - min) / range) * height} r="2" fill={positive ? "#84CC16" : "#EF4444"} />
      </svg>
    )
  }

  return (
    <section className="py-20 bg-canvas relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.5 }} />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shadow-[0_0_8px_#84CC16]" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] font-mono">Live Pool Statistics</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3 tracking-tight">REAL-TIME PERFORMANCE</h2>
          <p className="text-base text-muted-foreground max-w-lg">Our crypto trading pool runs 24/7 across BTC, ETH, SOL, BNB and top altcoin markets.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-gray-200 border border-gray-200 rounded-sm overflow-hidden">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`relative bg-white/80 backdrop-blur-xl p-4 border border-white/10 transition-all hover:bg-white/90 ${stat.hero ? 'col-span-2 lg:col-span-2' : ''}`}
            >
              <div className="absolute top-2 right-2">
                <span className="text-[9px] font-mono text-muted-foreground uppercase">Status: Nominal</span>
              </div>
              
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 font-mono">{stat.label}</div>
              
              <div className="flex items-baseline gap-1 mb-2">
                <Counter value={stat.value} prefix={stat.prefix} />
                {stat.suffix && <span className="text-lg font-bold text-primary font-mono">{stat.suffix}</span>}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-mono">{stat.change}</span>
                <Sparkline data={stat.sparkline} positive={stat.change.startsWith('+')} />
              </div>
              
              <div className="text-[10px] text-muted-foreground mt-3 font-mono">{stat.trend}</div>
              
              <div className="absolute bottom-1 right-1">
                <span className="text-[8px] text-muted-foreground/50 font-mono">Updated: {lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Counter({ value, prefix }: { value: number; prefix: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const hasAnimated = React.useRef(false)
  const [displayValue, setDisplayValue] = React.useState("0")

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          
          const tl = gsap.timeline()
          const isDecimal = !Number.isInteger(value)
          
          tl.fromTo(ref.current, 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
          )
          .to({}, {
            duration: 2,
            onUpdate: function() {
              const progress = this.progress()
              const currentVal = value * progress
              setDisplayValue(isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal).toLocaleString())
            },
            ease: "power2.out"
          })
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-3xl md:text-4xl font-bold text-primary leading-tight scale-0 font-mono">
      {prefix}{displayValue}
    </div>
  )
}

function LiveTelegram() {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
      <a 
        href="https://t.me/Sir_khanbashiri" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-4 bg-primary text-white px-5 py-3 rounded-full shadow-2xl hover:shadow-xl hover:scale-105 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-medium">2,413 traders in the live pool</span>
        </div>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </a>
    </div>
  )
}

function PlanCard({ title, subtitle, roi, plans, cta, popular = false }: { title: string; subtitle: string; roi: string; plans: typeof plan24h; cta: string; popular?: boolean }) {
  const cardRef = React.useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!cardRef.current) return
    
    const card = cardRef.current
    
    gsap.set(card, { transformStyle: "preserve-3d" })
    
    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      const rotateX = (y - centerY) / 20
      const rotateY = (centerX - x) / 20
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.4,
        ease: "power2.out"
      })
    }
    
    const handleLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: "power2.out"
      })
    }
    
    card.addEventListener("mousemove", handleMove)
    card.addEventListener("mouseleave", handleLeave)
    
    return () => {
      card.removeEventListener("mousemove", handleMove)
      card.removeEventListener("mouseleave", handleLeave)
    }
  })

  return (
    <div ref={cardRef} className="relative">
      <div 
        className={`relative bg-white rounded-3xl p-6 md:p-8 transition-all duration-200 ${popular ? 'ring-2 ring-[oklch(0.21_0_0)/0.2] shadow-lg' : 'shadow-md hover:shadow-lg'}`}
      >
        {popular && (
          <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-primary text-white text-xs font-bold px-3 md:px-4 py-1 rounded-full tracking-wide">BEST VALUE</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
              {popular ? (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 14l4-4 4 4 5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              )}
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-primary">{title}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <div className={`self-start sm:self-auto px-3 py-1.5 md:px-5 md:py-2.5 rounded-full ${popular ? 'bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)]' : 'bg-[oklch(0.97_0_180)] text-[oklch(0.145_0_0)]'}`}>
            <span className="text-base md:text-lg font-bold whitespace-nowrap">{roi}</span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="min-w-[280px] md:min-w-0 bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-3 text-xs text-muted-foreground uppercase tracking-wider pb-2 mb-2">
              <span>Deposit</span>
              <span>Return</span>
              <span>Profit</span>
            </div>
            {plans.map((tier, i) => (
              <div key={i} className="grid grid-cols-3 text-sm py-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                <span className="text-muted-foreground">${tier.deposit}</span>
                <span className="text-primary font-semibold">${tier.return}</span>
                <span className="text-green-600 font-medium">+${tier.profit}</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/signup" className={`block w-full text-center py-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] ${popular ? 'bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)] hover:opacity-90' : 'bg-[oklch(0.145_0_0)] text-[oklch(1_0_180)] hover:opacity-90'}`}>
          {cta}
        </Link>
      </div>
    </div>
  )
}

function InvestmentPlans() {
  const sectionRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!sectionRef.current) return
    
    const planCards = sectionRef.current.querySelectorAll('.plan-card-anim')
    
    gsap.fromTo(planCards, 
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse"
        }
      }
    )
  }, [])

  return (
    <section id="plans" ref={sectionRef} className="py-32 bg-canvas relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <div className="max-w-5xl mx-auto px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Investment Plans
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Choose Your Plan</h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">Select a cycle duration and stake amount. Returns are guaranteed.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="plan-card-anim opacity-0">
            <PlanCard 
              title="24-Hour Pool" 
              subtitle="Quick returns in 24h"
              roi="6.4x ROI"
              plans={plan24h}
              cta="Start 24H Cycle"
            />
          </div>
          <div className="plan-card-anim opacity-0">
            <PlanCard 
              title="Weekly Pool" 
              subtitle="Maximum returns in 7 days"
              roi="8x ROI"
              plans={planWeekly}
              cta="Start Weekly Cycle"
              popular={true}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Services() {
  const sectionRef = React.useRef<HTMLDivElement>(null)
  const cardsRef = React.useRef<(HTMLDivElement | null)[]>([])

  const services = [
    {
      badge: "High Demand",
      badgeColor: "bg-orange-100 text-orange-700",
      title: "ONE-ON-ONE LIVE TRADING SESSION",
      desc: "Trade live alongside our senior analyst in a private session tailored to your portfolio and goals. Watch real trades unfold in real time and ask anything.",
      features: ["60-minute private video session", "Live market analysis", "Real-time trade walkthrough", "Session recording", "Q&A on strategy"],
      price: "$1,000",
      per: "Per session - One-time",
      cta: "Book Session",
      popular: false
    },
    {
      badge: "Most Popular",
      badgeColor: "bg-[oklch(0.97_0_180)] text-[oklch(0.21_0_0)]",
      title: "CRYPTO MENTORSHIP PROGRAM",
      desc: "A structured mentorship program to take you from beginner to confident crypto trader. Get a personal roadmap, weekly check-ins, and hands-on guidance.",
      features: ["Personalised trading roadmap", "Weekly 1-on-1 check-in (4/month)", "Private trading playbook", "Technical analysis fundamentals", "Portfolio review and coaching"],
      price: "$500",
      per: "Per month - Ongoing",
      cta: "Enroll Now",
      popular: true
    },
    {
      badge: "Monthly Sub",
      badgeColor: "bg-blue-100 text-blue-700",
      title: "VIP CRYPTO SIGNALS MEMBERSHIP",
      desc: "Get high-probability trade signals delivered directly to your Telegram - with precise entry, take-profit, and stop-loss levels. No guesswork, just actionable calls.",
      features: ["5-10 premium signals per week", "Entry, TP1, TP2 and stop-loss", "Monday market briefing", "VIP-only Telegram group", "Monthly win rate tracker"],
      price: "$350",
      per: "Per month - Cancel anytime",
      cta: "Get Access",
      ctaLink: "Preview on Telegram",
      popular: false
    }
  ]

  React.useEffect(() => {
    if (!sectionRef.current) return
    
    const serviceCards = sectionRef.current.querySelectorAll('.service-card')
    
    gsap.fromTo(serviceCards, 
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse"
        }
      }
    )
  }, [])

  return (
    <section id="services" ref={sectionRef} className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Premium Offerings</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Go beyond the pool. Get direct access to our expert traders through premium one-on-one sessions, mentorship, and real-time signals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, i) => (
            <div 
              key={i} 
              ref={el => { cardsRef.current[i] = el }}
              className={`service-card relative bg-white rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-lg flex flex-col ${service.popular ? 'ring-2 ring-[oklch(0.21_0_0)/0.2]' : ''}`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className={`${service.badgeColor} text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap`}>{service.badge}</span>
              </div>
              
              <h3 className="text-lg font-bold text-primary mb-3 leading-tight">{service.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{service.desc}</p>
              
              <div className="space-y-2 mb-6">
                {service.features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">{service.price}</span>
                <span className="text-xs text-muted-foreground ml-2">{service.per}</span>
              </div>
              
              <a href="https://t.me/Sir_khanbashiri" className={`mt-auto block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] ${service.popular ? 'bg-[oklch(0.21_0_0)] text-[oklch(1_0_180)] hover:opacity-90' : 'bg-[oklch(0.145_0_0)] text-[oklch(1_0_180)] hover:opacity-90'}`}>
                {service.cta}
              </a>
              
              {service.ctaLink && (
                <a href="https://t.me/Sir_khanbashiri" className="block text-center text-xs text-muted-foreground mt-3 hover:text-primary">
                  {service.ctaLink}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const sectionRef = React.useRef<HTMLDivElement>(null)

  const steps = [
    { number: "01", title: "Join Telegram", desc: "Connect with the team" },
    { number: "02", title: "Choose Cycle", desc: "24h or weekly" },
    { number: "03", title: "Send Crypto", desc: "USDT confirmed in 1h" },
    { number: "04", title: "Receive Return", desc: "Full USDT return" }
  ]

  React.useEffect(() => {
    if (!sectionRef.current) return
    
    const tl = sectionRef.current.querySelector('.tl-fill') as HTMLElement
    const rows = sectionRef.current.querySelectorAll('.step-row')
    
    const onScroll = () => {
      if (!tl) return
      
      const section = sectionRef.current
      if (!section) return
      
      const sectionRect = section.getBoundingClientRect()
      const wh = window.innerHeight
      const sectionH = sectionRect.height
      
      const scrolled = wh - sectionRect.top
      const pct = Math.min(100, Math.max(0, (scrolled / sectionH) * 100))
      tl.style.height = pct + '%'
      
      rows.forEach((row, i) => {
        const delay = i * 150
        setTimeout(() => {
          if (row.classList.contains('step-row')) {
            row.classList.add('visible')
          }
        }, Math.max(0, delay - Math.max(0, sectionRect.top - wh * 0.3)))
      })
    }
    
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="how-it-works" ref={sectionRef} className="py-10 sm:py-14 bg-canvas">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-primary bg-gray-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-4">
            How It Works
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">Get Started in Minutes</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Four simple steps to start growing your crypto.</p>
        </div>

        {/* Mobile: Vertical timeline on left */}
        <div className="md:hidden relative pl-8 sm:pl-10">
          <div className="tl-line absolute left-3 sm:left-4 top-0 bottom-0 w-0.5 bg-gray-200 overflow-hidden rounded-full">
            <div className="tl-fill absolute top-0 left-0 w-full h-0 bg-gradient-to-b from-[oklch(0.5_0_0)] to-[oklch(0.55_0_150)]" />
          </div>

          <div className="space-y-6 sm:space-y-8">
            {steps.map((step, i) => (
              <div 
                key={i} 
                className="step-row relative flex items-start gap-3 sm:gap-4 transition-all duration-500 opacity-0 translate-x-4"
              >
                <div className="absolute -left-6 sm:-left-7 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10 -translate-x-1/2">
                  <span className="text-[9px] sm:text-[10px] font-bold text-primary">{step.number}</span>
                </div>
                <div className="pt-0.5">
                  <p className="text-sm sm:text-base font-bold text-primary mb-0.5">{step.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Alternating left/right */}
        <div className="hidden md:block relative" id="tl">
          <div className="tl-line absolute left-1/2 -translate-x-1/2 w-px top-0 bottom-0 bg-gray-200 overflow-hidden">
            <div className="tl-fill absolute top-0 left-0 w-full h-0 bg-gradient-to-b from-[oklch(0.5_0_0)] via-[oklch(0.3_0_0)] to-[oklch(0.55_0_150)]" style={{ transition: 'height 0.1s linear' }} />
          </div>

          <div className="step-row left-content flex items-center relative mb-12">
            <div className="flex-1 pr-8 text-right">
              <div className="content opacity-0 transition-all duration-500 translate-x-[-28px]">
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground block mb-2">01</span>
                <p className="text-xl font-bold text-primary mb-2">Join Telegram</p>
                <p className="text-sm text-muted-foreground">Connect with the team</p>
              </div>
            </div>
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center relative z-10">
                <div className="dot w-2 h-2 rounded-full bg-gray-300" />
              </div>
            </div>
            <div className="flex-1 pl-8" />
          </div>

          <div className="step-row right-content flex items-center relative mb-12">
            <div className="flex-1 pr-8" />
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center relative z-10">
                <div className="dot w-2 h-2 rounded-full bg-gray-300" />
              </div>
            </div>
            <div className="flex-1 pl-8 text-left">
              <div className="content opacity-0 transition-all duration-500 translate-x-[28px]">
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground block mb-2">02</span>
                <p className="text-xl font-bold text-primary mb-2">Choose Your Cycle</p>
                <p className="text-sm text-muted-foreground">Pick 24h or weekly</p>
              </div>
            </div>
          </div>

          <div className="step-row left-content flex items-center relative mb-12">
            <div className="flex-1 pr-8 text-right">
              <div className="content opacity-0 transition-all duration-500 translate-x-[-28px]">
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground block mb-2">03</span>
                <p className="text-xl font-bold text-primary mb-2">Send Your Crypto</p>
                <p className="text-sm text-muted-foreground">USDT confirmed in 1 hour</p>
              </div>
            </div>
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center relative z-10">
                <div className="dot w-2 h-2 rounded-full bg-gray-300" />
              </div>
            </div>
            <div className="flex-1 pl-8" />
          </div>

          <div className="step-row right-content flex items-center relative">
            <div className="flex-1 pr-8" />
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center relative z-10">
                <div className="dot w-2 h-2 rounded-full bg-gray-300" />
              </div>
            </div>
            <div className="flex-1 pl-8 text-left">
              <div className="content opacity-0 transition-all duration-500 translate-x-[28px]">
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground block mb-2">04</span>
                <p className="text-xl font-bold text-primary mb-2">Receive Return</p>
                <p className="text-sm text-muted-foreground">Full return in USDT</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-14 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <a href="https://t.me/Sir_khanbashiri" className="bg-primary text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors">
            Join Telegram
          </a>
          <span className="text-xs sm:text-sm text-muted-foreground">Free to join</span>
        </div>
      </div>
    </section>
  )
}

function Community() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/advanced-traders.webp" 
          alt="Advanced Traders" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 h-full flex flex-col justify-center items-center max-w-4xl mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 text-center">Built for Everyone</h2>
        <p className="text-xl text-white/70 mb-8 text-center">Professional-grade trading infrastructure for all levels</p>
        
        <a href="https://t.me/Sir_khanbashiri" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/90 transition-colors">
          <RiTelegramLine className="w-5 h-5" />
          Join Now
        </a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-6 bg-canvas border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-base font-semibold text-primary">Next Level</span>
          <p className="text-sm text-muted">© 2026 Next Level · All rights reserved</p>
        </div>
        <div className="mt-3 pt-3 border-t border-border text-center">
          <p className="text-xs text-muted">Crypto trading involves risk</p>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-canvas min-h-screen">
        <Hero />
        <PriceTicker />
        <PoolStats />
        <InvestmentPlans />
        <Services />
        <HowItWorks />
        <Community />
      </main>
      <Footer />
      <LiveTelegram />
    </>
  )
}