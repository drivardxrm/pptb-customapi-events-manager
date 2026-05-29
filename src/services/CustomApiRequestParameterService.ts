import { CustomApiRequestParameter, CustomApiRequestParameterCreateInput, CustomApiRequestParameterLookups, CustomApiRequestParameterUpdateInput } from "../models/CustomApiRequestParameter";
import { buildCreatePayload, buildUpdatePayload } from "../utils/diff";
import { EntityService, UpdateResult, CreateResult, } from "./EntityService";




export class CustomApiRequestParameterService extends EntityService {
    entityName = 'customapirequestparameter';
    entityCollectionName = 'customapirequestparameters';
    componenttype = 10021;


    async createCustomApiRequestParameter(newCustomApiRequestParameter: CustomApiRequestParameterCreateInput, solutionUniqueName?: string): Promise<CreateResult> {
        const payload = buildCreatePayload<CustomApiRequestParameterCreateInput>(newCustomApiRequestParameter, {
            lookupKeys: CustomApiRequestParameterLookups,
        });

        let result = await window.dataverseAPI.create(this.entityName,  payload);
        
        // If a solution is specified, add the custom API to that solution
        if (solutionUniqueName && result.id) {
            await this.addToSolution(result.id, solutionUniqueName);
        }

        return { created: true, payload, id: result.id };
    }


    async updateCustomApiRequestParameter(current: CustomApiRequestParameter, next: CustomApiRequestParameterUpdateInput): Promise<UpdateResult> {
        const payload = buildUpdatePayload<CustomApiRequestParameterUpdateInput>(current, next);

        if (Object.keys(payload).length === 0) {
            return { updated: false, payload };
        }

        await window.dataverseAPI.update(this.entityName, current.customapirequestparameterid, payload);
        return { updated: true, payload };
    }

    
}
export const customApiRequestParameterService = new CustomApiRequestParameterService();