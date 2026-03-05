import { useState, useRef, useEffect } from "react";

/**
 * TagInput — text input with autocomplete suggestions for tags.
 *
 * Props:
 *   value          {string}   current input value
 *   onChange       {fn}       called with new string value on change
 *   onAddTag       {fn}       called with the sanitized tag string to add
 *   existingTags   {string[]} tags already in the list (excluded from suggestions)
 *   allTags        {string[]} all available tags to suggest
 *   placeholder    {string}
 *   className      {string}
 */
export default function TagInput({ value, onChange, onAddTag, existingTags = [], allTags = [], placeholder, className = "" }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const sanitize = (s) => s.trim().replace(/,/g, "");

  const suggestions = allTags.filter(
    (t) => t !== value && !existingTags.includes(t) && (!value.trim() || t.toLowerCase().includes(value.trim().toLowerCase()))
  );

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if ((e.key === "Enter" || e.key === ",") && value.trim()) {
      e.preventDefault();
      const tag = sanitize(value);
      if (tag && !existingTags.includes(tag)) {
        onAddTag(tag);
        onChange("");
      }
      setOpen(false);
    }
  };

  const handleSelect = (tag) => {
    if (!existingTags.includes(tag)) {
      onAddTag(tag);
      onChange("");
    }
    setOpen(false);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handle = (e) => {
      if (!inputRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative flex-1 min-w-[80px]">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={className}
      />
      {open && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute left-0 top-full mt-1 z-50 min-w-[120px] max-h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-lg py-1"
        >
          {suggestions.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(tag); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
