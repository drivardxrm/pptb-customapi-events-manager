import { RefObject, useCallback, useEffect, useLayoutEffect, useState } from 'react';

type SwitchLabelRef = RefObject<HTMLSpanElement | null>;

type ColumnRefGroups = ReadonlyArray<ReadonlyArray<SwitchLabelRef>>;

/**
 * Returns min-width values (in pixels) for each column of switch labels. Adds padding to the widest label in each group.
 */
export const useDynamicColumnWidths = (
  refGroups: ColumnRefGroups,
  padding = 15
): number[] => {
  const [widths, setWidths] = useState<number[]>([]);

  const measureLabel = useCallback((ref: SwitchLabelRef) => {
    if (!ref.current) {
      return 0;
    }

    const previousMinWidth = ref.current.style.minWidth;
    ref.current.style.minWidth = '0px';
    const width = ref.current.getBoundingClientRect().width;
    ref.current.style.minWidth = previousMinWidth;
    return width;
  }, []);

  const updateWidths = useCallback(() => {
    const nextWidths = refGroups.map((group) => {
      if (!group.length) {
        return 0;
      }

      const maxLabelWidth = group.reduce((max, ref) => {
        const measured = measureLabel(ref);
        return measured > max ? measured : max;
      }, 0);

      return maxLabelWidth ? Math.ceil(maxLabelWidth + padding) : 0;
    });

    setWidths((prev) => {
      if (prev.length === nextWidths.length && prev.every((value, index) => value === nextWidths[index])) {
        return prev;
      }
      return nextWidths;
    });
  }, [measureLabel, padding, refGroups]);

  useLayoutEffect(() => {
    updateWidths();
  }, [updateWidths]);

  useEffect(() => {
    window.addEventListener('resize', updateWidths);
    return () => {
      window.removeEventListener('resize', updateWidths);
    };
  }, [updateWidths]);

  return widths;
};
