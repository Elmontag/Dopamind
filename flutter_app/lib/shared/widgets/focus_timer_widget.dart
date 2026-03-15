import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../../core/theme/app_theme.dart';
import '../../data/models/task.dart';
import '../../data/repositories/stats_repository.dart';
import '../../domain/gamification/gamification_service.dart';
import '../../main.dart';
import '../widgets/reward_toast.dart';
import '../widgets/micro_confetti.dart';

enum FocusTimerState { idle, running, paused, completed }

/// A self-contained focus timer widget (Pomodoro style).
class FocusTimerWidget extends ConsumerStatefulWidget {
  const FocusTimerWidget({
    super.key,
    this.task,
    this.durationMinutes = 25,
  });

  final Task? task;
  final int durationMinutes;

  @override
  ConsumerState<FocusTimerWidget> createState() => _FocusTimerWidgetState();
}

class _FocusTimerWidgetState extends ConsumerState<FocusTimerWidget> {
  FocusTimerState _state = FocusTimerState.idle;
  Timer? _timer;
  late int _remainingSeconds;
  bool _flowMode = false;

  // Track if user continued past zero (flow detection)
  int _overflowSeconds = 0;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.durationMinutes * 60;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _start() {
    setState(() => _state = FocusTimerState.running);
    _timer = Timer.periodic(const Duration(seconds: 1), _tick);
  }

  void _pause() {
    _timer?.cancel();
    setState(() => _state = FocusTimerState.paused);
  }

  void _resume() => _start();

  void _stop() {
    _timer?.cancel();
    _completeSession();
  }

  void _tick(Timer t) {
    if (!mounted) return;
    setState(() {
      if (_remainingSeconds > 0) {
        _remainingSeconds--;
      } else if (!_flowMode) {
        // Timer reached zero
        _onTimerExpired();
      } else {
        // Flow mode: keep counting extra time
        _overflowSeconds++;
      }
    });
  }

  void _onTimerExpired() {
    setState(() => _state = FocusTimerState.completed);
    _timer?.cancel();
    _showCompletedNotification();
    _completeSession();
  }

  void _continueInFlowMode() {
    setState(() {
      _flowMode = true;
      _state = FocusTimerState.running;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), _tick);
  }

  Future<void> _completeSession() async {
    final sessionMinutes =
        (widget.durationMinutes * 60 - _remainingSeconds + _overflowSeconds) ~/
            60;
    if (sessionMinutes < 1) return;

    // Award XP
    final statsRepo = ref.read(statsRepositoryProvider);
    final stats = await statsRepo.getStats();
    final newStats = GamificationService().applyFocusSession(
      sessionMinutes,
      stats,
    );
    await statsRepo.updateStats(newStats);

    if (mounted) {
      RewardToast.show(
        context,
        message: 'Fokus-Session abgeschlossen!',
        xp: GamificationService.xpPerFocusSession,
      );
      MicroConfetti.show(context);
    }

    setState(() {
      _state = FocusTimerState.idle;
      _remainingSeconds = widget.durationMinutes * 60;
      _flowMode = false;
      _overflowSeconds = 0;
    });
  }

  Future<void> _showCompletedNotification() async {
    const androidDetails = AndroidNotificationDetails(
      'dopamind_reminders',
      'Dopamind Reminders',
      channelDescription: 'Focus timer and deadline reminders',
      importance: Importance.high,
      priority: Priority.high,
    );
    await flutterLocalNotificationsPlugin.show(
      1,
      'Fokus-Session abgeschlossen!',
      '+20 XP für deine Fokus-Session.',
      const NotificationDetails(android: androidDetails),
    );
  }

  String _formatTime(int seconds) {
    final m = (seconds.abs() ~/ 60).toString().padLeft(2, '0');
    final s = (seconds.abs() % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    final isRunning = _state == FocusTimerState.running;
    final isCompleted = _state == FocusTimerState.completed;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Task info
            if (widget.task != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(
                  widget.task!.text,
                  style: TextStyle(
                    color: dc.textSecondary,
                    fontSize: 14,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),

            // Timer display
            Text(
              _flowMode
                  ? '+${_formatTime(_overflowSeconds)}'
                  : _formatTime(_remainingSeconds),
              style: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w700,
                color: _flowMode ? dc.success : dc.accent,
                fontFamily: 'JetBrains Mono',
              ),
            ),

            if (_flowMode)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  'Flow-Modus aktiv 🔥',
                  style: TextStyle(color: dc.success, fontSize: 12),
                ),
              ),

            const SizedBox(height: 16),

            // Controls
            if (isCompleted) ...[
              ElevatedButton.icon(
                onPressed: _continueInFlowMode,
                icon: const Icon(Icons.bolt),
                label: const Text('Im Flow bleiben'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: dc.success,
                  foregroundColor: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => setState(() {
                  _state = FocusTimerState.idle;
                  _remainingSeconds = widget.durationMinutes * 60;
                }),
                child: const Text('Beenden'),
              ),
            ] else
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (!isRunning && _state != FocusTimerState.paused)
                    ElevatedButton.icon(
                      onPressed: _start,
                      icon: const Icon(Icons.play_arrow),
                      label: const Text('Starten'),
                    )
                  else ...[
                    if (isRunning)
                      IconButton(
                        onPressed: _pause,
                        icon: const Icon(Icons.pause),
                        tooltip: 'Pausieren',
                      ),
                    if (_state == FocusTimerState.paused)
                      IconButton(
                        onPressed: _resume,
                        icon: const Icon(Icons.play_arrow),
                        tooltip: 'Fortsetzen',
                      ),
                    IconButton(
                      onPressed: _stop,
                      icon: const Icon(Icons.stop),
                      tooltip: 'Beenden',
                    ),
                  ],
                ],
              ),
          ],
        ),
      ),
    );
  }
}
