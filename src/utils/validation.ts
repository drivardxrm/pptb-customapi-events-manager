
export interface ValidationStatus {
    isValid: boolean;
    message?: string;
}

export const normalizeValidationValue = (value?: string | null) =>
    value?.trim().toLowerCase() ?? '';

export const hasCaseInsensitiveMatch = <T>(
    items: T[],
    candidate: string | null | undefined,
    getValue: (item: T) => string | null | undefined
) => {
    const normalizedCandidate = normalizeValidationValue(candidate);

    if (!normalizedCandidate) {
        return false;
    }

    return items.some((item) => normalizeValidationValue(getValue(item)) === normalizedCandidate);
};