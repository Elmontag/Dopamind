import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_theme.dart';

/// XP reward toast that slides up and fades out.
///
/// Mirrors the `reward-pop` and `slide-up` CSS animations from the frontend.
class RewardToast extends StatefulWidget {
  const RewardToast({
    super.key,
    required this.message,
    this.xp,
    this.onDismissed,
    this.duration = const Duration(seconds: 3),
  });

  final String message;
  final int? xp;
  final VoidCallback? onDismissed;
  final Duration duration;

  /// Shows a [RewardToast] as an overlay over [context].
  static void show(
    BuildContext context, {
    required String message,
    int? xp,
  }) {
    final overlay = Overlay.of(context);
    late OverlayEntry entry;
    entry = OverlayEntry(
      builder: (ctx) => _RewardToastOverlay(
        message: message,
        xp: xp,
        onDismissed: () => entry.remove(),
      ),
    );
    overlay.insert(entry);
  }

  @override
  State<RewardToast> createState() => _RewardToastState();
}

class _RewardToastState extends State<RewardToast> {
  @override
  void initState() {
    super.initState();
    Future.delayed(widget.duration, () {
      widget.onDismissed?.call();
    });
  }

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: dc.accent,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: dc.accent.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star, color: Colors.white, size: 20),
          const SizedBox(width: 8),
          Text(
            widget.xp != null
                ? '${widget.message}  +${widget.xp} XP'
                : widget.message,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontSize: 15,
            ),
          ),
        ],
      ),
    )
        .animate()
        .slideY(
          begin: 0.5,
          end: 0,
          duration: 400.ms,
          curve: Curves.easeOut,
        )
        .fadeIn(duration: 300.ms);
  }
}

class _RewardToastOverlay extends StatelessWidget {
  const _RewardToastOverlay({
    required this.message,
    this.xp,
    required this.onDismissed,
  });

  final String message;
  final int? xp;
  final VoidCallback onDismissed;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 80,
      left: 0,
      right: 0,
      child: SafeArea(
        child: Center(
          child: RewardToast(
            message: message,
            xp: xp,
            onDismissed: onDismissed,
          ),
        ),
      ),
    );
  }
}
