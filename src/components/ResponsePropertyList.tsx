import React, { useEffect, useState } from 'react';
import {  
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
import { useStyles } from '../styles/Styles';
import { CustomApi } from '../models/CustomApi';;
import { useAppStore } from '../store/useAppStore';
import { useCustomApiResponseProperties } from '../hooks/useCustomApiResponseProperties';
import { CustomApiResponseProperty } from '../models/CustomApiResponseProperty';






export const ResponsePropertyList: React.FC = () => {
    const styles = useStyles();
    const responsePropertiesQuery = useCustomApiResponseProperties();
    const { setSelectedResponsePropertyId } = useAppStore();

    const [selectedRows, setSelectedRows] = useState(
        new Set<TableRowId>([-1]) 
    );
    const onSelectionChange: DataGridProps["onSelectionChange"] = (_e, data) => {
        setSelectedRows(data.selectedItems);
        //setSelectedCustomApiId(Array.from(data.selectedItems)[0] as string);
    };

    useEffect(() => {
        if (selectedRows.size > 0) {
            const selectedId = Array.from(selectedRows)[0] as string;
            if(selectedId === '-1') {
                setSelectedResponsePropertyId(null);
            } else {
                setSelectedResponsePropertyId(selectedId);
            }
        }
    }, [selectedRows, setSelectedResponsePropertyId]);
    
    const columns: TableColumnDefinition<CustomApiResponseProperty>[] = [
        createTableColumn<CustomApiResponseProperty>({
            columnId: 'name',
            compare: (a, b) => {
                return a.name.localeCompare(b.name);
            },
            renderHeaderCell: () => {
                return "Name";
            },
            renderCell: (item) => {
                return (
                    <TableCellLayout>
                        {item.name}
                    </TableCellLayout>
                );
            },
        }),
        
        
    ];
    

    if (responsePropertiesQuery.isFetching) {
        return (
            <div className={styles.infoBox}>
                <p>Loading Request Parameters...</p>
            </div>
        );
    }

    if (responsePropertiesQuery.error) {
        return (
            
            <div  className={styles.infoBox}>
                <p>Error loading Request Parameters:</p>
                <pre>{responsePropertiesQuery.error.message}</pre>
            </div>
          
        );
    }

    if(responsePropertiesQuery.responseProperties)
    {
        return (
            <DataGrid
                items={responsePropertiesQuery.responseProperties}
                columns={columns}
                selectionMode="single"
                selectedItems={selectedRows}
                onSelectionChange={onSelectionChange}
                getRowId={(item) => item.customapirequestparameterid} // Set the key
                style={{ minWidth: "300px" }}
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
            
            
        );

    }
    
};
