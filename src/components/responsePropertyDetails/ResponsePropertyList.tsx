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




interface ResponsePropertyListProps {
    responseProperties: CustomApiResponseProperty[];
}




export const ResponsePropertyList: React.FC<ResponsePropertyListProps> = ({responseProperties}) => {
    //const styles = useStyles();
    const { setSelectedResponsePropertyId } = useAppStore();

    const [selectedRows, setSelectedRows] = useState(
        new Set<TableRowId>([-1]) 
    );
    const onSelectionChange: DataGridProps["onSelectionChange"] = (_e, data) => {
        setSelectedRows(data.selectedItems);
    };

    useEffect(() => {
        if (selectedRows.size > 0 && Array.from(selectedRows)[0] !== -1) {
            const selectedId = Array.from(selectedRows)[0] as string
            if(selectedId === '-1') {
                setSelectedResponsePropertyId(null);
            } else {
                setSelectedResponsePropertyId(selectedId)
            }
        }else {
            setSelectedResponsePropertyId(null)
        }
    }, [selectedRows, setSelectedResponsePropertyId]);
    
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
        <div style={{ width: "450px", overflow: "auto" }}>              
            <DataGrid
                items={responseProperties}
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
