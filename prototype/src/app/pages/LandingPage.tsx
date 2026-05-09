import { Link } from "react-router";
import { useTheme, themeColors } from "../contexts/ThemeContext";
import { TrendingUp, Shield, Target, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function LandingPage() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const features = [
    {
      icon: TrendingUp,
      title: "Smart Portfolio Tracking",
      description: "Track all your investments across EPF, NPS, PPF, and equity in one place",
    },
    {
      icon: Shield,
      title: "Financial Health Score",
      description: "Get personalized insights based on 15+ financial parameters",
    },
    {
      icon: Target,
      title: "FIRE Calculator",
      description: "Calculate your retirement corpus with India-specific withdrawal rates",
    },
    {
      icon: Sparkles,
      title: "Gamified Experience",
      description: "Stay motivated with achievements, streaks, and progress tracking",
    },
  ];

  const benefits = [
    "Real-time portfolio valuation",
    "Tax optimization strategies",
    "Inflation-adjusted projections",
    "Emergency fund calculator",
    "Investment recommendations",
    "Multi-asset allocation",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: colors.background }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-bold mb-6" style={{ color: colors.textPrimary }}>
                Your Journey to
                <br />
                <span style={{ color: colors.primary }}>Financial Freedom</span>
              </h1>
              <p className="text-xl mb-8" style={{ color: colors.textSecondary }}>
                The ultimate retirement planning platform built for India's FIRE movement.
                Track, plan, and achieve your financial independence goals.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="px-8 py-3 rounded-lg text-white font-semibold flex items-center space-x-2 hover:opacity-90 transition-opacity shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)` }}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/financial-planning"
                  className="px-8 py-3 rounded-lg font-semibold border-2 hover:bg-gray-50 transition-colors"
                  style={{ 
                    borderColor: colors.primary,
                    color: colors.primary 
                  }}
                >
                  Calculate FIRE Number
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div 
                className="rounded-2xl p-8 shadow-2xl"
                style={{ backgroundColor: colors.cardBackground }}
              >
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Your total net worth</p>
                  <h2 className="text-4xl font-bold" style={{ color: colors.primary }}>
                    ₹1.83Cr
                  </h2>
                  <p className="text-sm mt-2" style={{ color: colors.accent }}>
                    ↑ 12.47% Current growth
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                    <p className="text-xs text-gray-600 mb-1">Goal Progress</p>
                    <p className="text-2xl font-bold" style={{ color: colors.primary }}>68%</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                    <p className="text-xs text-gray-600 mb-1">Health Score</p>
                    <p className="text-2xl font-bold" style={{ color: colors.primary }}>8.5/10</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              Everything You Need for FIRE
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive tools designed for Indian professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl border-2 border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: colors.background }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: colors.primary }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: colors.background }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6" style={{ color: colors.textPrimary }}>
                Built for the Indian FIRE Community
              </h2>
              <p className="text-lg mb-8 text-gray-600">
                Unlike generic calculators, we understand India's unique financial landscape
                including EPF, NPS, PPF, and the 2026 tax regulations.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-xl bg-white shadow-lg"
              >
                <p className="text-sm text-gray-600 mb-2">Current Savings</p>
                <p className="text-3xl font-bold" style={{ color: colors.primary }}>₹9.45Cr</p>
                <p className="text-xs mt-2" style={{ color: colors.accent }}>↑ 8.76% this month</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="p-6 rounded-xl bg-white shadow-lg"
              >
                <p className="text-sm text-gray-600 mb-2">FIRE Target</p>
                <p className="text-3xl font-bold" style={{ color: colors.primary }}>₹17.3L</p>
                <p className="text-xs mt-2 text-gray-600">Yearly goal</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-6 rounded-xl bg-white shadow-lg col-span-2"
              >
                <p className="text-sm text-gray-600 mb-2">Total Assets</p>
                <p className="text-3xl font-bold" style={{ color: colors.primary }}>₹1.95Cr</p>
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: colors.primary,
                      width: '68%'
                    }}
                  />
                </div>
                <p className="text-xs mt-2 text-gray-600">68% of goal achieved</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: colors.textPrimary }}>
            Start Your FIRE Journey Today
          </h2>
          <p className="text-xl mb-8 text-gray-600">
            Join thousands of Indians taking control of their financial future
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg text-white font-semibold text-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.primary }}
          >
            <span>Open Your Dashboard</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}