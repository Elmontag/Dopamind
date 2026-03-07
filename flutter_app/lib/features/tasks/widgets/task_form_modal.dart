import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../../core/theme/app_theme.dart';
import '../../../data/models/task.dart';
import '../../../data/models/subtask.dart';
import '../../../data/repositories/task_repository.dart';
import 'subtask_item.dart';
import 'tag_input.dart';

/// Modal bottom sheet form for creating or editing a task.
class TaskFormModal extends ConsumerStatefulWidget {
  const TaskFormModal({
    super.key,
    this.task,
    required this.onSave,
  });

  final Task? task;
  final Future<void> Function(Task) onSave;

  @override
  ConsumerState<TaskFormModal> createState() => _TaskFormModalState();
}

class _TaskFormModalState extends ConsumerState<TaskFormModal> {
  static const _uuid = Uuid();

  final _formKey = GlobalKey<FormState>();
  late TextEditingController _textCtrl;
  late TextEditingController _estimatedCtrl;

  String _priority = 'medium';
  String _energyCost = 'medium';
  String? _scheduledTime;
  String? _deadline;
  String? _scheduledDate;
  List<String> _tags = [];
  List<Subtask> _subtasks = [];
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final t = widget.task;
    _textCtrl = TextEditingController(text: t?.text ?? '');
    _estimatedCtrl = TextEditingController(
        text: t?.estimatedMinutes?.toString() ?? '');
    _priority = t?.priority ?? 'medium';
    _energyCost = t?.energyCost ?? 'medium';
    _scheduledTime = t?.scheduledTime;
    _deadline = t?.deadline;
    _scheduledDate = t?.scheduledDate;
    _tags = List.from(t?.tags ?? []);

    if (t != null) {
      _loadSubtasks(t.id);
    }
  }

  Future<void> _loadSubtasks(String taskId) async {
    final subs =
        await ref.read(taskRepositoryProvider).getSubtasksForTask(taskId);
    if (mounted) setState(() => _subtasks = subs);
  }

  @override
  void dispose() {
    _textCtrl.dispose();
    _estimatedCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;

    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      decoration: BoxDecoration(
        color: dc.card,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: dc.muted.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              Text(
                widget.task == null ? 'Neue Aufgabe' : 'Aufgabe bearbeiten',
                style: TextStyle(
                  color: dc.textPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
              const SizedBox(height: 16),

              // Task text
              TextFormField(
                controller: _textCtrl,
                decoration: const InputDecoration(
                  labelText: 'Aufgabe',
                  hintText: 'Was möchtest du erledigen?',
                ),
                autofocus: widget.task == null,
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Bitte Text eingeben' : null,
              ),
              const SizedBox(height: 16),

              // Priority
              _SectionLabel('Priorität', dc),
              Row(
                children: [
                  _ChoiceChip(
                    label: 'Muss sein',
                    value: 'high',
                    selected: _priority == 'high',
                    color: dc.danger,
                    onTap: () => setState(() => _priority = 'high'),
                  ),
                  const SizedBox(width: 8),
                  _ChoiceChip(
                    label: 'Wichtig',
                    value: 'medium',
                    selected: _priority == 'medium',
                    color: dc.warn,
                    onTap: () => setState(() => _priority = 'medium'),
                  ),
                  const SizedBox(width: 8),
                  _ChoiceChip(
                    label: 'Wäre schön',
                    value: 'low',
                    selected: _priority == 'low',
                    color: dc.muted,
                    onTap: () => setState(() => _priority = 'low'),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Energie
              _SectionLabel('Energieaufwand', dc),
              Row(
                children: [
                  _ChoiceChip(
                    label: '⚡ Hoch',
                    value: 'high',
                    selected: _energyCost == 'high',
                    color: dc.warn,
                    onTap: () => setState(() => _energyCost = 'high'),
                  ),
                  const SizedBox(width: 8),
                  _ChoiceChip(
                    label: '😊 Normal',
                    value: 'medium',
                    selected: _energyCost == 'medium',
                    color: dc.success,
                    onTap: () => setState(() => _energyCost = 'medium'),
                  ),
                  const SizedBox(width: 8),
                  _ChoiceChip(
                    label: '😴 Niedrig',
                    value: 'low',
                    selected: _energyCost == 'low',
                    color: dc.muted,
                    onTap: () => setState(() => _energyCost = 'low'),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Tageszeit
              _SectionLabel('Tageszeit', dc),
              Row(
                children: [
                  _ChoiceChip(
                    label: '☀️ Morgen',
                    value: 'morning',
                    selected: _scheduledTime == 'morning',
                    color: dc.warn,
                    onTap: () => setState(() => _scheduledTime =
                        _scheduledTime == 'morning' ? null : 'morning'),
                  ),
                  const SizedBox(width: 8),
                  _ChoiceChip(
                    label: '☁️ Mittag',
                    value: 'afternoon',
                    selected: _scheduledTime == 'afternoon',
                    color: dc.accent,
                    onTap: () => setState(() => _scheduledTime =
                        _scheduledTime == 'afternoon' ? null : 'afternoon'),
                  ),
                  const SizedBox(width: 8),
                  _ChoiceChip(
                    label: '🌙 Abend',
                    value: 'evening',
                    selected: _scheduledTime == 'evening',
                    color: dc.accentGlow,
                    onTap: () => setState(() => _scheduledTime =
                        _scheduledTime == 'evening' ? null : 'evening'),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Deadline
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      readOnly: true,
                      decoration: InputDecoration(
                        labelText: 'Deadline',
                        hintText: 'Datum wählen',
                        suffixIcon: _deadline != null
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () =>
                                    setState(() => _deadline = null),
                              )
                            : const Icon(Icons.calendar_today, size: 18),
                      ),
                      controller: TextEditingController(
                          text: _deadline ?? ''),
                      onTap: () => _pickDate(isDeadline: true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      readOnly: true,
                      decoration: InputDecoration(
                        labelText: 'Geplant am',
                        hintText: 'Datum wählen',
                        suffixIcon: _scheduledDate != null
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () =>
                                    setState(() => _scheduledDate = null),
                              )
                            : const Icon(Icons.event, size: 18),
                      ),
                      controller: TextEditingController(
                          text: _scheduledDate ?? ''),
                      onTap: () => _pickDate(isDeadline: false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Estimated minutes
              TextFormField(
                controller: _estimatedCtrl,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Geschätzte Dauer (min)',
                ),
              ),
              const SizedBox(height: 16),

              // Tags
              _SectionLabel('Tags', dc),
              TagInput(
                tags: _tags,
                onChanged: (tags) => setState(() => _tags = tags),
              ),
              const SizedBox(height: 16),

              // Subtasks
              _SectionLabel('Teilaufgaben', dc),
              ..._subtasks.asMap().entries.map((e) => SubtaskItem(
                    subtask: e.value,
                    onToggle: () => setState(() {
                      _subtasks[e.key] = e.value.copyWith(
                          completed: !e.value.completed);
                    }),
                    onDelete: () => setState(
                        () => _subtasks.removeAt(e.key)),
                  )),
              TextButton.icon(
                onPressed: _addSubtask,
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Teilaufgabe hinzufügen'),
              ),

              const SizedBox(height: 24),

              // Save button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: _saving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Speichern'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickDate({required bool isDeadline}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
    );
    if (picked == null) return;
    final dateStr =
        '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
    setState(() {
      if (isDeadline) {
        _deadline = dateStr;
      } else {
        _scheduledDate = dateStr;
      }
    });
  }

  void _addSubtask() {
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Teilaufgabe'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(hintText: 'Neue Teilaufgabe…'),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Abbrechen'),
          ),
          TextButton(
            onPressed: () {
              if (ctrl.text.trim().isNotEmpty) {
                setState(() => _subtasks.add(Subtask(
                      id: _uuid.v4(),
                      taskId: widget.task?.id ?? '',
                      text: ctrl.text.trim(),
                    )));
              }
              Navigator.pop(ctx);
            },
            child: const Text('Hinzufügen'),
          ),
        ],
      ),
    );
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _saving = true);

    try {
      final task = Task(
        id: widget.task?.id ?? '',
        text: _textCtrl.text.trim(),
        priority: _priority,
        energyCost: _energyCost,
        scheduledTime: _scheduledTime,
        deadline: _deadline,
        scheduledDate: _scheduledDate,
        estimatedMinutes: int.tryParse(_estimatedCtrl.text),
        tags: _tags,
        completed: widget.task?.completed ?? false,
        completedAt: widget.task?.completedAt,
        sortOrder: widget.task?.sortOrder ?? 0,
        createdAt: widget.task?.createdAt,
      );
      await widget.onSave(task);

      // Save subtasks
      final taskRepo = ref.read(taskRepositoryProvider);
      for (final sub in _subtasks) {
        await taskRepo.upsertSubtask(sub.copyWith(
          taskId: task.id.isEmpty ? sub.taskId : task.id,
        ));
      }

      if (mounted) Navigator.pop(context);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}

// ── Helper widgets ─────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.label, this.dc);

  final String label;
  final DopamindColors dc;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        label,
        style: TextStyle(
          color: dc.textSecondary,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _ChoiceChip extends StatelessWidget {
  const _ChoiceChip({
    required this.label,
    required this.value,
    required this.selected,
    required this.color,
    required this.onTap,
  });

  final String label;
  final String value;
  final bool selected;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? color.withOpacity(0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? color : color.withOpacity(0.3),
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? color : color.withOpacity(0.7),
            fontSize: 12,
            fontWeight:
                selected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
