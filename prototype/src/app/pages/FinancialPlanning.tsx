import { useState } from "react";
import { useTheme, themeColors } from "../contexts/ThemeContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calculator, TrendingUp, Calendar } from "lucide-react";

export default function FinancialPlanning() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const [formData, setFormData] = useState({
    totalInvestment: '12.4',
    investmentIncrement: '10',
    yearsToInvest: '32',
    retirementAge: '64',
  });

  const projectionData = [
    { year: '2021', predicted: 8.5, actual: 7.8, rest: 9.2 },
    { year: '2022', predicted: 9.2, actual: 8.5, rest: 10.1 },
    { year: '2023', predicted: 10.5, actual: 9.8, rest: 11.3 },
    { year: '2024', predicted: 12.8, actual: 11.2, rest: 13.5 },
    { year: '2025', predicted: 14.5, actual: 13.8, rest: 15.2 },
    { year: '2026', predicted: 16.5, actual: 15.5, rest: 17.2 },
  ];

  const planSteps = [
    { label: 'Plan', icon: '💰', description: 'Active goals' },
    { label: 'Family', icon: '👨‍👩‍👧', description: 'Family of 3' },
    { label: 'Savvy', icon: '📈', description: 'Goal saved' },
    { label: 'Active years & Retired years', icon: '⏰', description: '32 - 64' },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div 
            className="p-6 rounded-xl shadow-lg text-white"
            style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)` }}
          >
            <p className="text-sm opacity-90 mb-1">Healthiest to achieve at current setup</p>
            <p className="text-4xl font-bold mb-1">12.4Cr</p>
            <p className="text-sm opacity-90">↑ ₹ 4.4Cr incremented corpus</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderLeft: `4px solid ${colors.accent}` }}>
            <p className="text-sm mb-1" style={{ color: colors.textMuted }}>Your total investments for the last 10 years</p>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>1.83Cr</p>
            <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>Total no. of investing</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderLeft: `4px solid ${colors.success}` }}>
            <p className="text-sm mb-1" style={{ color: colors.textMuted }}>Auto your's reset for this year +- Real value</p>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>16.53L</p>
            <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>For 15 months period</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderLeft: `4px solid ${colors.warning}` }}>
            <p className="text-sm mb-1" style={{ color: colors.textMuted }}>Health systems ongoing of opportunities</p>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>8.61L</p>
            <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>Stay on your path to save!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Naveen Financial Input */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                Naveen financial input
              </h2>
              <Calculator className="w-5 h-5" style={{ color: colors.primary }} />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600">Total investment</label>
                  <span className="text-sm font-semibold" style={{ color: colors.primary }}>
                    + 2.48Cr
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.totalInvestment}
                    onChange={(e) => setFormData({ ...formData, totalInvestment: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none text-lg font-semibold"
                    style={{ borderColor: colors.background }}
                  />
                  <span className="text-lg font-bold" style={{ color: colors.textPrimary }}>Cr</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <button className="flex-1 px-3 py-1 rounded-md text-xs border border-gray-300 hover:bg-gray-50">
                    ⚪ Home loan
                  </button>
                  <button className="flex-1 px-3 py-1 rounded-md text-xs border border-gray-300 hover:bg-gray-50">
                    ⚪ Return compounding ₹ 5.2%
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-2">Plan</label>
                <div className="grid grid-cols-4 gap-2">
                  {planSteps.map((step, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-1"
                        style={{ backgroundColor: colors.background }}
                      >
                        <span className="text-xl">{step.icon}</span>
                      </div>
                      <p className="text-xs text-gray-600">{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-2">Family</label>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 rounded-md text-sm border border-gray-300 hover:bg-gray-50">
                    ⚪ Personal
                  </button>
                  <button className="px-3 py-1 rounded-md text-sm border border-gray-300 hover:bg-gray-50">
                    ⚪ Married
                  </button>
                  <button className="px-3 py-1 rounded-md text-sm border border-gray-300 hover:bg-gray-50">
                    ⚪ Family of 3
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-2">Yearly invesment target</label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value="10"
                    className="w-full"
                    style={{ accentColor: colors.primary }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹6.61L</span>
                    <span>₹16.53L</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-2">Yearly invesment increment</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.investmentIncrement}
                    onChange={(e) => setFormData({ ...formData, investmentIncrement: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none"
                    style={{ borderColor: colors.background }}
                  />
                  <span className="font-semibold" style={{ color: colors.textPrimary }}>%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Active years & Retired years</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={formData.yearsToInvest}
                      onChange={(e) => setFormData({ ...formData, yearsToInvest: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none text-center"
                      style={{ borderColor: colors.background }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-2">&nbsp;</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={formData.retirementAge}
                      onChange={(e) => setFormData({ ...formData, retirementAge: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none text-center"
                      style={{ borderColor: colors.background }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Yearly invesment target & Projection Chart */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                    Difference corpus of 2024 with your similar 
                  </h2>
                  <p className="text-sm" style={{ color: colors.accent }}>
                    ↑ .65% Do not you-not without one 65% of your goal each
                  </p>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="year" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke={colors.primary} 
                      strokeWidth={3}
                      name="Predicted income"
                      dot={{ fill: colors.primary, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke={colors.accent} 
                      strokeWidth={3}
                      name="Actual income"
                      dot={{ fill: colors.accent, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rest" 
                      stroke={colors.primaryLight} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Rest of the graph"
                      dot={{ fill: colors.primaryLight, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: colors.background }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">Time savings</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    28 months
                  </p>
                </div>
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: colors.background }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-600">Accumulated surplus</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    ₹ 2.3L
                  </p>
                </div>
                <div 
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: colors.background }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
                    <span className="text-sm text-gray-600">Rest of the graph</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    ↑ Hopeful
                  </p>
                </div>
              </div>
            </div>

            {/* Tooltips Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="grid md:grid-cols-2 gap-6">
                <div 
                  className="p-4 rounded-lg border-2"
                  style={{ borderColor: colors.background }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: colors.background }}
                      >
                        <TrendingUp className="w-4 h-4" style={{ color: colors.primary }} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Active plan & Retired years</p>
                        <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                          Committed invest should be achieved
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Buy gold theme any additional and accumulation over ASAP in the
                    sense if one year ahead it must
                  </p>
                </div>

                <div 
                  className="p-4 rounded-lg border-2"
                  style={{ borderColor: colors.background }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: colors.background }}
                      >
                        <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Buy gold theme</p>
                        <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                          Any additional and accumulation 10%
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Rent the house the move if must achieved and one year ahead
                    it must all 100 for 100 be saved
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}