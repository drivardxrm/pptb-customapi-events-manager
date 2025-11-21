export abstract class EntityService {
  abstract entityName: string;
  abstract entityCollectionName: string;

  getOdataLookupTemplate(id: string | null): string | null {
    return id ? `${this.entityCollectionName}(${id})` : null;
  }
}