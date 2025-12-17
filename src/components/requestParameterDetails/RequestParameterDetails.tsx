import React, { useEffect, useState } from 'react';
import {  
    Button,
    Card,
    CardHeader,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';

import { AddCircleColor, Dismiss24Regular } from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { RequestParametersList } from './RequestParametersList';
import { CustomApiRequestParameterUpdateable } from '../../models/CustomApiRequestParameter';
import { useCustomApiRequestParameters } from '../../hooks/useCustomApiRequestParameters';
import { RequestParameterDetailsRead } from './RequestParameterRead';




export type RequestParametersMode = 'read' | 'edit' | 'create';


export const RequestParameterDetails: React.FC = () => {
    const styles = useStyles();
    const { selectedRequestParameterId } = useAppStore();
    const [mode, setMode] = useState<RequestParametersMode>('read');
    const [editedData, setEditedData] = useState<CustomApiRequestParameterUpdateable | null>(null);
    const {requestParameters} = useCustomApiRequestParameters();
    const [isOpen, setIsOpen] = useState(false);
    //const updateCustomApiRequestParameter = useUpdateCustomApiRequestParameter();

    const selectedRequestParameter = requestParameters?.find((param) => param.customapirequestparameterid === selectedRequestParameterId)

    useEffect(() => {
        if (selectedRequestParameter) {
            setEditedData(selectedRequestParameter);
            
        } else {
            setEditedData(null);
        }
        setMode('read');
    }, [selectedRequestParameter]);


    // const handleEdit = () => {
    //     if (!selectedRequestParameter) {
    //         return;
    //     }
    //     setEditedData(selectedRequestParameter);
    //     setMode('edit');
    // };

    // const handleCancel = () => {
    //     if (selectedRequestParameter) {
    //         setEditedData(selectedRequestParameter);
    //     }
    //     setMode('read');
    // };

    // const handleSave = async () => {
    //     if (!selectedRequestParameter || !editedData) {
    //         return;
    //     }

    //     try {
    //         await updateCustomApiRequestParameter.mutateAsync({
    //             current: selectedRequestParameter,
    //             next: editedData,
    //         });

    //         setMode('read');
    //     } catch (error) {
    //         console.error('Error saving Custom API', error);
    //     }
    // };

    const content = (() => {
        if (mode === 'create') {
            return <>TODO</>
        }

        if (mode === 'edit' && selectedRequestParameter && editedData) {
            return <>TODO</>;
        }

        if(mode === 'read' && selectedRequestParameter) {
            return <RequestParameterDetailsRead parameter={selectedRequestParameter} />;
        }
        return <></>;
    })();



    return (
        <Card className={styles.card}>
            <CardHeader 
                header={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                            <h3 style={{ margin: 0 }}>Request Parameters (Input)</h3>
                        </div>
                    </div>
                }
                action={
                    <div className={styles.headerActionGroup}>
                        <Button
                            aria-label='New Request Parameter'
                            appearance='secondary'
                            icon={<AddCircleColor/>}
                        >
                            New
                        </Button>
                        {/* <Button
                            aria-label='Edit Request Parameter'
                            appearance='secondary'
                            icon={<Edit24Regular />}
                            disabled={selectedRequestParameterId === null || selectedRequestParameterId === undefined || selectedRequestParameterId === ''}
                        >
                            Edit
                        </Button>
                        <Button
                            aria-label='Delete Request Parameter'
                            appearance='secondary'
                            icon={selectedRequestParameterId === null || selectedRequestParameterId === undefined || selectedRequestParameterId === '' ? <DismissCircleRegular/> : <DismissCircleColor />}
                            onClick={() => {}} 
                            className={styles.headerActionButton}
                            disabled={selectedRequestParameterId === null || selectedRequestParameterId === undefined || selectedRequestParameterId === ''}
                        >
                            Delete
                        </Button>     */}
                    </div>
                }

            />
            
            <Drawer 
                type='inline'
                open={isOpen}
                onOpenChange={(_, { open }) => setIsOpen(open)}
                position='start'
                size='medium'
            >
                <DrawerHeader>
                    <DrawerHeaderTitle
                        action={
                            <Button
                            appearance="subtle"
                            aria-label="Close"
                            icon={<Dismiss24Regular />}
                            onClick={() => setIsOpen(false)}
                            />
                        }
                        >
                        Request Parameter Details
                    </DrawerHeaderTitle>
                </DrawerHeader>
                <DrawerBody>
                    {content}
                </DrawerBody>
                    
            </Drawer >


            <div className={styles.formGridBig}>
                <div className={styles.formSection}>
                    <RequestParametersList requestParameters={requestParameters} setIsOpen={setIsOpen} setMode={setMode} />
                </div>

                



                
                
            </div>
            
            
        </Card>
    );

};
