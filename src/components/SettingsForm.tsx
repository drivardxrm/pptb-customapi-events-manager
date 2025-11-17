import React, { useState } from 'react';
import { 
    Card, 
    CardHeader, 
    Divider, 
    Field, 
    Input, 
    Button,
    Spinner,
    tokens 
} from '@fluentui/react-components';
import { Save24Regular, ArrowReset24Regular } from '@fluentui/react-icons';
import { useStyles } from '../styles/Styles';
import { useAppStore } from '../store/useAppStore';
import { usePublishers } from '../hooks/usePublishers';
import { GenericTagPicker, SelectableItem } from './generic/GenericTagPicker';
import { AppSettings } from '../models/AppSettings';
import { useAppSettings } from '../hooks/useAppSettings';

export const SettingsForm: React.FC = () => {
    const styles = useStyles();
    const {settings, updateSettings, isLoadingSettings,loadingSettingsError, addLog} = useAppStore();


    const publishersQuery = usePublishers()
    

    const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const settingsQuery = useAppSettings();


    const hasChanges = () => {
        return ( localSettings &&
            (localSettings.defaultPublisherId !== settings.defaultPublisherId ||
            localSettings.requestParameterDefaultName !== settings.requestParameterDefaultName ||
            localSettings.responsePropertyDefaultName !== settings.responsePropertyDefaultName)
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            
            updateSettings(localSettings!); // Update Zustand store immediately

            addLog('Settings saved successfully', 'success');
        } catch (error) {
            addLog('Failed to save some settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setLocalSettings(settings);
        addLog('Changes discarded', 'info');
    };

    if ((isLoadingSettings || !localSettings) && !loadingSettingsError) {
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
    else if (loadingSettingsError && settingsQuery.appsettings) {
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
                    <p style={{ margin: '8px 0 0 0' }}>{loadingSettingsError}</p>
                    <p style={{ margin: '8px 0 0 0' }}>{settingsQuery.appsettings.defaultPublisherId}</p>
                    <p style={{ margin: '8px 0 0 0' }}>{settingsQuery.appsettings.requestParameterDefaultName}</p>
                    <p style={{ margin: '8px 0 0 0' }}>{settingsQuery.appsettings.responsePropertyDefaultName}</p>
                </div>
            </Card>
        );
    }else if(localSettings && settings) {
   
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
                            label="Default Publisher ID"
                            hint="Default publisher for new Custom APIs"
                        >
                            {/* <Input 
                                value={localSettings.defaultPublisherId || ''} 
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    defaultPublisherId: e.target.value || null
                                })}
                                placeholder="Enter publisher GUID"
                            /> */}
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
                                    initialValue={settings?.defaultPublisherId ?? undefined}
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
                                value={settings.requestParameterDefaultName ?? undefined} 
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    requestParameterDefaultName: e.target.value || null
                                })}
                                placeholder="{customapiname}-In-{uniquename}"
                            />
                        </Field>
                    </div>

                    <div className={styles.formSection}>
                        <Field 
                            label="Response Property Default Name"
                            hint="Template for new response property names"
                        >
                            <Input 
                                value={settings.responsePropertyDefaultName ?? undefined} 
                                onChange={(e) => setLocalSettings({
                                    ...localSettings,
                                    responsePropertyDefaultName: e.target.value || null
                                })}
                                placeholder="{customapiname}-Out-{uniquename}"
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
