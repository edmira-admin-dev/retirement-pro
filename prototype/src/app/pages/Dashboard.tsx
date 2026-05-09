import { useTheme, themeColors } from "../contexts/ThemeContext";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const assetAllocationData = [
    { name: 'Equity', value: 53.15, amount: 683 },
    { name: 'Gold', value: 26.63, amount: 342 },
    { name: 'Bullion', value: 9.62, amount: 124 },
    { name: 'Hybrid', value: 7.27, amount: 94 },
    { name: 'Blue Estate', value: 2.98, amount: 38 },
  ];

  const productAllocationData = [
    { name: 'Direct fund', value: 5.43, amount: 70 },
    { name: 'Stocks-IT', value: 10.16, amount: 131 },
    { name: 'Bonds', value: 10.63, amount: 137 },
    { name: 'Fixed Income', value: 8.99, amount: 116 },
    { name: 'Oil Plus', value: 18.27, amount: 235 },
  ];

  const performanceData = [
    { month: '2020', value: 3.5 },
    { month: '2021', value: 4.2 },
    { month: '2022', value: 3.8 },
    { month: '2023', value: 5.1 },
    { month: '2024', value: 5.7 },
    { month: '2025', value: 6.2 },
  ];

  const mutualFundData = [
    { year: '2023', value: 290 },
    { year: '2024', value: 320 },
    { year: '2025', value: 340 },
    { year: '2026', value: 380 },
    { year: '2027', value: 450 },
  ];

  const CHART_COLORS = [colors.primary, colors.accent, colors.primaryLight, colors.primaryDark, '#94A3B8'];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm mb-1" style={{ color: colors.textMuted }}>You have earned with</p>
              <h1 className="text-4xl font-bold" style={{ color: colors.textPrimary }}>
                1.83Cr
              </h1>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: colors.cardBackgroundAlt }}>
              <span className="text-sm" style={{ color: colors.textSecondary }}>Your total growth of 2023</span>
              <span className="font-bold" style={{ color: colors.success }}>↑ 12.47Cr</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderLeft: `4px solid ${colors.accent}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm" style={{ color: colors.textMuted }}>10 days</p>
                <TrendingUp className="w-4 h-4" style={{ color: colors.accent }} />
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: colors.textPrimary }}>₹0.30Cr</p>
              <p className="text-xs" style={{ color: colors.success }}>₹ 16.65k avg. return</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderLeft: `4px solid ${colors.primaryLight}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm" style={{ color: colors.textMuted }}>Savings goals</p>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: colors.textPrimary }}>₹1.95Cr</p>
              <p className="text-xs" style={{ color: colors.accent }}>₹ 16.65k Target min.</p>
            </div>

            <div 
              className="p-6 rounded-xl shadow-sm text-white"
              style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)` }}
            >
              <p className="text-sm opacity-90 mb-2">Total assets of this month</p>
              <p className="text-3xl font-bold mb-1">11.36Cr</p>
              <p className="text-sm opacity-90">Today</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm" style={{ borderLeft: `4px solid ${colors.warning}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm" style={{ color: colors.textMuted }}>Investment due for this month</p>
              </div>
              <p className="text-2xl font-bold mb-1" style={{ color: colors.textPrimary }}>₹2.3L</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>Update Payment →</p>
            </div>
          </div>
        </div>

        {/* Your total Financial Fitness */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8" style={{ border: `1px solid ${colors.border}` }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              Your total Financial Fitness
            </h2>
            <div className="text-sm" style={{ color: colors.textSecondary }}>All Family Members →</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.backgroundAlt }}>
              <p className="text-sm mb-1" style={{ color: colors.textMuted }}>Your assets moved of the month</p>
              <p className="text-3xl font-bold" style={{ color: colors.primary }}>9.45Cr</p>
              <p className="text-xs mt-2" style={{ color: colors.success }}>↑ 8.76% this</p>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: colors.cardBackgroundAlt }}>
              <p className="text-sm mb-1" style={{ color: colors.textMuted }}>Your assets that are in business</p>
              <p className="text-3xl font-bold" style={{ color: colors.accent }}>1.95Cr</p>
              <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>₹ 16.65k total</p>
            </div>

            <div className="p-4 rounded-lg border-2" style={{ borderColor: colors.border, backgroundColor: colors.cardBackground }}>
              <p className="text-sm mb-1" style={{ color: colors.textMuted }}>Fils year's committed investment</p>
              <p className="text-3xl font-bold" style={{ color: colors.primaryDark }}>17.3L</p>
              <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>78.6k avg/yearly expense</p>
            </div>

            <div className="p-4 rounded-lg border-2" style={{ borderColor: colors.border, backgroundColor: colors.cardBackground }}>
              <p className="text-sm mb-1" style={{ color: colors.textMuted }}>Investment due for this month</p>
              <p className="text-3xl font-bold" style={{ color: colors.warning }}>2.3L</p>
              <p className="text-xs mt-2" style={{ color: colors.textSecondary }}>Update Payment →</p>
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                  Asset allocation
                </h3>
                <p className="text-sm text-gray-600">All portfolio →</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Your total assets is 11.80Cr at this moment. Of these the total tracked asset is ₹1.40Cr and remaining is ₹ operating and taxfree
            </p>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Untracked wealth</p>
                <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>1.29Cr</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fireworks</p>
                <p className="text-xl font-bold" style={{ color: colors.textPrimary }}>58L</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hardwork</p>
                <p className="text-xl font-bold" style={{ color: colors.textPrimary }}>67L</p>
              </div>
            </div>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill={colors.primary}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {assetAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {assetAllocationData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Equity Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <h3 className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                Equity is the performing broad 5.7Cr
              </h3>
              <p className="text-sm" style={{ color: colors.accent }}>
                ↑ 5.30% Expect a positive direction at the start of the next...
              </p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={colors.primary} 
                    strokeWidth={3}
                    dot={{ fill: colors.primary, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
              <p className="text-sm text-gray-600 mb-2">
                There are many ways to bring consistent growth order and you are required to run the
                total of risk of loss if the size of the capital..
              </p>
              <button 
                className="text-sm font-semibold hover:underline"
                style={{ color: colors.primary }}
              >
                Create Action →
              </button>
            </div>
          </div>
        </div>

        {/* Product Allocation and Mutual Fund */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <h3 className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                Product allocation
              </h3>
              <p className="text-sm text-gray-600">All portfolio →</p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Your total assets is 11.80Cr at this moment. Of these the total tracked asset is ₹1.40Cr
            </p>

            <div className="space-y-4">
              {productAllocationData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        width: `${item.value * 5}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">3.42Cr</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <h3 className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                Mutual Fund is the performing product 5.42Cr
              </h3>
              <p className="text-sm" style={{ color: colors.accent }}>
                ↑ 10.63% Consistency in high levels
              </p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mutualFundData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="year" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Bar dataKey="value" fill={colors.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}