export enum WordForms {
  POINTS = 'POINTS',
  STEPS = 'STEPS',
}

/**
 * Правила склонения слова
 */
interface DeclensionRules {
  /** Форма для 1 (например: "1 балл") */
  singular: string;
  /** Форма для 2-4 (например: "2 балла") */
  dual: string;
  /** Форма для 5+ (например: "5 баллов") */
  plural: string;
  /**
   * Форма для 11-14 (опционально)
   * Если не указано, будет использоваться plural
   * Пример: "11 баллов" (но для некоторых слов могут быть исключения)
   */
  specialCase11To14?: string;
}

const DECLENSION_RULES: Record<WordForms, DeclensionRules> = {
  [WordForms.POINTS]: {
    singular: 'балл',
    dual: 'балла',
    plural: 'баллов',
  },
  [WordForms.STEPS]: {
    singular: 'шаг',
    dual: 'шага',
    plural: 'шагов',
  },
};

function getWordWithForm(count: number, rules: DeclensionRules) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  // Особый случай для чисел 11-14
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14 && rules.specialCase11To14) {
    return `${count} ${rules.specialCase11To14}`;
  }

  // Стандартные правила
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${count} ${rules.plural}`;
  }

  switch (lastDigit) {
    case 1:
      return `${count} ${rules.singular}`;
    case 2:
    case 3:
    case 4:
      return `${count} ${rules.dual}`;
    default:
      return `${count} ${rules.plural}`;
  }
}

function declineWord(count: number, wordForm: WordForms): string {
  return getWordWithForm(count, DECLENSION_RULES[wordForm]);
}

export function getPointsWord(count: number): string {
  return declineWord(count, WordForms.POINTS);
}

export function getStepsWord(count: number): string {
  return declineWord(count, WordForms.STEPS);
}
