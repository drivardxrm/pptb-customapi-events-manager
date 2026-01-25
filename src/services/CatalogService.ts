import { Catalog, CatalogCreateable, CatalogUpdateable } from "../models/Catalog";
import { buildCreatePayload, buildUpdatePayload } from "../utils/diff";
import { EntityService } from "./EntityService";


export type CatalogUpdateResult = {
    updated: boolean;
    payload: Record<string, unknown>;
};

export type CatalogCreateResult = {
    created: boolean;
    payload: Record<string, unknown>;
    catalogId: string;
};

export type CatalogDeleteResult = {
    deleted: boolean;
}

export class CatalogService extends EntityService {
    entityName = 'catalog';
    entityCollectionName = 'catalogs';

    // Define lookups here to avoid circular dependency with Catalog model
    private static get CatalogLookups(): Partial<Record<keyof CatalogCreateable, [string, EntityService]>> {
        return {
            _parentcatalogid_value: ['ParentCatalogId', new CatalogService()],
        };
    }

    async fetchAllCatalogs(): Promise<Catalog[]> {
        const result = await window.dataverseAPI.queryData(this.entityCollectionName);
        //console.log('CustomApiService.fetchAll result:', result);
        const typed = result as unknown as { value: Catalog[] };
        return typed.value;
    }
    
    async fetchSolutionCatalogs(solutionid:string): Promise<Catalog[]> {
        const result = await window.dataverseAPI.fetchXmlQuery(`
            <fetch>
                <entity name='${this.entityName}'>
                    <link-entity name='solutioncomponent' from='objectid' to='${this.entityName}id' link-type='inner' alias='sc'>
                    <filter>
                        <condition attribute='solutionid' operator='eq' value='${solutionid}' />
                    </filter>
                    </link-entity>
                </entity>
            </fetch>
        `);
        //console.log('CustomApiService.fetchAll result:', result);
        const typed = result as unknown as { value: Catalog[] };
        return typed.value;
    }

    async createCatalog(newCatalog: CatalogCreateable, solutionUniqueName?: string): Promise<CatalogCreateResult> {
            
            const payload = buildCreatePayload<CatalogCreateable>(newCatalog, {
                lookupKeys: CatalogService.CatalogLookups,
            });
    
            let result = await window.dataverseAPI.create(this.entityName, payload);
            
            // If a solution is specified, add the Catalog to that solution
            if (solutionUniqueName && result.id) {
                await window.dataverseAPI.execute({
                    operationName: 'AddSolutionComponent',
                    operationType: 'action',
                    parameters: {
                        ComponentId: result.id,
                        ComponentType: 10017, // Catalog component type
                        SolutionUniqueName: solutionUniqueName,
                        AddRequiredComponents: false,
                        DoNotIncludeSubcomponents: false,
                        IncludedComponentSettingsValues: null
                    }
                });
            }
            
            return { created: true, payload, catalogId: result.id };
        }
    
    
        async updateCatalog(current: Catalog, next: CatalogUpdateable): Promise<CatalogUpdateResult> {
            
            const payload = buildUpdatePayload<CatalogUpdateable>(current, next, {
                lookupKeys: CatalogService.CatalogLookups,
            });
    
            if (Object.keys(payload).length === 0) {
                return { updated: false, payload };
            }
    
            await window.dataverseAPI.update(this.entityName, current.catalogid, payload);
            return { updated: true, payload };
        }
    
        async deleteCatalog(catalogId: string): Promise<CatalogDeleteResult> {
            await window.dataverseAPI.delete(this.entityName, catalogId);
            return { deleted: true };
        }


}

export const catalogService = new CatalogService();