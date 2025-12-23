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




interface RequestParametersListProps {
    requestParameters: CustomApiRequestParameter[];
}




export const RequestParametersList: React.FC<RequestParametersListProps> = ({requestParameters}) => {
    //const styles = useStyles();
    const { setSelectedRequestParameterId } = useAppStore();

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
                setSelectedRequestParameterId(null);
            } else {
                setSelectedRequestParameterId(selectedId)
            }
        }else {
            setSelectedRequestParameterId(null)
        }
    }, [selectedRows, setSelectedRequestParameterId]);
    
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
        
        // createTableColumn<CustomApiRequestParameter>({
        //     columnId: 'actions',
            
        //     renderHeaderCell: () => {
        //         return 'Actions';
        //     },
        //     renderCell: () => {
        //         return (
        //         <>
        //             <Button aria-label="View" icon={<GlassesRegular />} 
        //                 onClick={
        //                     () => {
        //                         setMode('read');
        //                         setIsOpen(true);  
        //                     } 
        //                 }/>
        //             <Button aria-label="Edit" icon={<Edit24Regular />} />
        //             <Button aria-label="Delete" icon={<DismissCircleColor />} />
        //         </>
        //         );
        //     },
        // }),
        
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
        <div style={{ width: "450px", overflow: "auto" }}>              
            <DataGrid
                items={requestParameters}
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
