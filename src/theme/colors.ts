export const colors = {
  // Zimbabwe flag inspired colors
  primary: "#006400",     // Dark green from flag
  secondary: "#FFD700",   // Gold from flag
  accent: "#DC143C",      // Red from flag
  
  // Core colors
  black: "#111111",
  white: "#FFFFFF",
  
  // Background colors
  background: "#F5F7FA",  // Light gray background
  surface: "#FFFFFF",     // Card/surface color
  
  // Text colors
  textPrimary: "#111827", // Dark text
  textSecondary: "#6B7280", // Muted text
  
  // Status colors
  success: "#00A86B",     // Success green
  error: "#D90429",       // Error red
  warning: "#F59E0B",     // Warning amber
  
  // Border and utility colors
  border: "#E5E7EB",      // Light border
  muted: "#9CA3AF",       // Muted elements
  
  // Gradient colors for cards
  cardGradientStart: "#FFFFFF",
  cardGradientEnd: "#F9FAFB",
} as const;

export type ColorKey = keyof typeof colors;