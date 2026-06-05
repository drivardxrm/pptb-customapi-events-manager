export abstract class EntityService {
  abstract entityName: string;
  abstract entityCollectionName: string;

  getOdataLookupTemplate(id: string | null): string | null {
    return id ? `${this.entityCollectionName}(${id})` : null;
  }

  protected ensureComponentType(componentType?: number | null): number {
    if (typeof componentType !== 'number') {
      throw new Error(`Component type metadata could not be resolved for '${this.entityName}'.`);
    }

    return componentType;
  }

  async deleteRecord(id: string): Promise<DeleteResult> {
      await window.dataverseAPI.delete(this.entityName, id);
      return { deleted: true };
  }

  async addToSolution(recordId: string, solutionUniqueName: string, componentType?: number | null): Promise<void> {
      await window.dataverseAPI.execute({
        operationName: 'AddSolutionComponent',
        operationType: 'action',
        parameters: {
          ComponentId: recordId,
          ComponentType: this.ensureComponentType(componentType),
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