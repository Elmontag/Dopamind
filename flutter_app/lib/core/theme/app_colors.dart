import 'package:flutter/material.dart';

/// Colour constants derived from the Tailwind design system used in the
/// original React frontend.
class AppColors {
  AppColors._();

  // ── Dark Mode ──────────────────────────────────────────────────────────────
  static const Color darkSurface = Color(0xFF1A1A2E);
  static const Color darkCard = Color(0xFF16213E);
  static const Color darkAccent = Color(0xFF6C63FF);
  static const Color darkAccentSoft = Color(0xFF8B83FF);
  static const Color darkAccentGlow = Color(0xFFA29BFE);
  static const Color darkSuccess = Color(0xFF00C9A7);
  static const Color darkWarn = Color(0xFFFFB84C);
  static const Color darkDanger = Color(0xFFFF6B6B);
  static const Color darkMuted = Color(0xFF6B7280);
  static const Color darkText = Color(0xFFE2E8F0);
  static const Color darkTextSecondary = Color(0xFF94A3B8);

  // ── Light Mode ─────────────────────────────────────────────────────────────
  static const Color lightSurface = Color(0xFFFAFAF9);
  static const Color lightCard = Color(0xFFFFFFFF);
  static const Color lightText = Color(0xFF1A1A2E);
  static const Color lightTextSecondary = Color(0xFF6B7280);
  static const Color lightAccent = Color(0xFF6C63FF);
  static const Color lightAccentSoft = Color(0xFF8B83FF);
  static const Color lightSuccess = Color(0xFF00C9A7);
  static const Color lightWarn = Color(0xFFFFB84C);
  static const Color lightDanger = Color(0xFFFF6B6B);
  static const Color lightMuted = Color(0xFF9CA3AF);

  // ── Category / Label colours ───────────────────────────────────────────────
  static const Map<String, Color> categoryColors = {
    'blue': Color(0xFF3B82F6),
    'purple': Color(0xFFA855F7),
    'green': Color(0xFF22C55E),
    'yellow': Color(0xFFEAB308),
    'indigo': Color(0xFF6366F1),
    'orange': Color(0xFFF97316),
    'teal': Color(0xFF14B8A6),
    'pink': Color(0xFFEC4899),
    'red': Color(0xFFEF4444),
    'gray': Color(0xFF6B7280),
  };

  static Color categoryColor(String key) =>
      categoryColors[key] ?? categoryColors['gray']!;

  // ── Priority colours ───────────────────────────────────────────────────────
  static const Color priorityHigh = Color(0xFFFF6B6B);   // danger
  static const Color priorityMedium = Color(0xFFFFB84C); // warn
  static const Color priorityLow = Color(0xFF6B7280);    // muted

  static Color priorityColor(String priority) {
    switch (priority) {
      case 'high':
        return priorityHigh;
      case 'low':
        return priorityLow;
      default:
        return priorityMedium;
    }
  }
}
