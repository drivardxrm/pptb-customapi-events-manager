import { CustomApiRequestParameter, CustomApiRequestParameterUpdateable } from "../models/CustomApiRequestParameter";
import { buildDiffPayload } from "../utils/diff";
import { EntityService } from "./EntityService";

// todo make a more generic type for this
export type CustomApiRequestParameterUpdateResult = {
    updated: boolean;
    payload: Record<string, unknown>;
};

export class CustomApiRequestParameterService extends EntityService {
    entityName = 'customapirequestparameter';
    entityCollectionName = 'customapirequestparameters';

    async updateCustomApiRequestParameter(current: CustomApiRequestParameter, next: CustomApiRequestParameterUpdateable): Promise<CustomApiRequestParameterUpdateResult> {
            
        const payload = buildDiffPayload<CustomApiRequestParameterUpdateable>(current, next);

        if (Object.keys(payload).length === 0) {
            return { updated: false, payload };
        }

        await window.dataverseAPI.update(this.entityName, current.customapirequestparameterid, payload);
        return { updated: true, payload };
    }
}
export const customApiRequestParameterService = new CustomApiRequestParameterService();