import { CustomApi, CustomApiCreateable, CustomApiLookups, CustomApiUpdateable } from '../models/CustomApi';
import { buildCreatePayload, buildUpdatePayload } from '../utils/diff';
import { EntityService } from './EntityService';

export type CustomApiUpdateResult = {
    updated: boolean;
    payload: Record<string, unknown>;
};

export type CustomApiCreateResult = {
    created: boolean;
    payload: Record<string, unknown>;
    customApiId: string;
};

export class CustomApiService extends EntityService {
    entityName = 'customapi';
    entityCollectionName = 'customapis';

    async fetchAll(): Promise<CustomApi[]> {
        const result = await window.dataverseAPI.queryData(this.entityCollectionName);
        //console.log('CustomApiService.fetchAll result:', result);
        const typed = result as unknown as { value: CustomApi[] };
        return typed.value;
    }

    async createCustomApi(newCustomApi: CustomApiCreateable): Promise<CustomApiCreateResult> {
        
        const payload = buildCreatePayload<CustomApiUpdateable>(newCustomApi, {
            lookupKeys: CustomApiLookups,
        });

        let result = await window.dataverseAPI.create(this.entityName,  payload);
        return { created: true, payload, customApiId: result.id };
    }


    async updateCustomApi(current: CustomApi, next: CustomApiUpdateable): Promise<CustomApiUpdateResult> {
        
        const payload = buildUpdatePayload<CustomApiUpdateable>(current, next, {
            lookupKeys: CustomApiLookups,
        });

        if (Object.keys(payload).length === 0) {
            return { updated: false, payload };
        }

        await window.dataverseAPI.update(this.entityName, current.customapiid, payload);
        return { updated: true, payload };
    }
}

export const customApiService = new CustomApiService();