export abstract class EntityService {
  abstract entityName: string;
  abstract entityCollectionName: string;

  getOdataLookupTemplate(id: string | null): string | null {
    return id ? `${this.entityCollectionName}(${id})` : null;
  }
}

// Generic result types for create, update, delete operations
export type UpdateResult = {
    updated: boolean;
    payload: Record<string, unknown>;
};

export type CreateResult = {
    created: boolean;
    payload: Record<string, unknown>;
    id: string;
};

export type DeleteResult = {
    deleted: boolean;
}