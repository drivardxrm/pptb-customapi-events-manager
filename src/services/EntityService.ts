export abstract class EntityService {
  abstract entityName: string;
  abstract entityCollectionName: string;
  componenttype?: number;

  getOdataLookupTemplate(id: string | null): string | null {
    return id ? `${this.entityCollectionName}(${id})` : null;
  }

  async deleteRecord(id: string): Promise<DeleteResult> {
      await window.dataverseAPI.delete(this.entityName, id);
      return { deleted: true };
  }

  async addToSolution(recordId: string, solutionUniqueName: string): Promise<void> {
      if (!this.componenttype) {
          throw new Error('Component type is not defined for this entity service.');
      }
      await window.dataverseAPI.execute({
        operationName: 'AddSolutionComponent',
        operationType: 'action',
        parameters: {
          ComponentId: recordId,
          ComponentType: this.componenttype, // Custom API component type
          SolutionUniqueName: solutionUniqueName,
          AddRequiredComponents: false,
          DoNotIncludeSubcomponents: false,
          IncludedComponentSettingsValues: null
        }
      });
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