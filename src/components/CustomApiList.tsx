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
import { useCustomApis } from '../hooks/useCustomApis';
import { CustomApi } from '../models/CustomApi';
import { LockClosed16Regular, LockOpen16Regular } from '@fluentui/react-icons';
import { useAppStore } from '../store/useAppStore';






export const CustomApiList: React.FC = () => {
    const styles = useStyles();
    const customapisQuery = useCustomApis();

    const { setSelectedCustomApiId } = useAppStore();

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
            setSelectedCustomApiId(selectedId);
        }
    }, [selectedRows, setSelectedCustomApiId]);
    
    const columns: TableColumnDefinition<CustomApi>[] = [
        createTableColumn<CustomApi>({
            columnId: 'uniquename',
            compare: (a, b) => {
                return a.uniquename.localeCompare(b.uniquename);
            },
            renderHeaderCell: () => {
                return "Unique Name";
            },
            renderCell: (item) => {
                return (
                    <TableCellLayout>
                        {item.uniquename}
                    </TableCellLayout>
                );
            },
        }),
        createTableColumn<CustomApi>({
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
        createTableColumn<CustomApi>({
            columnId: 'displayname',
            compare: (a, b) => {
                return a.displayname.localeCompare(b.displayname);
            },
            renderHeaderCell: () => {
                return "Display Name";
            },
            renderCell: (item) => {
                return (
                    <TableCellLayout>
                        {item.displayname}
                    </TableCellLayout>
                );
            }
        }),
        createTableColumn<CustomApi>({
            columnId: "ismanaged",
            compare: (a, b) => (a.ismanaged === b.ismanaged ? 0 : a.ismanaged ? 1 : -1),
            renderHeaderCell: () => {
                return "Is Managed?";
            },
            renderCell: (item) => {
                return (
                    <TableCellLayout media={item.ismanaged ? <LockClosed16Regular/> : <LockOpen16Regular/>} >
                        {item.ismanaged ? "Yes" : "No"}
                    </TableCellLayout>
                );
            }
        }),
    ];
    

    if (customapisQuery.isFetching) {
        return (
            <div className={styles.infoBox}>
                <p>Loading Custom APIs...</p>
            </div>
        );
    }

    if (customapisQuery.error) {
        return (
            
            <div  className={styles.infoBox}>
                <p>Error loading Custom APIs:</p>
                <pre>{customapisQuery.error.message}</pre>
            </div>
          
        );
    }

    if(customapisQuery.customapis)
    {
        return (
            <DataGrid
                items={customapisQuery.customapis}
                columns={columns}
                selectionMode="single"
                selectedItems={selectedRows}
                onSelectionChange={onSelectionChange}
                getRowId={(item) => item.customapiid} // Set the key
                style={{ minWidth: "550px" }}
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
