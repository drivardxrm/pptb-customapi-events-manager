import React, { useState } from 'react'
import { 
    Field, 
    Card,
    CardHeader,
    // Divider,
    Input,
} from '@fluentui/react-components'
import { useAppStore } from '../store/useAppStore'
import { useStyles } from '../styles/Styles'
import { useSolutions } from '../hooks/useSolutions'
import { GenericTagPicker, SelectableItem } from './generic/GenericTagPicker'
import { useCustomApis } from '../hooks/useCustomApis'
import { LockClosed16Regular, LockOpen16Regular } from '@fluentui/react-icons'
import { ManagedStateToggle, ManagedStateFilter } from './generic/ManagedStateToggle'




export const CustomApiSelector: React.FC = () => {
    const styles = useStyles()
    const { connection, isLoadingConnection, addLog,setSelectedSolutionId,setSelectedCustomApiId, selectedSolutionId, selectedCustomApiId } = useAppStore()
    const solutionsQuery = useSolutions()
    const customapisQuery = useCustomApis()
    
    
    //const [filter, setFilter] = useState<string>("all")
    const [showSolutions, setShowSolutions] = useState<ManagedStateFilter>('all')
    const [showCustomApis, setShowCustomApis] = useState<ManagedStateFilter>('all')
    

    if (!isLoadingConnection && connection?.isActive === false) {
        return (
            <Card className={styles.card}>
                <CardHeader header={<h3>Custom API Selector</h3>} />
                <div className={styles.infoBox}>
                    <p>No connection</p>
                    <p>Please select a Connection</p>
                </div>
            </Card>
        );
    }

    
    return (
        <Card className={styles.card}>
            {/* <CardHeader 
                header={<h2>Custom API Selector</h2>}
                // description={"Select a Custom API or Create a new one"}
            />
            <Divider /> */}
            
            <div className={styles.formGrid}>
               
                <div className={styles.formSection}>
                    <Field label={
                        <div className={styles.fieldLabelWithToggle}>
                            <span className={styles.semiBoldLabel}>Selected Solution</span>
                            <ManagedStateToggle 
                                value={showSolutions} 
                                onChange={setShowSolutions} 
                            />
                        </div>
                    }
                    hint={selectedSolutionId != null && selectedSolutionId != '' ? 'Clear to show all Custom APIs' : 'Leave empty to show all Custom APIs'}
                    >
                        {solutionsQuery.isFetching && (
                            <Input 
                                appearance='filled-darker'
                                value={"Loading solutions..."} 
                                readOnly 
                                
                            />
                        )}
                        {solutionsQuery.error && (
                            <Input 
                                appearance='filled-darker'
                                value={`Error loading solutions: ${solutionsQuery.error.message}`} 
                                readOnly 
                                
                            />
                        )}
                        {!solutionsQuery.isFetching && solutionsQuery.solutions && (
                            <GenericTagPicker 
                                items={solutionsQuery.solutions
                                                                .filter(s => (showSolutions === 'all' || (s.ismanaged && showSolutions === 'managed') || (!s.ismanaged && showSolutions === 'unmanaged')))
                                                                .map(s => ({
                                                                        id: s.solutionid,
                                                                        displayText: `${s.friendlyname} (${s.uniquename})`,
                                                                        image: s.ismanaged ? <LockClosed16Regular /> : <LockOpen16Regular />
                                                                    } as SelectableItem)      
                                                                ).sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}  
                                //isDisabled={filter !== 'solution'} 
                                onSelect={(id) => {
                                    setSelectedSolutionId(id);
                                    if(id){
                                        addLog(`Solution selected: ${id}`, 'info');
                                    } else {
                                        addLog('Solution selection cleared', 'info');
                                    }
                                }}
                            />
                        )}
                    </Field>
                    
                </div>
            {/* </div>
            <div className={styles.formGrid}> */}
                <div className={styles.formSection}>
                    <Field label={
                        <div className={styles.fieldLabelWithToggle}>
                            <span className={styles.semiBoldLabel}>Selected Custom API</span>
                            <ManagedStateToggle 
                                value={showCustomApis} 
                                onChange={setShowCustomApis} 
                            />
                        </div>
                    }>
                        {customapisQuery.isFetching && (

                             <Input 
                                appearance='filled-darker'
                                value={"Loading custom apis..."} 
                                readOnly 
                            />
                        )}
                        {customapisQuery.error && (
                            <Input 
                                value={`Error loading custom apis: ${customapisQuery.error.message}`} 
                                readOnly 
                                appearance='filled-darker'
                            />
                        )}
                        {!customapisQuery.isFetching && customapisQuery.customapis && (
                            <GenericTagPicker 
                                items={customapisQuery.customapis
                                    .filter(s => showCustomApis === 'all' || (s.ismanaged && showCustomApis === 'managed') || (!s.ismanaged && showCustomApis === 'unmanaged'))
                                    .map(c => ({
                                        id: c.customapiid,
                                        displayText: `${c.name} (${c.uniquename})`
                                    } as SelectableItem)      
                                ).sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}  
                                initialValue={customapisQuery.customapis.find(c => c.customapiid === selectedCustomApiId)?.customapiid || ''}
                                onSelect={(id) => {
                                    setSelectedCustomApiId(id);
                                    if(id){
                                        addLog(`Custom API selected: ${id}`, 'info');
                                    } else {
                                        addLog('Custom API selection cleared', 'warning');
                                    }
                                }}
                            />
                    )}
                    </Field>
                </div>

                
            </div>
        </Card>
    );
};
