import { CustomApi } from '../models/CustomApi';
import { CustomApiRequestParameter, Customapirequestparameterstype } from '../models/CustomApiRequestParameter';
import { ParameterValues } from '../components/customApiTester/RequestPanel';

export interface BuildODataUrlOptions {
    customApi: CustomApi;
    instanceUrl: string;
    boundEntityCollectionName?: string | null; // For bound APIs, we need the collection name to build the URL
    boundRecordId?: string | null;
}

export interface BuildFunctionParamStringOptions {
    requestParameters: CustomApiRequestParameter[];
    parameterValues: ParameterValues;
}

/**
 * Builds the OData URL for a Custom API (without function parameters)
 * Returns null if required information is missing
 */
export function buildCustomApiODataUrl(options: BuildODataUrlOptions): string | null {
    const { customApi, instanceUrl, boundEntityCollectionName, boundRecordId } = options;
    
    if (!customApi || !instanceUrl) {
        return null;
    }

    const baseUrl = `${instanceUrl}api/data/v9.2`;
    const bindingType = customApi.bindingtype;
    const isBound = bindingType === 1 || bindingType === 2; // Entity or EntityCollection

    // For bound APIs, we need the bound entity and record ID
    if (isBound) {
        if (!customApi.boundentitylogicalname) {
            return null;
        }
        if (bindingType === 1 && !boundRecordId) {
            // Entity-bound requires a specific record ID
            return null;
        }
    }

    // Build the URL based on binding type
    if (isBound) {
       
        
        if (bindingType === 1) {
            // Entity-bound
            return `${baseUrl}/${boundEntityCollectionName}(${boundRecordId})/Microsoft.Dynamics.CRM.${customApi.uniquename}`;
        } else {
            // TODO: need to understand how to call these type of API correctly
            // EntityCollection-bound
            return `${baseUrl}/${boundEntityCollectionName}/Microsoft.Dynamics.CRM.${customApi.uniquename}`;
        }
    } else {
        // Global
        return `${baseUrl}/${customApi.uniquename}`;
    }
}

/**
 * Builds the function parameter string for a Custom API Function call
 * Returns the formatted parameter string e.g. "(Param1='value',Param2=123)" or "()" if no params
 * Only call this for Custom APIs where isfunction is true
 */
export function buildFunctionParamString(options: BuildFunctionParamStringOptions): string {
    const { requestParameters, parameterValues } = options;
    const funcParams: string[] = [];
    
    for (const param of requestParameters) {
        const value = parameterValues[param.customapirequestparameterid];
        if (value === undefined || value === null || value === '') continue;

        const paramType = Customapirequestparameterstype[param.type];
        const paramName = param.uniquename;

        // Format parameter value based on type
        let formattedValue: string;
        switch (paramType) {
            case 'Boolean':
                formattedValue = value ? 'true' : 'false';
                break;
            case 'String':
            case 'Guid':
                formattedValue = `'${value}'`;
                break;
            case 'DateTime':
                if (value instanceof Date) {
                    formattedValue = value.toISOString();
                } else {
                    formattedValue = String(value);
                }
                break;
            case 'Integer':
            case 'Picklist':
            case 'Float':
            case 'Decimal':
            case 'Money':
                formattedValue = String(value);
                break;
            default:
                // For complex types, skip them in URL (they go in body)
                continue;
        }

        funcParams.push(`${paramName}=${formattedValue}`);
    }

    if (funcParams.length > 0) {
        return `(${funcParams.join(',')})`;
    }

    return '()';
}
