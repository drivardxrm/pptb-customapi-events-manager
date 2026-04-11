import { Publisher } from "../models/Publisher";
import { EntityService } from "./EntityService";


export class PublisherService extends EntityService {
    entityName = 'publisher';
    entityCollectionName = 'publishers';

    async fetchAllPublishers(): Promise<Publisher[]> {
        const result = await window.dataverseAPI.queryData(this.entityCollectionName);
        const typed = result as unknown as { value: Publisher[] };
        return typed.value;
    }
}

export const publisherService = new PublisherService();
