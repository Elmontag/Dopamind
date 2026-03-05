/**
 * Returns a translated display name for a category.
 * Falls back to the raw cat.name if no i18n key exists.
 *
 * @param {object} cat  – category object with a `name` property
 * @param {function} t  – i18n translation function
 */
export function getCatDisplayName(cat, t) {
  const key = `tasks.categories.${cat.name}`;
  const translated = t(key);
  if (translated !== key) return translated;
  return cat.name;
}
