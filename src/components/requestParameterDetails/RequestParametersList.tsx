import React, { useEffect, useState } from 'react';
import {  
    //Button,
    createTableColumn,
    DataGrid,
    DataGridBody,
    DataGridCell,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridProps,
    DataGridRow,
    TableCellLayout,
    TableColumnDefinition,
    TableRowId
} from '@fluentui/react-components';
import { useAppStore } from '../../store/useAppStore';
import { CustomApiRequestParameter, Customapirequestparameterstype } from '../../models/CustomApiRequestParameter';
import { CustomApi } from '../../models/CustomApi';
import { useStyles } from '../../styles/Styles';




interface RequestParametersListProps {
    requestParameters: CustomApiRequestParameter[];
}




export const RequestParametersList: React.FC<RequestParametersListProps> = ({requestParameters}) => {
    const styles = useStyles();
    const { setSelectedRequestParameterId, selectedRequestParameterId } = useAppStore();
    
    const [selectedRows, setSelectedRows] = useState<Set<TableRowId>>(
        () => new Set<TableRowId>()
    );

    const onSelectionChange: DataGridProps["onSelectionChange"] = (_e, data) => {
        setSelectedRows((prev) => {
            if (prev.size === data.selectedItems.size && Array.from(prev).every((item) => data.selectedItems.has(item))) {
                return prev;
            }

            return data.selectedItems;
        });
    };

    useEffect(() => {
        const [first] = Array.from(selectedRows) as string[];
        setSelectedRequestParameterId(first ?? null);
    }, [selectedRows, setSelectedRequestParameterId]);

    useEffect(() => {
        setSelectedRows(prev => {
            if (!selectedRequestParameterId) {
                return prev.size ? new Set<TableRowId>() : prev;
            }

            const exists = requestParameters.some(
                rp => rp.customapirequestparameterid === selectedRequestParameterId
            );

            if (!exists) {
                return prev.size ? new Set<TableRowId>() : prev;
            }

            if (prev.size === 1 && prev.has(selectedRequestParameterId)) {
                return prev;
            }

            return new Set<TableRowId>([selectedRequestParameterId]);
        });
    }, [requestParameters, selectedRequestParameterId]);
    
    const columns: TableColumnDefinition<CustomApiRequestParameter>[] = [
        createTableColumn<CustomApiRequestParameter>({
            columnId: 'uniquename',
            compare: (a, b) => {
                return a.name.localeCompare(b.name)
            },
            renderHeaderCell: () => {
                return "Unique Name"
            },
            renderCell: (item) => {
                return (
                    <TableCellLayout>
                        {item.uniquename}
                    </TableCellLayout>
                );
            },
        }),
        createTableColumn<CustomApiRequestParameter>({
            columnId: 'type',
            compare: (a, b) => {
                return Customapirequestparameterstype[a.type].localeCompare(Customapirequestparameterstype[b.type]);
            },
            renderHeaderCell: () => {
                return 'Type';
            },
            renderCell: (item) => {
                return (
                    <TableCellLayout>
                        {Customapirequestparameterstype[item.type]}
                    </TableCellLayout>
                );
            },
        }),
        createTableColumn<CustomApiRequestParameter>({
            columnId: 'isoptional',
            compare: (a, b) => {
                return a.isoptional === b.isoptional ? 0 : a.isoptional ? 1 : -1
            },
            renderHeaderCell: () => {
                return "Is Optional"
            },
            renderCell: (item) => {
                return (
                    <TableCellLayout>
                        {item.isoptional ? 'Yes' : 'No'}
                    </TableCellLayout>
                );
            },
        }),
    ];

    const columnSizingOptions = {
        name: {
            defaultWidth: 250,
            minWidth: 250,
            idealWidth: 250,
            
        },
        isoptional: {
            minWidth: 80,
            defaultWidth: 80,
        },
        type: {
            minWidth: 120,
            defaultWidth: 120,
        },
    };
    

    
    return (
        <div className={styles.listContainer}>              
            <DataGrid
                items={requestParameters.sort((a, b) => a.uniquename.localeCompare(b.uniquename))}
                columns={columns}
                selectionMode='single'
                selectedItems={selectedRows}
                sortable
                onSelectionChange={onSelectionChange}
                getRowId={(item) => item.customapirequestparameterid} // Set the key
                resizableColumns
                columnSizingOptions={columnSizingOptions}
                //style={{ maxWidth: "300px" }}
            >
                <DataGridHeader>
                    <DataGridRow>
                    {({ renderHeaderCell }) => (
                        <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                    )}
                    </DataGridRow>
                </DataGridHeader>
                <DataGridBody<CustomApi>>
                    {({ item, rowId }) => (
                    <DataGridRow<CustomApi>
                        key={rowId}
                        selectionCell={{ radioIndicator: { "aria-label": "Select row" } }}
                    >
                        {({ renderCell }) => (
                            <DataGridCell>{renderCell(item)}</DataGridCell>
                        )}
                    </DataGridRow>
                    )}
                </DataGridBody>
            </DataGrid>
        </div>
            
            
            
        );

    
    
};
