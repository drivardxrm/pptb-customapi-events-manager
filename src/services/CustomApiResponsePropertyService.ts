import { CustomApiResponseProperty, CustomApiResponsePropertyCreateable, CustomApiResponsePropertyLookups, CustomApiResponsePropertyUpdateable } from "../models/CustomApiResponseProperty";
import { buildCreatePayload, buildUpdatePayload } from "../utils/diff";
import { EntityService } from "./EntityService";

export type CustomApiResponsePropertyCreateResult = {
    created: boolean;
    payload: Record<string, unknown>;
    customApiResponsePropertyId: string;
};

// todo make a more generic type for this
export type CustomApiResponsePropertyUpdateResult = {
    updated: boolean;
    payload: Record<string, unknown>;
};



export class CustomApiResponsePropertyService extends EntityService {
    entityName = 'customapiresponseproperty';
    entityCollectionName = 'customapiresponseproperties';

    async createCustomApiResponseProperty(newCustomApiResponseProperty: CustomApiResponsePropertyCreateable): Promise<CustomApiResponsePropertyCreateResult> {
                
            const payload = buildCreatePayload<CustomApiResponsePropertyCreateable>(newCustomApiResponseProperty, {
                lookupKeys: CustomApiResponsePropertyLookups,
            });
    
            let result = await window.dataverseAPI.create(this.entityName,  payload);
            return { created: true, payload, customApiResponsePropertyId: result.id };
        }
    
    
    async updateCustomApiResponseProperty(current: CustomApiResponseProperty, next: CustomApiResponsePropertyUpdateable): Promise<CustomApiResponsePropertyUpdateResult> {
            
        const payload = buildUpdatePayload<CustomApiResponsePropertyUpdateable>(current, next);

        if (Object.keys(payload).length === 0) {
            return { updated: false, payload };
        }

        await window.dataverseAPI.update(this.entityName, current.customapiresponsepropertyid, payload);
        return { updated: true, payload };
    }
}
export const customApiResponsePropertyService = new CustomApiResponsePropertyService();