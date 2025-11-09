import { SelectableItem } from '../components/GenericTagPicker';
import { LockClosedKey24Regular, LockOpen24Regular } from '@fluentui/react-icons';

export interface Solution {
  solutionid: string;
  uniquename: string;
  friendlyname: string;
  version: string;
  ismanaged: boolean;
}

/**
 * Transforms a SolutionDto into a SelectableItem for picker components.
 */
export function solutionDtoToSelectableItem(solution: Solution): SelectableItem {
  return {
    id: solution.solutionid,
    displayText: solution.uniquename,
    image: solution.ismanaged ? <LockClosedKey24Regular /> : <LockOpen24Regular /> // Optionally add an icon here
  };
}

