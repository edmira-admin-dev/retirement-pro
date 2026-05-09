import { Link, useLocation } from "react-router";
import { useTheme, ThemeColor, themeColors } from "../contexts/ThemeContext";
import { Menu, X, Palette } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const colors = themeColors[theme];

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/investment-advise", label: "Investment Advise" },
    { path: "/financial-planning", label: "Financial Planning" },
  ];

  const themes: { color: ThemeColor; label: string }[] = [
    { color: 'blue', label: 'Blue' },
    { color: 'purple', label: 'Purple' },
    { color: 'grey', label: 'Grey' },
    { color: 'yellow', label: 'Yellow' },
    { color: 'green', label: 'Green' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <span className="font-bold text-white">DF</span>
            </div>
            <span className="font-bold text-xl" style={{ color: colors.textPrimary }}>
              Desi FIRE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-3 py-2 transition-colors"
                style={{
                  color: location.pathname === item.path ? colors.primary : colors.textSecondary,
                }}
              >
                {item.label}
                {location.pathname === item.path && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: colors.primary }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Theme Selector */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: colors.primary }}
            >
              <Palette className="w-5 h-5" />
            </button>
            
            {themeMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setThemeMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {themes.map((t) => (
                    <button
                      key={t.color}
                      onClick={() => {
                        setTheme(t.color);
                        setThemeMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: themeColors[t.color].primary }}
                      />
                      <span className={theme === t.color ? 'font-semibold' : ''}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            style={{ color: colors.primary }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: location.pathname === item.path ? colors.background : 'transparent',
                    color: location.pathname === item.path ? colors.primary : colors.textSecondary,
                  }}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Theme Selector */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <p className="px-3 py-2 text-sm font-semibold text-gray-600">Theme</p>
                <div className="grid grid-cols-5 gap-2 px-3">
                  {themes.map((t) => (
                    <button
                      key={t.color}
                      onClick={() => {
                        setTheme(t.color);
                        setMobileMenuOpen(false);
                      }}
                      className="w-10 h-10 rounded-lg border-2 flex items-center justify-center"
                      style={{ 
                        backgroundColor: themeColors[t.color].primary,
                        borderColor: theme === t.color ? '#000' : 'transparent',
                      }}
                    >
                      <span className="text-xs text-white font-semibold">
                        {t.label[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
