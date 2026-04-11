import React, { createElement } from "react";
import { SelectableItem } from "../components/generic/GenericTagPicker";
import { EntityService } from "../services/EntityService";
import { TableRegular, PlugConnectedRegular, PlayRegular } from "@fluentui/react-icons";


export interface CatalogAssignment  {
  catalogassignmentid: string;
  name: string;
  objectidtype: string;
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
  catalogassignmenttype: CatalogAssignmentType | null;
  solutionid: string;
  statecode: CatalogAssignmentstatecode;
  statuscode: CatalogAssignmentstatuscode;
}


// Properties needed at creation time
export interface CatalogAssignmentCreateable  extends 
  Pick<CatalogAssignment,   
  'name' |   
  '_catalogid_value' | 
  '_object_value' |
  'catalogassignmenttype'
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


// OPTIONSETS
export const CatalogAssignmentTypeOptions = {
  0: 'Table',
  1: 'Custom API',
  2: 'Custom Process Action'
} as const;
export type CatalogAssignmentType = keyof typeof CatalogAssignmentTypeOptions;

// Icon mapping for CatalogAssignmentType
export const catalogAssignmentTypeIcons: Record<string, React.JSX.Element> = {
  '0': createElement(TableRegular),              // Table
  '1': createElement(PlugConnectedRegular),      // Custom API
  '2': createElement(PlayRegular),               // Custom Process Action
};

// Helper to get options for CatalogAssignmentType
export const getCatalogAssignmentTypeOptions = (): Array<SelectableItem> =>
  Object.entries(CatalogAssignmentTypeOptions).map(([key, value]) => ({
    id: Number(key).toString(),
    displayText: value,
    image: catalogAssignmentTypeIcons[key] ?? null,
  }));


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
// Defaults to Custom API type (1) since this tool manages Custom APIs
export const DEFAULT_ASSIGNMENT_CREATE_TEMPLATE: CatalogAssignmentCreateable = {
  name: '',
  _catalogid_value: '',
  _object_value: '',
  catalogassignmenttype: 1 as CatalogAssignmentType, // Default to Custom API
};
