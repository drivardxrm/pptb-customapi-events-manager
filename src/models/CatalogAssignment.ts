import React, { createElement } from "react";
import { EntityService } from "../services/EntityService";
import { TableRegular, PlugConnectedRegular, PlayRegular } from "@fluentui/react-icons";


export interface CatalogAssignment  {
  catalogassignmentid: string;
  name: string;
  objectname: string;
  ismanaged: boolean;
  ownerid: string;
  _catalogid_value: string;
  '_catalogid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  '_catalogid_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_catalogid_value@OData.Community.Display.V1.FormattedValue': string;
  _object_value: string;
  '_object_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  '_object_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_object_value@OData.Community.Display.V1.FormattedValue': string;
  solutionid: string;
  statecode: CatalogAssignmentstatecode;
  statuscode: CatalogAssignmentstatuscode;
}


// Properties needed at creation time
export interface CatalogAssignmentCreateable  extends 
  Pick<CatalogAssignment,   
  'name' |   
  '_catalogid_value' | 
  '_object_value'
  > {}


// Properties that can be modified after creation
export interface CatalogAssignmentUpdateable extends 
  Pick<CatalogAssignment,  
  'name'    
  > {}

// Lookups map for binding lookup fields to OData format
// Note: _catalogid_value and _object_value require special handling due to polymorphic nature
// They are handled directly in CatalogAssignmentService rather than via standard lookups
export const CatalogAssignmentLookups: Partial<Record<keyof CatalogAssignmentCreateable, [string, EntityService]>> = {
  // Lookups handled in service due to polymorphic object binding
};


// The lookup annotation field name (use this key to access the object type value)
export const OBJECT_TYPE_ANNOTATION = '_object_value@Microsoft.Dynamics.CRM.lookuplogicalname';

// Maps Dataverse entity logical names to display labels
export const ObjectIdTypeLabels: Record<string, string> = {
  'customapi': 'Custom API',
  'entity': 'Table',
  'workflow': 'Custom Process Action'
};

// Icon mapping for object type values (entity logical names from the annotation)
export const objectIdTypeIcons: Record<string, React.JSX.Element> = {
  'entity': createElement(TableRegular),
  'customapi': createElement(PlugConnectedRegular),
  'workflow': createElement(PlayRegular),
};

// Helper to get the object type from an assignment (reads from OData annotation)
export const getObjectType = (assignment: CatalogAssignment): string | null =>
  assignment['_object_value@Microsoft.Dynamics.CRM.lookuplogicalname'] || null;

// Helper to get display label for an assignment
export const getObjectTypeLabel = (assignment: CatalogAssignment): string => {
  const objectType = getObjectType(assignment);
  return objectType ? (ObjectIdTypeLabels[objectType] ?? objectType) : 'Unknown';
};

// Helper to get icon for an assignment
export const getObjectTypeIcon = (assignment: CatalogAssignment): React.JSX.Element | null => {
  const objectType = getObjectType(assignment);
  return objectType ? (objectIdTypeIcons[objectType] ?? null) : null;
};


export const CatalogAssignmentstatecode = {
  0: 'Active',
  1: 'Inactive'
} as const;
export type CatalogAssignmentstatecode = keyof typeof CatalogAssignmentstatecode;

export const CatalogAssignmentstatuscode = {
  1: 'Active',
  2: 'Inactive'
} as const;
export type CatalogAssignmentstatuscode = keyof typeof CatalogAssignmentstatuscode;


// TEMPLATE FOR CREATING NEW CatalogAssignment
export const DEFAULT_ASSIGNMENT_CREATE_TEMPLATE: CatalogAssignmentCreateable = {
  name: '',
  _catalogid_value: '',
  _object_value: '',
};
