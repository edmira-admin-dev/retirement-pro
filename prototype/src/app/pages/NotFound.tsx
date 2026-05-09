import { Link } from "react-router";
import { useTheme, themeColors } from "../contexts/ThemeContext";
import { Home } from "lucide-react";

export default function NotFound() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <div className="text-center">
        <h1 className="text-9xl font-bold mb-4" style={{ color: colors.primary }}>
          404
        </h1>
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.textPrimary }}>
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.primary }}
        >
          <Home className="w-5 h-5" />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  );
}
