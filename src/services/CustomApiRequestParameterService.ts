import { CustomApiRequestParameter, CustomApiRequestParameterCreateable, CustomApiRequestParameterLookups, CustomApiRequestParameterUpdateable } from "../models/CustomApiRequestParameter";
import { buildCreatePayload, buildUpdatePayload } from "../utils/diff";
import { EntityService, UpdateResult, CreateResult } from "./EntityService";




export class CustomApiRequestParameterService extends EntityService {
    entityName = 'customapirequestparameter';
    entityCollectionName = 'customapirequestparameters';


    async createCustomApiRequestParameter(newCustomApiRequestParameter: CustomApiRequestParameterCreateable): Promise<CreateResult> {
            
        const payload = buildCreatePayload<CustomApiRequestParameterCreateable>(newCustomApiRequestParameter, {
            lookupKeys: CustomApiRequestParameterLookups,
        });

        let result = await window.dataverseAPI.create(this.entityName,  payload);
        return { created: true, payload, id: result.id };
    }


    async updateCustomApiRequestParameter(current: CustomApiRequestParameter, next: CustomApiRequestParameterUpdateable): Promise<UpdateResult> {
            
        const payload = buildUpdatePayload<CustomApiRequestParameterUpdateable>(current, next);

        if (Object.keys(payload).length === 0) {
            return { updated: false, payload };
        }

        await window.dataverseAPI.update(this.entityName, current.customapirequestparameterid, payload);
        return { updated: true, payload };
    }
}
export const customApiRequestParameterService = new CustomApiRequestParameterService();