import { Link } from 'react-router-dom'
import { TrendingUp, Shield, Target, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

const features = [
  {
    icon: TrendingUp,
    title: 'Smart Portfolio Tracking',
    description: 'Track all your investments across EPF, NPS, PPF, and equity in one place',
  },
  {
    icon: Shield,
    title: 'Financial Health Score',
    description: 'Get personalized insights based on 15+ financial parameters',
  },
  {
    icon: Target,
    title: 'FIRE Calculator',
    description: 'Calculate your retirement corpus with India-specific withdrawal rates',
  },
  {
    icon: Sparkles,
    title: 'Gamified Experience',
    description: 'Stay motivated with achievements, streaks, and progress tracking',
  },
]

const benefits = [
  'Real-time portfolio valuation',
  'Tax optimization strategies',
  'Inflation-adjusted projections',
  'Emergency fund calculator',
  'Investment recommendations',
  'Multi-asset allocation',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-theme-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-theme-primary flex items-center justify-center">
              <span className="font-bold text-white text-sm">DF</span>
            </div>
            <span className="font-bold text-xl text-theme-text">Desi FIRE</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-theme-primary hover:text-theme-primary-dark transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-theme-primary text-white hover:bg-theme-primary-dark transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-theme-bg">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-theme-text leading-tight">
                Your Journey to
                <br />
                <span className="text-theme-primary">Financial Freedom</span>
              </h1>
              <p className="text-lg sm:text-xl mb-8 text-theme-text-sec">
                The ultimate retirement planning platform built for India's FIRE movement.
                Track, plan, and achieve your financial independence goals.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-theme-primary text-white font-semibold hover:bg-theme-primary-dark transition-colors shadow-lg"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-theme-primary text-theme-primary font-semibold hover:bg-theme-bg-alt transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Mock dashboard card */}
            <div className="bg-theme-card rounded-2xl p-8 shadow-2xl border border-theme-border">
              <div className="mb-6">
                <p className="text-sm text-theme-text-sec mb-1">Your total net worth</p>
                <h2 className="text-4xl font-bold text-theme-primary">₹1.83 Cr</h2>
                <p className="text-sm mt-2 text-theme-success">↑ 12.47% growth this year</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-theme-bg-alt">
                  <p className="text-xs text-theme-text-sec mb-1">Goal Progress</p>
                  <p className="text-2xl font-bold text-theme-primary">68%</p>
                </div>
                <div className="p-4 rounded-lg bg-theme-bg-alt">
                  <p className="text-xs text-theme-text-sec mb-1">Health Score</p>
                  <p className="text-2xl font-bold text-theme-primary">8.5/10</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-theme-text">
              Everything You Need for FIRE
            </h2>
            <p className="text-lg text-theme-text-sec">
              Comprehensive tools designed for Indian professionals
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border-2 border-theme-border hover:shadow-lg hover:border-theme-primary transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-theme-bg-alt flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-theme-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-theme-text">{feature.title}</h3>
                <p className="text-sm text-theme-text-sec">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-theme-bg">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-theme-text">
                Built for the Indian FIRE Community
              </h2>
              <p className="text-lg mb-8 text-theme-text-sec">
                Unlike generic calculators, we understand India's unique financial landscape
                including EPF, NPS, PPF, and the latest tax regulations.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-theme-primary" />
                    <span className="text-sm text-theme-text-sec">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-xl bg-white shadow-lg border border-theme-border">
                <p className="text-sm text-theme-text-sec mb-2">Current Savings</p>
                <p className="text-3xl font-bold text-theme-primary">₹9.45 Cr</p>
                <p className="text-xs mt-2 text-theme-success">↑ 8.76% this month</p>
              </div>
              <div className="p-6 rounded-xl bg-white shadow-lg border border-theme-border">
                <p className="text-sm text-theme-text-sec mb-2">FIRE Target</p>
                <p className="text-3xl font-bold text-theme-primary">₹17.3 L</p>
                <p className="text-xs mt-2 text-theme-text-sec">Yearly goal</p>
              </div>
              <div className="p-6 rounded-xl bg-white shadow-lg border border-theme-border col-span-2">
                <p className="text-sm text-theme-text-sec mb-2">Total Assets</p>
                <p className="text-3xl font-bold text-theme-primary">₹1.95 Cr</p>
                <div className="mt-3 h-2 bg-theme-bg-alt rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-theme-primary" style={{ width: '68%' }} />
                </div>
                <p className="text-xs mt-2 text-theme-text-sec">68% of goal achieved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-theme-text">
            Start Your FIRE Journey Today
          </h2>
          <p className="text-lg mb-8 text-theme-text-sec">
            Join thousands of Indians taking control of their financial future
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-theme-primary text-white font-semibold text-lg hover:bg-theme-primary-dark transition-colors shadow-lg"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border-2 border-theme-primary text-theme-primary font-semibold text-lg hover:bg-theme-bg-alt transition-colors"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-theme-border bg-theme-bg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-theme-primary flex items-center justify-center">
              <span className="font-bold text-white text-xs">DF</span>
            </div>
            <span className="font-semibold text-theme-text">Desi FIRE</span>
          </div>
          <p className="text-sm text-theme-text-sec">
            Built for India's FIRE movement. All calculations are for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  )
}
