import { CustomApiResponseProperty, CustomApiResponsePropertyCreateable, CustomApiResponsePropertyLookups, CustomApiResponsePropertyUpdateable } from "../models/CustomApiResponseProperty";
import { buildCreatePayload, buildUpdatePayload } from "../utils/diff";
import { EntityService, CreateResult, UpdateResult } from "./EntityService";


export class CustomApiResponsePropertyService extends EntityService {
    entityName = 'customapiresponseproperty';
    entityCollectionName = 'customapiresponseproperties';

    async createCustomApiResponseProperty(newCustomApiResponseProperty: CustomApiResponsePropertyCreateable): Promise<CreateResult> {
                
            const payload = buildCreatePayload<CustomApiResponsePropertyCreateable>(newCustomApiResponseProperty, {
                lookupKeys: CustomApiResponsePropertyLookups,
            });
    
            let result = await window.dataverseAPI.create(this.entityName,  payload);
            return { created: true, payload, id: result.id };
        }
    
    
    async updateCustomApiResponseProperty(current: CustomApiResponseProperty, next: CustomApiResponsePropertyUpdateable): Promise<UpdateResult> {
            
        const payload = buildUpdatePayload<CustomApiResponsePropertyUpdateable>(current, next);

        if (Object.keys(payload).length === 0) {
            return { updated: false, payload };
        }

        await window.dataverseAPI.update(this.entityName, current.customapiresponsepropertyid, payload);
        return { updated: true, payload };
    }
}
export const customApiResponsePropertyService = new CustomApiResponsePropertyService();