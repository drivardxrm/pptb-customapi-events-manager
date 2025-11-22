import { CustomApi, CustomApiLookups, CustomApiUpdateable } from '../models/CustomApi';
import { buildDiffPayload } from '../utils/diff';
import { EntityService } from './EntityService';

export type CustomApiUpdateResult = {
    updated: boolean;
    payload: Record<string, unknown>;
};

export class CustomApiService extends EntityService {
    entityName = 'customapi';
    entityCollectionName = 'customapis';

    async fetchAll() {
        const result = await window.dataverseAPI.queryData(this.entityCollectionName);
        return result as unknown as { value: CustomApi[] };
    }

    private toUpdateable(current: CustomApi): CustomApiUpdateable {
        return {
            name: current.name,
            displayname: current.displayname,
            description: current.description,
            executeprivilegename: current.executeprivilegename,
            _plugintypeid_value: current._plugintypeid_value,
            isprivate: current.isprivate,
            iscustomizable: current.iscustomizable,
        };
    }

    async updateCustomApi(current: CustomApi, next: CustomApiUpdateable): Promise<CustomApiUpdateResult> {
        const comparableCurrent = this.toUpdateable(current);
        const payload = buildDiffPayload<CustomApiUpdateable>(comparableCurrent, next, {
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