import { useTheme, themeColors } from "../contexts/ThemeContext";
import { TrendingUp, Gift, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function InvestmentAdvise() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const portfolioData = [
    { name: 'Equity 30%', value: 30 },
    { name: 'Debt 60%', value: 60 },
    { name: 'Gold 10%', value: 10 },
  ];

  const CHART_COLORS = [colors.primary, colors.accent, colors.primaryLight];

  const recommendedFunds = [
    {
      name: 'E1 Large & Mid Cap',
      category: 'MODERATE RISK · FLEXI-CAP SCHEME',
      riskLevel: 'Moderately High',
      returns: '42%',
      investment: '4,03,900',
      allocation: 42,
      color: colors.primary,
    },
    {
      name: 'T2 Techno fund',
      category: 'DIRECT STOCKS',
      riskLevel: 'High',
      returns: '20%',
      investment: '2,09,000',
      allocation: 20,
      color: colors.warning,
    },
    {
      name: 'E3 Small & Mid Cap',
      category: 'MODERATE RISK · FLEXI-CAP SCHEME',
      riskLevel: 'Moderately High',
      returns: '14%',
      investment: '1,47,200',
      allocation: 14,
      color: colors.accent,
    },
    {
      name: 'S1 Shadow basket',
      category: 'NATURAL SCHEME',
      riskLevel: 'Moderate',
      returns: '10%',
      investment: '1,04,900',
      allocation: 10,
      color: colors.success,
    },
    {
      name: 'S2 Shadow basket',
      category: 'INDEX INCOME',
      riskLevel: 'Moderate',
      returns: '10%',
      investment: '1,04,900',
      allocation: 10,
      color: colors.primaryLight,
    },
  ];

  const advisorSuggestions = [
    {
      name: 'Model portfolio',
      risk: 'Best allocations',
      description: 'Best performing based allocation suggested',
    },
    {
      name: 'Recent allocative',
      risk: 'Intelligent reap',
      description: 'Best performing based allocation suggested',
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Total investment</p>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>16.53L</p>
            <p className="text-xs mt-2" style={{ color: colors.accent }}>↑ 6% yearly</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Expected rate of return on investment</p>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>10.4%</p>
            <p className="text-xs mt-2 text-gray-600">This is moderate</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Total asset allocation</p>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>1.83Cr</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Your worth in 10.36L is commented with 10% increase per</p>
            <p className="text-3xl font-bold" style={{ color: colors.textPrimary }}>12.47Cr</p>
            <p className="text-xs mt-2" style={{ color: colors.accent }}>Current valued 2023</p>
          </div>
        </div>

        {/* Favourite's Advise */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-6" style={{ color: colors.textPrimary }}>
            Favourite's Advise
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {advisorSuggestions.map((suggestion, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <Gift className="w-6 h-6" style={{ color: colors.primary }} />
                  <button 
                    className="px-4 py-1 rounded-md text-white text-sm font-semibold"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Confirm Advise
                  </button>
                </div>
                <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  {suggestion.name}
                </h3>
                <p className="text-xs mb-2" style={{ color: colors.accent }}>
                  {suggestion.risk}
                </p>
                <p className="text-sm text-gray-600">
                  {suggestion.description}
                </p>
              </div>
            ))}

            <div 
              className="rounded-xl p-6 text-white flex flex-col justify-between"
              style={{ backgroundColor: colors.primary }}
            >
              <div>
                <h3 className="font-semibold mb-2">Recommended Model portfolio</h3>
                <p className="text-sm opacity-90 mb-4">
                  Based on your level we created a perfect plan with the investment and financial
                  advisor and professional way
                </p>
              </div>
              <button className="bg-white px-4 py-2 rounded-lg font-semibold text-sm self-start" style={{ color: colors.primary }}>
                Confirm Advise
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommended Funds */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6" style={{ color: colors.textPrimary }}>
              Recommended Model portfolio
            </h2>

            <div className="space-y-4">
              {recommendedFunds.map((fund, index) => (
                <div 
                  key={index} 
                  className="border-2 rounded-xl p-4 hover:shadow-md transition-shadow"
                  style={{ borderColor: colors.background }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>
                        {fund.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{fund.category}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colors.primary }}
                          />
                          <span className="text-sm text-gray-600">Risk level</span>
                          <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                            {fund.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold mb-1" style={{ color: colors.primary }}>
                        {fund.returns}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">{fund.investment}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            backgroundColor: fund.color,
                            width: `${fund.allocation}%`
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      {fund.allocation}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Portfolio Overview */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4" style={{ color: colors.textPrimary }}>
              Model portfolio
            </h3>
            <p className="text-sm text-gray-600 mb-2">Best allocative</p>
            <p className="text-xs text-gray-500 mb-6">
              Intelligent reap ⚪ Recent allocative
            </p>

            <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill={colors.primary}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 mb-6">
              {portfolioData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" style={{ color: colors.accent }} />
                <span className="text-sm text-gray-700">Best save allocation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" style={{ color: colors.accent }} />
                <span className="text-sm text-gray-700">Moderately High & balanced</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" style={{ color: colors.accent }} />
                <span className="text-sm text-gray-700">Buy and forget strategy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}