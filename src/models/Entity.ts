export interface Entity {
  entityid: string;
  logicalname: string;
  objecttypecode: number | null;
}

// used in customapi tester for entity reference parameters
export interface EntityReferenceValue {
    entityLogicalName: string;
    recordId: string;
    primaryIdAttribute: string;
    isExpando?: boolean;
}