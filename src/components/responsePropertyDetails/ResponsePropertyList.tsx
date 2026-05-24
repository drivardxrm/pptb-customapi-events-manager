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
import { CustomApi } from '../../models/CustomApi';
import { Customapiresponsepropertiestype, CustomApiResponseProperty } from '../../models/CustomApiResponseProperty';
import { useStyles } from '../../styles/Styles';




interface ResponsePropertyListProps {
    responseProperties: CustomApiResponseProperty[];
}




export const ResponsePropertyList: React.FC<ResponsePropertyListProps> = ({responseProperties}) => {
    const styles = useStyles();
    const { setSelectedResponsePropertyId, selectedResponsePropertyId } = useAppStore();
        
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
        setSelectedResponsePropertyId(first ?? null);
    }, [selectedRows, setSelectedResponsePropertyId]);

    useEffect(() => {
        setSelectedRows(prev => {
            if (!selectedResponsePropertyId) {
                return prev.size ? new Set<TableRowId>() : prev;
            }

            const exists = responseProperties.some(
                rp => rp.customapiresponsepropertyid === selectedResponsePropertyId
            );

            if (!exists) {
                return prev.size ? new Set<TableRowId>() : prev;
            }

            if (prev.size === 1 && prev.has(selectedResponsePropertyId)) {
                return prev;
            }

            return new Set<TableRowId>([selectedResponsePropertyId]);
        });
    }, [responseProperties, selectedResponsePropertyId]);
    
    const columns: TableColumnDefinition<CustomApiResponseProperty>[] = [
        createTableColumn<CustomApiResponseProperty>({
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
        createTableColumn<CustomApiResponseProperty>({
            columnId: 'type',
            compare: (a, b) => {
                return Customapiresponsepropertiestype[a.type].localeCompare(Customapiresponsepropertiestype[b.type]);
            },
            renderHeaderCell: () => {
                return 'Type';
            },
            renderCell: (item) => {
                return (
                    <TableCellLayout>
                        {Customapiresponsepropertiestype[item.type]}
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
        type: {
            minWidth: 120,
            defaultWidth: 120,
        },
    };
    

    
    return (
        <div className={styles.listContainer}>              
            <DataGrid
                items={responseProperties.sort((a, b) => a.uniquename.localeCompare(b.uniquename))}
                columns={columns}
                selectionMode='single'
                selectedItems={selectedRows}
                sortable
                onSelectionChange={onSelectionChange}
                getRowId={(item) => item.customapiresponsepropertyid} // Set the key
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
