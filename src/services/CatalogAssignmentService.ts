import { CatalogAssignment, CatalogAssignmentCreateable, CatalogAssignmentLookups, CatalogAssignmentUpdateable } from "../models/CatalogAssignment";
import { buildCreatePayload, buildUpdatePayload } from "../utils/diff";
import { EntityService, CreateResult, UpdateResult } from "./EntityService";
import { CatalogService } from "./CatalogService";


export class CatalogAssignmentService extends EntityService {
    entityName = 'catalogassignment';
    entityCollectionName = 'catalogassignments';
    componenttype = 10018;

    // Lookups for OData binding - note _object_value is polymorphic and handled specially
    private static get CatalogAssignmentLookups(): Partial<Record<keyof CatalogAssignmentCreateable, [string, EntityService]>> {
        return {
            _catalogid_value: ['CatalogId', new CatalogService()],
            // _object_value is polymorphic - handled via custom payload building
        };
    }
   
    async fetchAllCatalogAssignments(): Promise<CatalogAssignment[]> {
        const result = await window.dataverseAPI.queryData(this.entityCollectionName);
        const typed = result as unknown as { value: CatalogAssignment[] };
        return typed.value;
    }

    async fetchSolutionAssignments(solutionid: string): Promise<CatalogAssignment[]> {
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
        const typed = result as unknown as { value: CatalogAssignment[] };
        return typed.value;
    }

    async fetchAssignmentsByCatalog(catalogid: string): Promise<CatalogAssignment[]> {
        const result = await window.dataverseAPI.fetchXmlQuery(`
            <fetch>
                <entity name='${this.entityName}'>
                    <filter>
                        <condition attribute='catalogid' operator='eq' value='${catalogid}' />
                    </filter>
                </entity>
            </fetch>
        `);
        const typed = result as unknown as { value: CatalogAssignment[] };
        return typed.value;
    }

    async createCatalogAssignment(
        newAssignment: CatalogAssignmentCreateable, 
        objectEntityName: string,
        solutionUniqueName?: string
    ): Promise<CreateResult> {
        // Build base payload with standard lookups
        const payload = buildCreatePayload<CatalogAssignmentCreateable>(newAssignment, {
            lookupKeys: CatalogAssignmentService.CatalogAssignmentLookups,
            skipKeys: ['_object_value'], // Handle polymorphic lookup separately
        });

        // Handle polymorphic _object_value lookup based on objectEntityName
        if (newAssignment._object_value) {
            // Determine the collection name for the object entity
            const objectCollectionName = this.getCollectionName(objectEntityName);
            payload['Object@odata.bind'] = `${objectCollectionName}(${newAssignment._object_value})`;
        }

        let result = await window.dataverseAPI.create(this.entityName, payload);
        
        // If a solution is specified, add the assignment to that solution
        if (solutionUniqueName && result.id) {
            await this.addToSolution(result.id, solutionUniqueName);
        }
        
        return { created: true, payload, id: result.id };
    }

    async updateCatalogAssignment(current: CatalogAssignment, next: CatalogAssignmentUpdateable): Promise<UpdateResult> {
        const payload = buildUpdatePayload<CatalogAssignmentUpdateable>(current, next, {
            lookupKeys: CatalogAssignmentLookups,
        });

        if (Object.keys(payload).length === 0) {
            return { updated: false, payload };
        }

        await window.dataverseAPI.update(this.entityName, current.catalogassignmentid, payload);
        return { updated: true, payload };
    }

    // Helper to get collection name for polymorphic object binding
    private getCollectionName(entityName: string): string {
        // Standard pluralization for known entities
        const collectionMap: Record<string, string> = {
            'customapi': 'customapis',
            'workflow': 'workflows',
            'entity': 'entities',
        };
        return collectionMap[entityName] || `${entityName}s`;
    }
}

export const catalogAssignmentService = new CatalogAssignmentService();