import { CustomApi, CustomApiCreateable, CustomApiLookups, CustomApiUpdateable } from '../models/CustomApi';
import { buildCreatePayload, buildUpdatePayload } from '../utils/diff';
import { EntityService, CreateResult, UpdateResult, DeleteResult } from './EntityService';



export class CustomApiService extends EntityService {
    entityName = 'customapi';
    entityCollectionName = 'customapis';

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

    async createCustomApi(newCustomApi: CustomApiCreateable, solutionUniqueName?: string): Promise<CreateResult> {
        
        const payload = buildCreatePayload<CustomApiCreateable>(newCustomApi, {
            lookupKeys: CustomApiLookups,
        });

        let result = await window.dataverseAPI.create(this.entityName, payload);
        
        // If a solution is specified, add the custom API to that solution
        if (solutionUniqueName && result.id) {
            await window.dataverseAPI.execute({
                operationName: 'AddSolutionComponent',
                operationType: 'action',
                parameters: {
                    ComponentId: result.id,
                    ComponentType: 10020, // Custom API component type
                    SolutionUniqueName: solutionUniqueName,
                    AddRequiredComponents: false,
                    DoNotIncludeSubcomponents: false,
                    IncludedComponentSettingsValues: null
                }
            });
        }
        
        return { created: true, payload, id: result.id };
    }


    async updateCustomApi(current: CustomApi, next: CustomApiUpdateable): Promise<UpdateResult> {
        
        const payload = buildUpdatePayload<CustomApiUpdateable>(current, next, {
            lookupKeys: CustomApiLookups,
        });

        if (Object.keys(payload).length === 0) {
            return { updated: false, payload };
        }

        await window.dataverseAPI.update(this.entityName, current.customapiid, payload);
        return { updated: true, payload };
    }

    async deleteCustomApi(customApiId: string): Promise<DeleteResult> {
        await window.dataverseAPI.delete(this.entityName, customApiId);
        return { deleted: true };
    }
}

export const customApiService = new CustomApiService();