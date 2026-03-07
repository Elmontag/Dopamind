import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// Central theme factory for Dopamind.
///
/// All colours are based on the Tailwind design system used in the original
/// React frontend.
class AppTheme {
  AppTheme._();

  // ── Shared text theme ──────────────────────────────────────────────────────

  static TextTheme _textTheme(Color primary, Color secondary) {
    final inter = GoogleFonts.interTextTheme();
    return inter.copyWith(
      displayLarge: inter.displayLarge!
          .copyWith(color: primary, fontWeight: FontWeight.bold),
      displayMedium: inter.displayMedium!
          .copyWith(color: primary, fontWeight: FontWeight.bold),
      headlineLarge: inter.headlineLarge!
          .copyWith(color: primary, fontWeight: FontWeight.w700),
      headlineMedium: inter.headlineMedium!
          .copyWith(color: primary, fontWeight: FontWeight.w600),
      headlineSmall: inter.headlineSmall!
          .copyWith(color: primary, fontWeight: FontWeight.w600),
      titleLarge: inter.titleLarge!
          .copyWith(color: primary, fontWeight: FontWeight.w600),
      titleMedium: inter.titleMedium!
          .copyWith(color: primary, fontWeight: FontWeight.w500),
      titleSmall: inter.titleSmall!
          .copyWith(color: secondary, fontWeight: FontWeight.w500),
      bodyLarge: inter.bodyLarge!.copyWith(color: primary),
      bodyMedium: inter.bodyMedium!.copyWith(color: primary),
      bodySmall: inter.bodySmall!.copyWith(color: secondary),
      labelLarge: inter.labelLarge!
          .copyWith(color: primary, fontWeight: FontWeight.w600),
      labelMedium: inter.labelMedium!.copyWith(color: secondary),
      labelSmall: inter.labelSmall!.copyWith(color: secondary),
    );
  }

  // ── Dark theme ─────────────────────────────────────────────────────────────

  static ThemeData darkTheme() {
    final colorScheme = const ColorScheme.dark().copyWith(
      surface: AppColors.darkSurface,
      primary: AppColors.darkAccent,
      secondary: AppColors.darkAccentSoft,
      tertiary: AppColors.darkAccentGlow,
      error: AppColors.darkDanger,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: AppColors.darkText,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.darkSurface,
      textTheme:
          _textTheme(AppColors.darkText, AppColors.darkTextSecondary),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.darkCard,
        foregroundColor: AppColors.darkText,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          color: AppColors.darkText,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.darkCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: Colors.white.withOpacity(0.08),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkCard,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.12)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.12)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.darkAccent),
        ),
        labelStyle:
            const TextStyle(color: AppColors.darkTextSecondary),
        hintStyle: const TextStyle(color: AppColors.darkMuted),
      ),
      dividerColor: Colors.white.withOpacity(0.08),
      iconTheme: const IconThemeData(color: AppColors.darkTextSecondary),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.darkAccent,
        foregroundColor: Colors.white,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.darkCard,
        indicatorColor: AppColors.darkAccent.withOpacity(0.2),
        labelTextStyle: WidgetStateProperty.all(
          GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: AppColors.darkText),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.darkCard,
        selectedColor: AppColors.darkAccent.withOpacity(0.3),
        labelStyle: const TextStyle(color: AppColors.darkText, fontSize: 12),
        side: BorderSide(color: Colors.white.withOpacity(0.12)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      extensions: const [DopamindColors.dark],
    );
  }

  // ── Light theme ────────────────────────────────────────────────────────────

  static ThemeData lightTheme() {
    final colorScheme = const ColorScheme.light().copyWith(
      surface: AppColors.lightSurface,
      primary: AppColors.lightAccent,
      secondary: AppColors.lightAccentSoft,
      error: AppColors.lightDanger,
      onPrimary: Colors.white,
      onSurface: AppColors.lightText,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.lightSurface,
      textTheme:
          _textTheme(AppColors.lightText, AppColors.lightTextSecondary),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.lightCard,
        foregroundColor: AppColors.lightText,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          color: AppColors.lightText,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.lightCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: Colors.black.withOpacity(0.08)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.lightCard,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.black.withOpacity(0.12)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.black.withOpacity(0.12)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide:
              const BorderSide(color: AppColors.lightAccent),
        ),
        labelStyle:
            const TextStyle(color: AppColors.lightTextSecondary),
        hintStyle: const TextStyle(color: AppColors.lightMuted),
      ),
      dividerColor: Colors.black.withOpacity(0.08),
      iconTheme: const IconThemeData(color: AppColors.lightTextSecondary),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.lightAccent,
        foregroundColor: Colors.white,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.lightCard,
        indicatorColor: AppColors.lightAccent.withOpacity(0.2),
        labelTextStyle: WidgetStateProperty.all(
          GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: AppColors.lightText),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.lightSurface,
        selectedColor: AppColors.lightAccent.withOpacity(0.2),
        labelStyle: const TextStyle(color: AppColors.lightText, fontSize: 12),
        side: BorderSide(color: Colors.black.withOpacity(0.12)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      extensions: const [DopamindColors.light],
    );
  }
}

// ── ThemeExtension for semantic colour access ──────────────────────────────

@immutable
class DopamindColors extends ThemeExtension<DopamindColors> {
  const DopamindColors({
    required this.surface,
    required this.card,
    required this.accent,
    required this.accentSoft,
    required this.accentGlow,
    required this.success,
    required this.warn,
    required this.danger,
    required this.muted,
    required this.textPrimary,
    required this.textSecondary,
  });

  final Color surface;
  final Color card;
  final Color accent;
  final Color accentSoft;
  final Color accentGlow;
  final Color success;
  final Color warn;
  final Color danger;
  final Color muted;
  final Color textPrimary;
  final Color textSecondary;

  static const DopamindColors dark = DopamindColors(
    surface: AppColors.darkSurface,
    card: AppColors.darkCard,
    accent: AppColors.darkAccent,
    accentSoft: AppColors.darkAccentSoft,
    accentGlow: AppColors.darkAccentGlow,
    success: AppColors.darkSuccess,
    warn: AppColors.darkWarn,
    danger: AppColors.darkDanger,
    muted: AppColors.darkMuted,
    textPrimary: AppColors.darkText,
    textSecondary: AppColors.darkTextSecondary,
  );

  static const DopamindColors light = DopamindColors(
    surface: AppColors.lightSurface,
    card: AppColors.lightCard,
    accent: AppColors.lightAccent,
    accentSoft: AppColors.lightAccentSoft,
    accentGlow: AppColors.lightAccentSoft,
    success: AppColors.lightSuccess,
    warn: AppColors.lightWarn,
    danger: AppColors.lightDanger,
    muted: AppColors.lightMuted,
    textPrimary: AppColors.lightText,
    textSecondary: AppColors.lightTextSecondary,
  );

  @override
  DopamindColors copyWith({
    Color? surface,
    Color? card,
    Color? accent,
    Color? accentSoft,
    Color? accentGlow,
    Color? success,
    Color? warn,
    Color? danger,
    Color? muted,
    Color? textPrimary,
    Color? textSecondary,
  }) {
    return DopamindColors(
      surface: surface ?? this.surface,
      card: card ?? this.card,
      accent: accent ?? this.accent,
      accentSoft: accentSoft ?? this.accentSoft,
      accentGlow: accentGlow ?? this.accentGlow,
      success: success ?? this.success,
      warn: warn ?? this.warn,
      danger: danger ?? this.danger,
      muted: muted ?? this.muted,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
    );
  }

  @override
  DopamindColors lerp(DopamindColors? other, double t) {
    if (other == null) return this;
    return DopamindColors(
      surface: Color.lerp(surface, other.surface, t)!,
      card: Color.lerp(card, other.card, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      accentSoft: Color.lerp(accentSoft, other.accentSoft, t)!,
      accentGlow: Color.lerp(accentGlow, other.accentGlow, t)!,
      success: Color.lerp(success, other.success, t)!,
      warn: Color.lerp(warn, other.warn, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
      muted: Color.lerp(muted, other.muted, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary:
          Color.lerp(textSecondary, other.textSecondary, t)!,
    );
  }
}

/// Convenience extension on [BuildContext] for quick access to semantic
/// Dopamind colours without importing [Theme.of].
extension DopamindColorsX on BuildContext {
  DopamindColors get dc =>
      Theme.of(this).extension<DopamindColors>()!;
}
