import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:reorderables/reorderables.dart';
import 'package:uuid/uuid.dart';

import '../../core/theme/app_theme.dart';
import '../../data/models/task.dart';
import '../../data/repositories/task_repository.dart';
import '../../data/repositories/stats_repository.dart';
import '../../domain/gamification/gamification_service.dart';
import '../../domain/gamification/streak_service.dart';
import '../../shared/providers/settings_provider.dart';
import '../../shared/widgets/reward_toast.dart';
import '../../shared/widgets/micro_confetti.dart';
import 'widgets/task_card.dart';
import 'widgets/task_form_modal.dart';

/// Screen showing all tasks with filter, drag-to-reorder, and quick actions.
class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});

  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tasksAsync = ref.watch(allTasksProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Aufgaben'),
        bottom: TabBar(
          controller: _tabCtrl,
          tabs: const [
            Tab(text: 'Offen'),
            Tab(text: 'Erledigt'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: _toggleSearch,
          ),
        ],
      ),
      body: Column(
        children: [
          if (_search.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 8),
              child: TextField(
                decoration: const InputDecoration(
                  hintText: 'Aufgaben suchen…',
                  prefixIcon: Icon(Icons.search),
                ),
                onChanged: (v) => setState(() => _search = v),
                autofocus: true,
              ),
            ),
          Expanded(
            child: tasksAsync.when(
              loading: () =>
                  const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Fehler: $e')),
              data: (tasks) {
                final filtered = _search.isEmpty
                    ? tasks
                    : tasks
                        .where((t) => t.text
                            .toLowerCase()
                            .contains(_search.toLowerCase()))
                        .toList();

                final open = filtered
                    .where((t) => !t.completed)
                    .toList();
                final done = filtered
                    .where((t) => t.completed)
                    .toList();

                return TabBarView(
                  controller: _tabCtrl,
                  children: [
                    _TaskList(
                      tasks: open,
                      onComplete: (t) => _complete(t),
                      onEdit: (t) => _editTask(t),
                      onDelete: (t) => _delete(t),
                      onReorder: (oldIdx, newIdx) =>
                          _reorder(open, oldIdx, newIdx),
                    ),
                    _TaskList(
                      tasks: done,
                      completed: true,
                      onReopen: (t) => ref
                          .read(taskRepositoryProvider)
                          .reopenTask(t.id),
                      onDelete: (t) => _delete(t),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _createTask(),
        icon: const Icon(Icons.add),
        label: const Text('Neue Aufgabe'),
      ),
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  void _toggleSearch() {
    setState(() => _search = _search.isEmpty ? ' ' : '');
  }

  Future<void> _complete(Task task) async {
    final taskRepo = ref.read(taskRepositoryProvider);
    final statsRepo = ref.read(statsRepositoryProvider);

    await taskRepo.completeTask(task.id);
    final stats = await statsRepo.getStats();
    final streaked = const StreakService().onTaskCompleted(stats);
    final gamified = GamificationService().applyTaskCompletion(task, streaked);
    await statsRepo.updateStats(gamified);

    final xpGained =
        GamificationService.calculateXpForTask(task, stats);

    if (mounted) {
      RewardToast.show(
        context,
        message: 'Erledigt!',
        xp: xpGained,
      );
      if (ref.read(settingsProvider).confettiEnabled) {
        MicroConfetti.show(context);
      }
    }
  }

  Future<void> _delete(Task task) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Aufgabe löschen?'),
        content: Text(task.text),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Abbrechen'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Löschen'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(taskRepositoryProvider).deleteTask(task.id);
    }
  }

  Future<void> _createTask() async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => TaskFormModal(
        onSave: (task) =>
            ref.read(taskRepositoryProvider).createTask(task),
      ),
    );
  }

  Future<void> _editTask(Task task) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => TaskFormModal(
        task: task,
        onSave: (t) => ref.read(taskRepositoryProvider).updateTask(t),
      ),
    );
  }

  Future<void> _reorder(
      List<Task> tasks, int oldIdx, int newIdx) async {
    final ids = tasks.map((t) => t.id).toList();
    final item = ids.removeAt(oldIdx);
    ids.insert(newIdx, item);
    await ref.read(taskRepositoryProvider).updateSortOrders(ids);
  }
}

class _TaskList extends StatelessWidget {
  const _TaskList({
    required this.tasks,
    this.completed = false,
    this.onComplete,
    this.onReopen,
    this.onEdit,
    this.onDelete,
    this.onReorder,
  });

  final List<Task> tasks;
  final bool completed;
  final void Function(Task)? onComplete;
  final void Function(Task)? onReopen;
  final void Function(Task)? onEdit;
  final void Function(Task)? onDelete;
  final void Function(int, int)? onReorder;

  @override
  Widget build(BuildContext context) {
    if (tasks.isEmpty) {
      return Center(
        child: Text(
          completed ? 'Noch nichts erledigt' : 'Keine offenen Aufgaben',
          style: TextStyle(
              color: Theme.of(context)
                  .extension<DopamindColors>()!
                  .muted),
        ),
      );
    }

    if (!completed && onReorder != null) {
      return ReorderableColumn(
        padding: const EdgeInsets.all(8),
        onReorder: onReorder!,
        children: tasks.asMap().entries.map((e) {
          return _KeyedTaskCard(
            key: ValueKey(e.value.id),
            task: e.value,
            onComplete: onComplete,
            onEdit: onEdit,
            onDelete: onDelete,
          );
        }).toList(),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: tasks.length,
      itemBuilder: (ctx, i) => TaskCard(
        task: tasks[i],
        onComplete:
            completed ? null : () => onComplete?.call(tasks[i]),
        onReopen:
            completed ? () => onReopen?.call(tasks[i]) : null,
        onEdit: completed ? null : () => onEdit?.call(tasks[i]),
        onDelete: () => onDelete?.call(tasks[i]),
      ).animate().fadeIn(duration: 200.ms, delay: (i * 30).ms),
    );
  }
}

class _KeyedTaskCard extends StatelessWidget {
  const _KeyedTaskCard({
    super.key,
    required this.task,
    this.onComplete,
    this.onEdit,
    this.onDelete,
  });

  final Task task;
  final void Function(Task)? onComplete;
  final void Function(Task)? onEdit;
  final void Function(Task)? onDelete;

  @override
  Widget build(BuildContext context) {
    return TaskCard(
      task: task,
      onComplete: onComplete != null ? () => onComplete!(task) : null,
      onEdit: onEdit != null ? () => onEdit!(task) : null,
      onDelete: onDelete != null ? () => onDelete!(task) : null,
    );
  }
}
