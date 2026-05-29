import { CustomApiResponseProperty, CustomApiResponsePropertyCreateInput, CustomApiResponsePropertyLookups, CustomApiResponsePropertyUpdateInput } from "../models/CustomApiResponseProperty";
import { buildCreatePayload, buildUpdatePayload } from "../utils/diff";
import { EntityService, CreateResult, UpdateResult } from "./EntityService";


export class CustomApiResponsePropertyService extends EntityService {
    entityName = 'customapiresponseproperty';
    entityCollectionName = 'customapiresponseproperties';
    componenttype = 10022;

    async createCustomApiResponseProperty(newCustomApiResponseProperty: CustomApiResponsePropertyCreateInput, solutionUniqueName?: string): Promise<CreateResult> {
                
            const payload = buildCreatePayload<CustomApiResponsePropertyCreateInput>(newCustomApiResponseProperty, {
                lookupKeys: CustomApiResponsePropertyLookups,
            });
    
            let result = await window.dataverseAPI.create(this.entityName,  payload);
            
            // If a solution is specified, add the custom API to that solution
            if (solutionUniqueName && result.id) {
                await this.addToSolution(result.id, solutionUniqueName);
            }
            
            return { created: true, payload, id: result.id };
        }
    
    
    async updateCustomApiResponseProperty(current: CustomApiResponseProperty, next: CustomApiResponsePropertyUpdateInput): Promise<UpdateResult> {
        const payload = buildUpdatePayload<CustomApiResponsePropertyUpdateInput>(current, next);

        if (Object.keys(payload).length === 0) {
            return { updated: false, payload };
        }

        await window.dataverseAPI.update(this.entityName, current.customapiresponsepropertyid, payload);
        return { updated: true, payload };
    }
}
export const customApiResponsePropertyService = new CustomApiResponsePropertyService();