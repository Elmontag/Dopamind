import 'dart:ui';

import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

/// A card with a subtle translucent "glass" background.
///
/// Matches the `.glass-card` CSS class from the original React frontend.
class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius,
    this.margin,
    this.opacity = 0.08,
  });

  final Widget child;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  final EdgeInsetsGeometry? margin;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final br = borderRadius ?? BorderRadius.circular(16);
    return Container(
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: br,
        border: Border.all(
          color: Colors.white.withOpacity(opacity),
        ),
        color: dc.card.withOpacity(0.9),
      ),
      child: ClipRRect(
        borderRadius: br,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
          child: Container(
            padding: padding ?? const EdgeInsets.all(16),
            child: child,
          ),
        ),
      ),
    );
  }
}
