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
import { CustomApi } from '../models/CustomApi';
import { useCustomApiRequestParameters } from '../hooks/useCustomApiRequestParameters';
import { CustomApiRequestParameter } from '../models/CustomApiRequestParameter';
import { useAppStore } from '../store/useAppStore';






export const RequestParametersList: React.FC = () => {
    const styles = useStyles();
    const requestParametersQuery = useCustomApiRequestParameters();
    const { setSelectedRequestParameterId } = useAppStore();

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
            setSelectedRequestParameterId(selectedId);
        }
    }, [selectedRows, setSelectedRequestParameterId]);
    
    const columns: TableColumnDefinition<CustomApiRequestParameter>[] = [
        createTableColumn<CustomApiRequestParameter>({
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
        createTableColumn<CustomApiRequestParameter>({
            columnId: 'isoptional',
            compare: (a, b) => {
                return a.isoptional === b.isoptional ? 0 : a.isoptional ? 1 : -1;
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
    

    if (requestParametersQuery.isFetching) {
        return (
            <div className={styles.infoBox}>
                <p>Loading Request Parameters...</p>
            </div>
        );
    }

    if (requestParametersQuery.error) {
        return (
            
            <div  className={styles.infoBox}>
                <p>Error loading Request Parameters:</p>
                <pre>{requestParametersQuery.error.message}</pre>
            </div>
          
        );
    }

    if(requestParametersQuery.requestParameters)
    {
        return (
            <DataGrid
                items={requestParametersQuery.requestParameters}
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
