import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

/// Tag input widget with chips and autocomplete-like suggestions.
class TagInput extends StatefulWidget {
  const TagInput({
    super.key,
    required this.tags,
    required this.onChanged,
    this.suggestions = const [],
  });

  final List<String> tags;
  final void Function(List<String>) onChanged;
  final List<String> suggestions;

  @override
  State<TagInput> createState() => _TagInputState();
}

class _TagInputState extends State<TagInput> {
  final _ctrl = TextEditingController();

  void _addTag(String tag) {
    final trimmed = tag.trim().toLowerCase();
    if (trimmed.isEmpty || widget.tags.contains(trimmed)) {
      _ctrl.clear();
      return;
    }
    widget.onChanged([...widget.tags, trimmed]);
    _ctrl.clear();
  }

  void _removeTag(String tag) {
    widget.onChanged(widget.tags.where((t) => t != tag).toList());
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dc = context.dc;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Existing tags
        if (widget.tags.isNotEmpty)
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: widget.tags
                .map((tag) => Chip(
                      label: Text('#$tag',
                          style: const TextStyle(fontSize: 12)),
                      deleteIcon: const Icon(Icons.close, size: 14),
                      onDeleted: () => _removeTag(tag),
                      backgroundColor: dc.accent.withOpacity(0.1),
                      side: BorderSide(
                          color: dc.accent.withOpacity(0.3)),
                      labelStyle: TextStyle(color: dc.accent),
                    ))
                .toList(),
          ),
        const SizedBox(height: 6),
        // Input
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _ctrl,
                decoration: const InputDecoration(
                  hintText: 'Tag hinzufügen…',
                  isDense: true,
                ),
                onSubmitted: _addTag,
              ),
            ),
            IconButton(
              icon: Icon(Icons.add, color: dc.accent),
              onPressed: () => _addTag(_ctrl.text),
            ),
          ],
        ),
      ],
    );
  }
}
