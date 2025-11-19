export const toNullable = (value?: string | null) => {
  const trimmed = value?.trim?.();
  return trimmed ? trimmed : null;
};
