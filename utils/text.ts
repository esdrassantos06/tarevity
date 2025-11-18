/**
 * Formats a text to start with a capital letter
 * @param value - The text to format
 * @returns The formatted text
 */
export function formatText(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

type Translator = (key: string) => string;

/**
 * Translates task priority values (LOW, MEDIUM, HIGH)
 * @param priority - The priority value from the API
 * @param t - Translation function from next-intl (useTranslations or getTranslations) - must be in 'EditTaskPage.form' namespace
 * @returns Translated priority string
 */
export function translatePriority(
  priority: 'LOW' | 'MEDIUM' | 'HIGH',
  t: Translator,
): string {
  return t(`priorities.${priority}`);
}

/**
 * Translates task status values (ACTIVE, REVIEW, COMPLETED)
 * @param status - The status value from the API
 * @param t - Translation function from next-intl (useTranslations or getTranslations) - must be in 'EditTaskPage.form' namespace
 * @returns Translated status string
 */
export function translateStatus(
  status: 'ACTIVE' | 'REVIEW' | 'COMPLETED',
  t: Translator,
): string {
  return t(`statuses.${status}`);
}
