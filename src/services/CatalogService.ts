import { Catalog, CatalogCreateable, CatalogUpdateable } from "../models/Catalog";
import { buildCreatePayload, buildUpdatePayload } from "../utils/diff";
import { UpdateResult, CreateResult, EntityService } from "./EntityService";
import { PublisherService } from "./PublisherService";



export class CatalogService extends EntityService {
    entityName = 'catalog';
    entityCollectionName = 'catalogs';
    componenttype = 10017;

    // Define lookups here to avoid circular dependency with Catalog model
    private static get CatalogLookups(): Partial<Record<keyof CatalogCreateable, [string, EntityService]>> {
        return {
            _parentcatalogid_value: ['ParentCatalogId', new CatalogService()],
            _publisherid_value: ['PublisherId', new PublisherService()],
        };
    }

    async fetchAllCatalogs(): Promise<Catalog[]> {
        const result = await window.dataverseAPI.queryData(this.entityCollectionName);
        const typed = result as unknown as { value: Catalog[] };
        return typed.value;
    }
    
    async fetchSolutionCatalogs(solutionid: string): Promise<Catalog[]> {
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
        const typed = result as unknown as { value: Catalog[] };
        return typed.value;
    }

    async fetchRootCatalogs(solutionid: string): Promise<Catalog[]> {
        const result = await window.dataverseAPI.fetchXmlQuery(`
            <fetch>
                <entity name='${this.entityName}'>
                    <filter>
                        <condition attribute='parentcatalogid' operator='null' />
                    </filter>
                    <link-entity name='solutioncomponent' from='objectid' to='${this.entityName}id' link-type='inner' alias='sc'>
                    <filter>
                        <condition attribute='solutionid' operator='eq' value='${solutionid}' />
                    </filter>
                    </link-entity>
                </entity>
            </fetch>
        `);
        const typed = result as unknown as { value: Catalog[] };
        return typed.value;
    }

    async fetchCategoryChildren(parentCatalogId: string): Promise<Catalog[]> {
        const result = await window.dataverseAPI.fetchXmlQuery(`
            <fetch>
                <entity name='${this.entityName}'>
                    <filter>
                        <condition attribute='parentcatalogid' operator='eq' value='${parentCatalogId}' />
                    </filter>
                </entity>
            </fetch>
        `);
        const typed = result as unknown as { value: Catalog[] };
        return typed.value;
    }

    async createCatalog(newCatalog: CatalogCreateable, solutionUniqueName?: string): Promise<CreateResult> {
            
        const payload = buildCreatePayload<CatalogCreateable>(newCatalog, {
            lookupKeys: CatalogService.CatalogLookups,
        });

        let result = await window.dataverseAPI.create(this.entityName, payload);
        
        // If a solution is specified, add the catalog to that solution
        if (solutionUniqueName && result.id) {
            await this.addToSolution(result.id, solutionUniqueName);
        }
        
        return { created: true, payload, id: result.id };
    }


    async updateCatalog(current: Catalog, next: CatalogUpdateable): Promise<UpdateResult> {
        
        const payload = buildUpdatePayload<CatalogUpdateable>(current, next, {
            lookupKeys: CatalogService.CatalogLookups,
        });

        if (Object.keys(payload).length === 0) {
            return { updated: false, payload };
        }

        await window.dataverseAPI.update(this.entityName, current.catalogid, payload);
        return { updated: true, payload };
    }
    
}

export const catalogService = new CatalogService();