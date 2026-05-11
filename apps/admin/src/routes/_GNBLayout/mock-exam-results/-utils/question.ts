export const parseQuestionText = (question: string): string => {
  try {
    const parsed = JSON.parse(question) as { data?: unknown };
    return typeof parsed.data === 'string' ? parsed.data : '';
  } catch {
    return question;
  }
};

export const getQuestionDisplayText = (question?: string | null): string | null => {
  if (question === null || question === undefined) return null;

  const parsedText = parseQuestionText(question);
  return parsedText.length > 0 ? parsedText : question;
};
