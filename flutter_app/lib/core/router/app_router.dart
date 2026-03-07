import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../features/home/home_screen.dart';
import '../../features/tasks/tasks_screen.dart';
import '../../features/planner/planner_screen.dart';
import '../../features/achievements/achievements_screen.dart';
import '../../features/mail/mail_screen.dart';
import '../../features/settings/settings_screen.dart';

part 'app_router.g.dart';

/// Shell route that wraps all screens with a bottom navigation bar.
class _ShellScaffold extends StatelessWidget {
  const _ShellScaffold({required this.child, required this.shellContext});

  final Widget child;
  final BuildContext shellContext;

  static const _routes = [
    '/home',
    '/tasks',
    '/planner',
    '/achievements',
    '/mail',
    '/settings',
  ];

  @override
  Widget build(BuildContext context) {
    final location =
        GoRouterState.of(context).matchedLocation;
    final currentIndex =
        _routes.indexWhere((r) => location.startsWith(r)).clamp(0, 5);

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (i) =>
            shellContext.go(_routes[i]),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.today_outlined),
            selectedIcon: Icon(Icons.today),
            label: 'Heute',
          ),
          NavigationDestination(
            icon: Icon(Icons.check_box_outlined),
            selectedIcon: Icon(Icons.check_box),
            label: 'Aufgaben',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: 'Planer',
          ),
          NavigationDestination(
            icon: Icon(Icons.emoji_events_outlined),
            selectedIcon: Icon(Icons.emoji_events),
            label: 'Erfolge',
          ),
          NavigationDestination(
            icon: Icon(Icons.mail_outline),
            selectedIcon: Icon(Icons.mail),
            label: 'Mail',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Einstellungen',
          ),
        ],
      ),
    );
  }
}

@riverpod
GoRouter router(Ref ref) {
  return GoRouter(
    initialLocation: '/home',
    routes: [
      ShellRoute(
        builder: (context, state, child) => _ShellScaffold(
          child: child,
          shellContext: context,
        ),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/tasks',
            builder: (context, state) => const TasksScreen(),
          ),
          GoRoute(
            path: '/planner',
            builder: (context, state) => const PlannerScreen(),
          ),
          GoRoute(
            path: '/achievements',
            builder: (context, state) => const AchievementsScreen(),
          ),
          GoRoute(
            path: '/mail',
            builder: (context, state) => const MailScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
    ],
  );
}
