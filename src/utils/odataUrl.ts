import { CustomApi } from '../models/CustomApi';
import { CustomApiRequestParameter, Customapirequestparameterstype } from '../models/CustomApiRequestParameter';
import { ParameterValues } from '../components/customApiTester/RequestPanel';

export interface BuildODataUrlOptions {
    customApi: CustomApi;
    instanceUrl: string;
    requestParameters: CustomApiRequestParameter[];
    parameterValues: ParameterValues;
    boundRecordId?: string | null;
}

/**
 * Builds the OData URL for a Custom API
 * Returns null if required information is missing
 */
export function buildCustomApiODataUrl(options: BuildODataUrlOptions): string | null {
    const { customApi, instanceUrl, requestParameters, parameterValues, boundRecordId } = options;
    
    if (!customApi || !instanceUrl) {
        return null;
    }

    const baseUrl = `${instanceUrl}/api/data/v9.2`;
    const isFunction = customApi.isfunction;
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

    // Build parameter string for functions
    let paramString = '';
    if (isFunction) {
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
            paramString = `(${funcParams.join(',')})`;
        } else if (isFunction) {
            paramString = '()';
        }
    }

    // Build the URL based on binding type
    if (isBound) {
        const entityPlural = customApi.boundentitylogicalname + 's'; // Simple pluralization
        
        if (bindingType === 1) {
            // Entity-bound
            return `${baseUrl}/${entityPlural}(${boundRecordId})/Microsoft.Dynamics.CRM.${customApi.uniquename}${paramString}`;
        } else {
            // EntityCollection-bound
            return `${baseUrl}/${entityPlural}/Microsoft.Dynamics.CRM.${customApi.uniquename}${paramString}`;
        }
    } else {
        // Global
        return `${baseUrl}/${customApi.uniquename}${paramString}`;
    }
}
