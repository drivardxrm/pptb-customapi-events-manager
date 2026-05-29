import { CustomApi, CustomApiCreateInput, CustomApiLookups, CustomApiUpdateInput } from '../models/CustomApi';
import { buildCreatePayload, buildUpdatePayload } from '../utils/diff';
import { EntityService, CreateResult, UpdateResult } from './EntityService';



export class CustomApiService extends EntityService {
    entityName = 'customapi';
    entityCollectionName = 'customapis';
    componenttype = 10020;

    async fetchAllCustomApi(): Promise<CustomApi[]> {
        const result = await window.dataverseAPI.queryData(this.entityCollectionName);
        //console.log('CustomApiService.fetchAll result:', result);
        const typed = result as unknown as { value: CustomApi[] };
        return typed.value;
    }

    async fetchSolutionCustomApi(solutionid:string): Promise<CustomApi[]> {
        const result = await window.dataverseAPI.fetchXmlQuery(`
            <fetch>
                <entity name='customapi'>
                    <link-entity name='solutioncomponent' from='objectid' to='customapiid' link-type='inner' alias='sc'>
                    <filter>
                        <condition attribute='solutionid' operator='eq' value='${solutionid}' />
                    </filter>
                    </link-entity>
                </entity>
            </fetch>
        `);
        //console.log('CustomApiService.fetchAll result:', result);
        const typed = result as unknown as { value: CustomApi[] };
        return typed.value;
    }

    async createCustomApi(newCustomApi: CustomApiCreateInput, solutionUniqueName?: string): Promise<CreateResult> {
        
        const payload = buildCreatePayload<CustomApiCreateInput>(newCustomApi, {
            lookupKeys: CustomApiLookups,
        });

        let result = await window.dataverseAPI.create(this.entityName, payload);
        
        // If a solution is specified, add the custom API to that solution
        if (solutionUniqueName && result.id) {
            await this.addToSolution(result.id, solutionUniqueName);
        }
        
        return { created: true, payload, id: result.id };
    }


    async updateCustomApi(current: CustomApi, next: CustomApiUpdateInput): Promise<UpdateResult> {
        
        const payload = buildUpdatePayload<CustomApiUpdateInput>(current, next, {
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