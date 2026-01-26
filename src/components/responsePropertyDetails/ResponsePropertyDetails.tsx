import React, { Activity, useEffect, useState } from 'react';
import { 
    Image, 
    Badge,
    Button,
    Card,
    CardHeader,
    Divider,
    Spinner,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';
import outputImage from '../../assets/output.png';
import { 
    AddCircleColor,
    Edit24Regular,
    DismissCircleColor,
    Save24Regular,
    Dismiss24Regular, 
} from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { CustomApiResponsePropertyCreateable, CustomApiResponsePropertyUpdateable, getResponsePropertyCreateTemplate } from '../../models/CustomApiResponseProperty';
import { useCreateCustomApiResponseProperty, useCustomApiResponseProperties, useUpdateCustomApiResponseProperty } from '../../hooks/useCustomApiResponseProperties';
import { ResponsePropertyList } from './ResponsePropertyList';
import { ResponsePropertyCreate } from './ResponsePropertyCreate';
import { ResponsePropertyEdit } from './ResponsePropertyEdit';
import { ResponsePropertyRead } from './ResponsePropertyRead';







export type ResponsePropertiesMode = 'read' | 'edit' | 'create';


export const ResponsePropertyDetails: React.FC = () => {
    const styles = useStyles();
    const { selectedCustomApiId , selectedResponsePropertyId, setSelectedResponsePropertyId } = useAppStore();
    const [mode, setMode] = useState<ResponsePropertiesMode>('read');
    const [editedData, setEditedData] = useState<CustomApiResponsePropertyUpdateable | null>(null);
    const [createData, setCreateData] = useState<CustomApiResponsePropertyCreateable | null>(null);
    const {responseProperties } = useCustomApiResponseProperties();
    const updateCustomApiResponseProperty = useUpdateCustomApiResponseProperty();
    const createCustomApiResponseProperty = useCreateCustomApiResponseProperty();


    const selectedResponseProperty = responseProperties?.find((prop) => prop.customapiresponsepropertyid === selectedResponsePropertyId)

    useEffect(() => {
        if (selectedResponseProperty) {
            setEditedData(selectedResponseProperty);
            
        } else {
            setEditedData(null);
        }
    }, [selectedResponseProperty]);



    const handleCreate = () => {
        setSelectedResponsePropertyId(null);
        setCreateData(getResponsePropertyCreateTemplate(selectedCustomApiId!));
        setMode('create');
    };


    const handleEdit = () => {
        if (!selectedResponseProperty) {
            return;
        }
        setEditedData(selectedResponseProperty);
        setMode('edit');
    };

    const handleCancel = () => {
        if (selectedResponseProperty) {
            setEditedData(selectedResponseProperty);
        }
        setMode('read');
    };

    const handleSave = async () => {
        
        try {

            if(mode === 'create') {
                
                if (selectedResponseProperty || !createData) {
                    return;
                }
                let result = await createCustomApiResponseProperty.mutateAsync({
                    next: createData,
                });

                if(result.created && result.id) {
                    setSelectedResponsePropertyId(result.id);
                    setCreateData(getResponsePropertyCreateTemplate(selectedCustomApiId!));
                }
                
            }
            else if(mode === 'edit') {
                
                if (!selectedResponseProperty || !editedData) {
                    return;
                }
                await updateCustomApiResponseProperty.mutateAsync({
                    current: selectedResponseProperty,
                    next: editedData,
                });
            }

            setMode('read');
        } catch (error) {
            console.error('Error saving Request Parameter', error);
        }
    };

    const handleCreateDataChange = (updater: (current: CustomApiResponsePropertyCreateable) => CustomApiResponsePropertyCreateable) => {
        setCreateData((current) => (current ? updater(current) : current));
    };


    const handleEditedDataChange = (updater: (current: CustomApiResponsePropertyUpdateable) => CustomApiResponsePropertyUpdateable) => {
        setEditedData((current) => (current ? updater(current) : current));
    };

    const content = (() => {
        if (mode === 'create') {
            return <ResponsePropertyCreate createData={createData!} onChange={handleCreateDataChange} />;
        }

        if (mode === 'edit' && selectedResponseProperty && editedData) {
            return <ResponsePropertyEdit property={selectedResponseProperty} editedData={editedData} onChange={handleEditedDataChange} />;
        }

        if(mode === 'read' && selectedResponseProperty) {
            return <ResponsePropertyRead property={selectedResponseProperty} />;
        }
        return <></>;
    })();

    const headerChip = (() => {
        switch (mode) {
            case 'edit':
                return { label: 'Editing', color: 'warning' as const };
            case 'create':
                return { label: 'Create mode', color: 'success' as const };
            default:
                return { label: 'Read-only', color: 'informative' as const };
        }
    })();

    const headerActions = (() => {
        
       
        return (
            <div className={styles.headerActionGroup}>
                <Activity mode={mode === 'read' ? 'visible' : 'hidden'}>
                    <Button
                        aria-label='New Response Property'
                        appearance='secondary'
                        icon={<AddCircleColor/>}
                        onClick={handleCreate}
                        className={styles.headerActionButton}
                    >
                        New Request Parameter
                    </Button>
                </Activity>
                <Activity mode={mode === 'read' && selectedResponseProperty? 'visible' : 'hidden'}>
                     <Button
                        appearance='secondary'
                        icon={<Edit24Regular />}
                        onClick={handleEdit} 
                        className={styles.headerActionButton}
                    >
                        Edit
                    </Button>
                </Activity>
                <Activity mode={mode === 'read' && selectedResponseProperty? 'visible' : 'hidden'}>
                    <Button
                        appearance='secondary'
                        icon={<DismissCircleColor />}
                        onClick={() => {}} 
                        className={styles.headerActionButton}
                    >
                        Delete
                    </Button>
                </Activity>

                <Activity mode={mode === 'edit' || mode === 'create'? 'visible' : 'hidden'}>
                    <>
                        <Button
                            appearance='primary'
                            icon={createCustomApiResponseProperty.isPending || updateCustomApiResponseProperty.isPending ? <Spinner size='tiny' /> : <Save24Regular />}
                            disabled={createCustomApiResponseProperty.isPending || updateCustomApiResponseProperty.isPending}
                            onClick={handleSave}
                            className={styles.headerActionButton}
                        >
                            { createCustomApiResponseProperty.isPending || updateCustomApiResponseProperty.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                            appearance="secondary"
                            icon={<Dismiss24Regular />}
                            disabled={createCustomApiResponseProperty.isPending || updateCustomApiResponseProperty.isPending}
                            onClick={handleCancel}
                            className={styles.headerActionButton}
                        >
                            Cancel
                        </Button>
                    </>
                </Activity>
                
            </div>
        )
    
    })();




    // function handleEdit(_event:any): void {
    //     throw new Error('Function not implemented.');
    // }

    return (
        <Card className={styles.card}>
            <CardHeader 
                header={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                            <Image alt="Response Properties" src={outputImage} height={40} width={40} />
                            <h3 style={{ margin: 0 }}>Response Properties (Output)</h3>
                            <Badge appearance="tint" color={headerChip.color} shape="rounded">
                                {headerChip.label}
                            </Badge>
                        </div>
                    </div>
                }
                action={
                    <>
                        {headerActions}
                    </>     
                }

            />
            
          


            <div className={styles.cardBody}>
                <div className={styles.splitContainer} >
                    <div className={styles.splitPaneContent}>
                        <ResponsePropertyList responseProperties={responseProperties} />
                    </div>
                    <Divider inset vertical/>
                    <div className={styles.splitPaneContent}>
                        {content}
                    </div>                                         
                </div>
             </div>
            
        </Card>
    );

};
