import React, { useState, useEffect } from 'react';
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
import type { Settings } from '../services/settings';

export const SettingsForm: React.FC = () => {
    const styles = useStyles();
    const settings = useAppStore((state) => state.settings);
    const isLoadingSettings = useAppStore((state) => state.isLoadingSettings);
    const updateSetting = useAppStore((state) => state.updateSetting);
    const addLog = useAppStore((state) => state.addLog);

    const [localSettings, setLocalSettings] = useState<Settings>(settings);
    const [isSaving, setIsSaving] = useState(false);

    // Sync local state when store settings change
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const hasChanges = () => {
        return (
            localSettings.defaultPublisherId !== settings.defaultPublisherId ||
            localSettings.requestParameterDefaultName !== settings.requestParameterDefaultName ||
            localSettings.responsePropertyDefaultName !== settings.responsePropertyDefaultName
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updates: Array<Promise<void>> = [];
            
            if (localSettings.defaultPublisherId !== settings.defaultPublisherId) {
                updates.push(updateSetting('defaultPublisherId', localSettings.defaultPublisherId));
            }
            if (localSettings.requestParameterDefaultName !== settings.requestParameterDefaultName) {
                updates.push(updateSetting('requestParameterDefaultName', localSettings.requestParameterDefaultName));
            }
            if (localSettings.responsePropertyDefaultName !== settings.responsePropertyDefaultName) {
                updates.push(updateSetting('responsePropertyDefaultName', localSettings.responsePropertyDefaultName));
            }

            await Promise.all(updates);
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

    if (isLoadingSettings) {
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
                        <Input 
                            value={localSettings.defaultPublisherId || ''} 
                            onChange={(e) => setLocalSettings({
                                ...localSettings,
                                defaultPublisherId: e.target.value || null
                            })}
                            placeholder="Enter publisher GUID"
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field 
                        label="Request Parameter Default Name"
                        hint="Template for new request parameter names"
                    >
                        <Input 
                            value={localSettings.requestParameterDefaultName || ''} 
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
                            value={localSettings.responsePropertyDefaultName || ''} 
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
};
