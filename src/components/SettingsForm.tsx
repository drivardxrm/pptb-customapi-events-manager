import React, { useEffect, useState } from 'react';
import { 
    Card, 
    CardHeader, 
    Divider, 
    Field, 
    Input, 
    Button,
    Spinner,
    Switch,
    tokens
} from '@fluentui/react-components';
import { Save24Regular, ArrowReset24Regular } from '@fluentui/react-icons';
import { useStyles } from '../styles/Styles';
import { useAppStore } from '../store/useAppStore';
import { usePublishers } from '../hooks/usePublishers';
import { GenericTagPicker, SelectableItem } from './generic/GenericTagPicker';
import { AppSettings } from '../models/AppSettings';
import { useAppSettings, useUpdateAppSettings } from '../hooks/useAppSettings';

export const SettingsForm: React.FC = () => {
    const styles = useStyles();
    const {addLog } = useAppStore();


    const publishersQuery = usePublishers()
    

    const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const settingsQuery = useAppSettings();
    const { mutateAsync: updateAppSettings } = useUpdateAppSettings();
    

    useEffect(() => {
        if (settingsQuery.status === 'success' && settingsQuery.appsettings) {
            setLocalSettings(settingsQuery.appsettings);
        }
    }, [settingsQuery.status, settingsQuery.appsettings]);

    const hasChanges = () => {
        return ( settingsQuery.appsettings && localSettings &&
            (localSettings.defaultPublisherId !== settingsQuery.appsettings.defaultPublisherId ||
            localSettings.requestParameterDefaultName !== settingsQuery.appsettings.requestParameterDefaultName ||
            localSettings.responsePropertyDefaultName !== settingsQuery.appsettings.responsePropertyDefaultName ||
            localSettings.showDebug !== settingsQuery.appsettings.showDebug)
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            
            // wait for query to resolve 
            if (settingsQuery.status !== 'success' || !settingsQuery.appsettings) {
                return; 
            }
            await updateAppSettings({ current: settingsQuery.appsettings, next: localSettings! });
            addLog('Settings saved successfully', 'success');
        } catch (error) {
            addLog('Failed to save some settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setLocalSettings(settingsQuery.appsettings!);
        addLog('Changes discarded', 'info');
    };

    if ((settingsQuery.status === 'pending')) {
        return (
            <Card className={styles.card}>
                <CardHeader header={<h3>⚙️ Settings</h3>} />
                <Divider />
                <div style={{ 
                    padding: tokens.spacingVerticalM, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: tokens.spacingHorizontalM 
                }}>
                    <Spinner size="small" />
                    <span>Loading settings...</span>
                </div>
            </Card>
        );
    }
    else if (settingsQuery.status === 'error') {
        return (
            <Card className={styles.card}>
                <CardHeader header={<h3>⚙️ Settings</h3>} />
                <Divider />
                <div style={{
                    padding: tokens.spacingVerticalM,
                    backgroundColor: '#f8d7da',
                    borderLeft: `4px solid #dc3545`,
                    borderRadius: tokens.borderRadiusMedium
                }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>❌ Error loading settings</p>
                    <p style={{ margin: '8px 0 0 0' }}>{settingsQuery.error?.message}</p>
                </div>
            </Card>
        );
    }else if (localSettings) {
        
        return (
            <Card className={styles.card}>
                <CardHeader 
                    header={<h3>⚙️ Settings</h3>}
                    description="Configure default values and preferences"
                    action={
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                                appearance="primary" 
                                icon={isSaving ? <Spinner size="tiny" /> : <Save24Regular />}
                                disabled={!hasChanges() || isSaving}
                                onClick={handleSave}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button 
                                appearance="secondary" 
                                icon={<ArrowReset24Regular />}
                                disabled={!hasChanges() || isSaving}
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                        </div>
                    }
                />
                <Divider />
                
                <div className={styles.formGrid}>
                    <div className={styles.formSection}>
                        <Field 
                            label='Default Publisher ID'
                            hint='Default publisher for new Custom APIs (Connection scoped)'
                        >
                           
                            {publishersQuery.isFetching && (
                                <Input 
                                    value={"Loading publishers..."} 
                                    readOnly 
                                    className={styles.readOnlyInput}
                                />
                            )}
                            {publishersQuery.error && (
                                <Input 
                                    value={`Error loading publishers: ${publishersQuery.error.message}`} 
                                    readOnly 
                                    className={styles.readOnlyInput}
                                />
                            )}
                            {!publishersQuery.isFetching && publishersQuery.publishers  && (
                                <GenericTagPicker 
                                        items={publishersQuery.publishers.map(p => ({
                                            id: p.publisherid,
                                            displayText: `${p.friendlyname} (${p.customizationprefix})` || ''
                                        } as SelectableItem)      
                                    ).sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))} 
                                    initialValue={settingsQuery.appsettings?.defaultPublisherId ?? undefined}
                                    //isDisabled={!isEditMode} 
                                    onSelect={(id) =>  setLocalSettings({
                                        ...localSettings,
                                        defaultPublisherId: id
                                    })}
                                />
                            )}
                        </Field>
                    </div>

                    <div className={styles.formSection}>
                        <Field 
                            label="Request Parameter Default Name"
                            hint="Template for new request parameter names"
                        >
                            <Input 
                                value={localSettings.requestParameterDefaultName ?? undefined} 
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    requestParameterDefaultName: e.target.value || null
                                })}
                                
                            />
                        </Field>
                    </div>

                    <div className={styles.formSection}>
                        <Field 
                            label="Response Property Default Name"
                            hint="Template for new response property names"
                        >
                            <Input 
                                value={localSettings.responsePropertyDefaultName ?? undefined} 
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    responsePropertyDefaultName: e.target.value || null
                                })}
                                
                            />
                        </Field>
                    </div>

                    <div className={styles.formSection}>
                        <Field 
                            label="Show Debug Tools"
                            hint="Toggle visibility of debug features within the app"
                        >
                            <Switch
                                checked={localSettings.showDebug}
                                onChange={(_, data) =>
                                    setLocalSettings({
                                        ...localSettings,
                                        showDebug: data.checked,
                                    })
                                }
                                label={localSettings.showDebug ? 'Enabled' : 'Disabled'}
                            />
                        </Field>
                    </div>

                </div>

                <div style={{ 
                    marginTop: tokens.spacingVerticalL,
                    padding: tokens.spacingVerticalM,
                    backgroundColor: tokens.colorNeutralBackground3,
                    borderRadius: tokens.borderRadiusMedium,
                    fontSize: '12px',
                    color: tokens.colorNeutralForeground3
                }}>
                    <p style={{ margin: 0 }}>
                        <strong>Note:</strong> Settings are persisted using the host application's settings storage.
                    </p>
                </div>
            </Card>
        );

    }



};
