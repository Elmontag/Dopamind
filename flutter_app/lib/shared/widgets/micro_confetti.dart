import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

/// Lightweight confetti particle effect.
///
/// Shows a burst of coloured dots that fly outward and fade.
class MicroConfetti extends StatefulWidget {
  const MicroConfetti({
    super.key,
    this.particleCount = 24,
    this.onComplete,
  });

  final int particleCount;
  final VoidCallback? onComplete;

  /// Triggers a confetti burst over [context].
  static void show(BuildContext context) {
    final overlay = Overlay.of(context);
    late OverlayEntry entry;
    entry = OverlayEntry(
      builder: (ctx) => _ConfettiOverlay(onComplete: () => entry.remove()),
    );
    overlay.insert(entry);
  }

  @override
  State<MicroConfetti> createState() => _MicroConfettiState();
}

class _MicroConfettiState extends State<MicroConfetti>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final List<_Particle> _particles;

  @override
  void initState() {
    super.initState();
    final rng = Random();
    _particles = List.generate(
      widget.particleCount,
      (_) => _Particle(rng),
    );
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..forward().whenComplete(() {
        widget.onComplete?.call();
      });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (_, __) {
        return Stack(
          children: _particles.map((p) {
            final progress = _controller.value;
            final x = p.startX + p.vx * progress * 120;
            final y = p.startY + p.vy * progress * 120 + 80 * progress * progress;
            final opacity = (1.0 - progress).clamp(0.0, 1.0);
            return Positioned(
              left: x,
              top: y,
              child: Opacity(
                opacity: opacity,
                child: Container(
                  width: p.size,
                  height: p.size,
                  decoration: BoxDecoration(
                    color: p.color,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            );
          }).toList(),
        );
      },
    );
  }
}

class _Particle {
  _Particle(Random rng)
      : startX = rng.nextDouble() * 300,
        startY = rng.nextDouble() * 100 + 100,
        vx = (rng.nextDouble() - 0.5) * 2,
        vy = -(rng.nextDouble() * 1.5 + 0.5),
        size = rng.nextDouble() * 8 + 4,
        color = _colors[rng.nextInt(_colors.length)];

  final double startX;
  final double startY;
  final double vx;
  final double vy;
  final double size;
  final Color color;

  static const _colors = [
    Color(0xFF6C63FF),
    Color(0xFF00C9A7),
    Color(0xFFFFB84C),
    Color(0xFFFF6B6B),
    Color(0xFF8B83FF),
    Color(0xFFA29BFE),
  ];
}

class _ConfettiOverlay extends StatelessWidget {
  const _ConfettiOverlay({required this.onComplete});

  final VoidCallback onComplete;

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: IgnorePointer(
        child: MicroConfetti(onComplete: onComplete),
      ),
    );
  }
}
