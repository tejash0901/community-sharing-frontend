import React, { useEffect, useState, useRef, useCallback } from 'react'
import { getTools } from '../services/toolService'
import Navbar from '../components/Navbar'
import ToolCard from '../components/ToolCard'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Share2, ShieldCheck, Clock, ArrowRight, Zap, Wrench, Users, ChevronDown, Sparkles, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import HeroScene from '../components/HeroScene'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

/* ──── Tilt hook for cards ──── */
function useTilt() {
  const ref = useRef(null)
  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px) scale(1.01)`
  }, [])
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0) scale(1)'
  }, [])
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave }
}

/* ──── Feature Card ──── */
function FeatureCard({ feature, idx }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt()
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: idx * 0.08, duration: 0.5 }}
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="card p-8 group cursor-default will-change-transform"
      style={{ transition: 'transform 0.15s ease-out, border-color 0.3s, background 0.3s' }}
    >
      <div className="flex items-start gap-5">
        <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            background: feature.color === 'cyan' ? 'rgba(var(--color-cyan), 0.08)' : 'rgba(var(--color-purple), 0.08)',
            border: `1px solid ${feature.color === 'cyan' ? 'rgba(var(--color-cyan), 0.15)' : 'rgba(var(--color-purple), 0.15)'}`,
          }}>
          <span style={{ color: feature.color === 'cyan' ? 'rgb(var(--color-cyan))' : 'rgb(var(--color-purple))' }}>
            {feature.icon}
          </span>
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg text-white mb-2">{feature.title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

/* ──── Animated Counter ──── */
function AnimatedStat({ value, label }) {
  const [display, setDisplay] = useState('0')
  const ref = useRef(null)
  const counted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const num = parseInt(value.replace(/[^0-9]/g, ''), 10)
          const suffix = value.replace(/[0-9]/g, '')
          const start = performance.now()
          const animate = (now) => {
            const p = Math.min((now - start) / 1500, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setDisplay(Math.round(eased * num) + suffix)
            if (p < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <div ref={ref} className="text-center">
      <div className="font-display font-bold text-2xl md:text-3xl text-white">{display}</div>
      <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  )
}

/* ──── Mouse glow that follows cursor on hero ──── */
function useMouseGlow() {
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const handleMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])
  return { pos, onMouseMove: handleMove }
}

/* ──────────────────────────────────────── */
/*               HOME PAGE                  */
/* ──────────────────────────────────────── */
function HomePage() {
  const [tools, setTools] = useState([])
  const [error, setError] = useState('')
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -80])
  const { pos, onMouseMove } = useMouseGlow()

  useEffect(() => {
    getTools().then(setTools).catch(() => setError('Login to view full community tools.'))
  }, [])

  const features = [
    { icon: <Share2 strokeWidth={1.5} className="w-6 h-6" />, title: 'Peer-to-Peer', desc: 'Borrow directly from neighbors. Build trust while saving money on tools you rarely use.', color: 'cyan' },
    { icon: <ShieldCheck strokeWidth={1.5} className="w-6 h-6" />, title: 'Verified & Secure', desc: 'Every user is community-verified. Transparent booking keeps your items protected.', color: 'purple' },
    { icon: <Clock strokeWidth={1.5} className="w-6 h-6" />, title: 'Flexible Slots', desc: 'Set precise availability windows. Full control over when and how long items are shared.', color: 'cyan' },
    { icon: <Zap strokeWidth={1.5} className="w-6 h-6" />, title: 'Instant Flow', desc: 'Real-time approvals and notifications. No waiting around — requests resolved in seconds.', color: 'purple' },
  ]

  const stats = [
    { value: '2k+', label: 'Active Users' },
    { value: '850+', label: 'Tools Shared' },
    { value: '15+', label: 'Communities' },
    { value: '98%', label: 'Satisfaction' },
  ]

  return (
    <div className="bg-[#060608] min-h-screen overflow-hidden text-slate-200 grain">
      <Navbar />

      {/* ====== HERO ====== */}
      <section
        className="relative min-h-screen flex items-center justify-center pt-20"
        onMouseMove={onMouseMove}
      >
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Soft gradient orbs */}
          <div className="absolute top-[15%] left-[10%] w-[600px] h-[600px] rounded-full opacity-[0.06] animate-hero-glow-1"
            style={{ background: 'radial-gradient(circle, rgb(var(--color-cyan)), transparent 70%)' }} />
          <div className="absolute bottom-[5%] right-[5%] w-[500px] h-[500px] rounded-full opacity-[0.05] animate-hero-glow-2"
            style={{ background: 'radial-gradient(circle, rgb(var(--color-purple)), transparent 70%)' }} />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, rgb(var(--color-cyan)), transparent 60%)' }} />

          {/* Dot grid with radial fade */}
          <div className="absolute inset-0 bg-dots mask-radial opacity-30" />

          {/* 3D Scene */}
          <HeroScene />

          {/* Mouse-following spotlight */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.04] pointer-events-none transition-all duration-700 ease-out"
            style={{
              background: 'radial-gradient(circle, rgb(var(--color-cyan)), transparent 70%)',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Hero content */}
        <motion.div
          className="relative z-10 container mx-auto px-6 max-w-5xl"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="text-center">
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-widest uppercase"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">Now live in your neighborhood</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} custom={1}
              className="font-display font-extrabold text-5xl sm:text-6xl md:text-[5.5rem] leading-[0.95] tracking-tight mb-8">
              <span className="text-white">Share tools.</span>
              <br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--color-cyan)), rgb(var(--color-purple)))' }}>
                Build together.
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeUp} custom={2}
              className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed font-light">
              Your community toolbox. Borrow what you need, lend what you don't &mdash; and save money while strengthening your neighborhood.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-base flex items-center gap-2 group">
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#explore" className="btn-secondary text-base flex items-center gap-2">
                Browse Tools
                <ChevronDown className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Stats bar */}
            <motion.div variants={fadeUp} custom={4}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto p-6 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {stats.map((stat, i) => (
                <AnimatedStat key={i} value={stat.value} label={stat.label} />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* ====== FEATURES ====== */}
      <section className="py-32 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--color-cyan), 0.25), transparent)' }} />

        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3 font-medium">Why CommunityShare</p>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white leading-tight max-w-lg">
              Everything you need to share smarter
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} idx={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-24 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--color-purple), 0.2), transparent)' }} />

        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3 font-medium">How it works</p>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white">Three simple steps</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { num: '01', icon: <Users strokeWidth={1.5} className="w-5 h-5" />, title: 'Join your community', desc: 'Sign up and connect with verified neighbors in your area.' },
              { num: '02', icon: <Wrench strokeWidth={1.5} className="w-5 h-5" />, title: 'List or browse tools', desc: 'Share your unused items or find exactly what you need nearby.' },
              { num: '03', icon: <ArrowRight strokeWidth={1.5} className="w-5 h-5" />, title: 'Book & build', desc: 'Reserve with one click, pick up locally, and get your project done.' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: idx * 0.12, duration: 0.5 }}
                className="relative text-center group"
              >
                <div className="font-display font-bold text-6xl md:text-7xl text-transparent bg-clip-text mb-6 transition-all duration-500 group-hover:scale-110"
                  style={{ backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' }}>
                  {step.num}
                </div>
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(var(--color-cyan),0.15)]"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-slate-300">{step.icon}</span>
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-14 -right-6 w-12 h-px"
                    style={{ background: 'linear-gradient(90deg, rgba(var(--color-cyan), 0.15), rgba(var(--color-purple), 0.15))' }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== EXPLORE TOOLS ====== */}
      <section id="explore" className="py-32 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(var(--color-cyan), 0.2), transparent)' }} />

        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3 font-medium">Explore</p>
              <h2 className="font-display font-bold text-3xl md:text-5xl text-white">Community Tools</h2>
              <p className="text-slate-500 mt-3">Items listed by people around you.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/login" className="btn-secondary text-sm inline-flex items-center gap-2">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card p-10 text-center"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(var(--color-cyan), 0.06)', border: '1px solid rgba(var(--color-cyan), 0.12)' }}>
                <ShieldCheck strokeWidth={1.5} className="w-7 h-7" style={{ color: 'rgb(var(--color-cyan))' }} />
              </div>
              <h3 className="font-display font-semibold text-xl text-white mb-2">{error}</h3>
              <p className="text-slate-500 mb-8 text-sm">Join your local community to start renting and sharing tools.</p>
              <Link to="/login" className="btn-primary text-sm inline-flex items-center gap-2">
                <span>Sign in to continue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {!error && tools.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {tools.map((tool, idx) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-32 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, rgb(var(--color-purple)), transparent 60%)' }} />
        </div>
        <div className="container relative z-10 mx-auto px-6 text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white mb-6 leading-tight">
              Ready to share<br />with your neighbors?
            </h2>
            <p className="text-slate-400 mb-10 text-lg">
              Join a growing network of communities who share resources, save money, and build real connections.
            </p>
            <Link to="/register" className="btn-primary text-base inline-flex items-center gap-2 group">
              <span>Create free account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-white/[0.04] py-10 relative z-10">
        <div className="container mx-auto px-6 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display font-semibold text-sm text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--color-cyan)), rgb(var(--color-purple)))' }}>
            CommunityShare
          </p>
          <p className="text-xs text-slate-600">&copy; 2026 CommunityShare. Built for neighborhoods.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
