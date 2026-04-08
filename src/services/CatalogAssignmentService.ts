
import { CatalogAssignment } from "../models/CatalogAssignment";
import { EntityService } from "./EntityService";



export class CatalogAssignmentService extends EntityService {
    entityName = 'catalogassignment';
    entityCollectionName = 'catalogassignments';
    

   
    async fetchAllCatalogAssignments(): Promise<CatalogAssignment[]> {
        const result = await window.dataverseAPI.queryData(this.entityCollectionName);
        //console.log('CustomApiService.fetchAll result:', result);
        const typed = result as unknown as { value: CatalogAssignment[] };
        return typed.value;
    }
    
    

    
    
}

export const catalogAssignmentService = new CatalogAssignmentService();