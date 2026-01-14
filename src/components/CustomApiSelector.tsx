import React, { useState } from 'react'
import { 
    Field, 
    Card,
    CardHeader,
    Divider,
    Input,
    ToggleButton
} from '@fluentui/react-components'
import { useAppStore } from '../store/useAppStore'
import { useStyles } from '../styles/Styles'
import { useSolutions } from '../hooks/useSolutions'
import { GenericTagPicker, SelectableItem } from './generic/GenericTagPicker'
import { useCustomApis } from '../hooks/useCustomApis'
import { LockClosed16Regular,LockClosed16Filled, LockOpen16Regular, LockOpen16Filled, SelectAllOffRegular, SelectAllOffFilled } from '@fluentui/react-icons'




export const CustomApiSelector: React.FC = () => {
    const styles = useStyles()
    const { connection, isLoadingConnection, addLog,setSelectedSolutionId,setSelectedCustomApiId, selectedSolutionId, selectedCustomApiId } = useAppStore()
    const solutionsQuery = useSolutions()
    const customapisQuery = useCustomApis()
    
    
    //const [filter, setFilter] = useState<string>("all")
    const [showSolutions, setShowSolutions] = useState<'all'|'unmanaged'|'managed'>('all')
    const [showCustomApis, setShowCustomApis] = useState<'all'|'unmanaged'|'managed'>('all')
    

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
            <CardHeader 
                header={<h3>Custom API Selector</h3>}
                description={"Select a Custom API or Create a new one"}
            />
            <Divider />
            
            <div className={styles.formGrid}>
               
                <div className={styles.formSection}>
                    <Field label={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={styles.semiBoldLabel}>Selected Solution</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <ToggleButton
                                    appearance={showSolutions === 'all' ? 'primary' : 'secondary'}
                                    size='small'
                                    shape='circular'
                                    icon={showSolutions === 'all' ? <SelectAllOffFilled /> : <SelectAllOffRegular />}
                                    checked={showSolutions === 'all'}
                                    onClick={
                                        () => setShowSolutions('all')      
                                    }
                                    title="All"
                                >
                                    <>
                                        All
                                        
                                    </>
                                </ToggleButton>                         
                                <ToggleButton
                                    appearance={showSolutions === 'unmanaged' ? 'primary' : 'secondary'}
                                    size='small'
                                    shape='circular'
                                    icon={showSolutions === 'unmanaged' ? <LockOpen16Filled /> : <LockOpen16Regular />}
                
                                    checked={showSolutions === 'unmanaged'}
                                    onClick={
                                        () => setShowSolutions('unmanaged')      
                                    }
                                    title="Unmanaged"
                                >
                                    <>
                                        Unmanaged
                                    </>
                                </ToggleButton>
                                <ToggleButton
                                    appearance={showSolutions === 'managed' ? 'primary' : 'secondary'}
                                    size='small'
                                    shape='circular'
                                    icon={showSolutions === 'managed' ? <LockClosed16Filled /> : <LockClosed16Regular />}
                                    checked={showSolutions === 'managed'}
                                    onClick={
                                        () => setShowSolutions('managed')      
                                    }
                                    title="Managed"
                                >
                                    <>
                                        Managed
                                        {/* {showSolutionManaged ? <CheckmarkCircleColor /> : <DismissCircleColor/>} */}
                                    </>
                                </ToggleButton>
                                
                            </div>
                        </div>
                    }
                    hint={selectedSolutionId != null && selectedSolutionId != '' ? 'Clear to show all Custom APIs' : ''}
                    >
                        {solutionsQuery.isFetching && (
                            <Input 
                                value={"Loading solutions..."} 
                                readOnly 
                                className={styles.readOnlyInput}
                            />
                        )}
                        {solutionsQuery.error && (
                            <Input 
                                value={`Error loading solutions: ${solutionsQuery.error.message}`} 
                                readOnly 
                                className={styles.readOnlyInput}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={styles.semiBoldLabel}>Selected Custom API</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <ToggleButton
                                    appearance={showCustomApis === 'all' ? 'primary' : 'secondary'}
                                    size='small'
                                    shape='circular'
                                    icon={showCustomApis === 'all' ? <SelectAllOffFilled /> : <SelectAllOffRegular />}
                                    checked={showCustomApis === 'all'}
                                    onClick={
                                        () => setShowCustomApis('all')      
                                    }
                                    title="All"
                                >
                                    <>
                                        All
                                        
                                    </>
                                </ToggleButton>                         
                                <ToggleButton
                                    appearance={showCustomApis === 'unmanaged' ? 'primary' : 'secondary'}
                                    size='small'
                                    shape='circular'
                                    icon={showCustomApis === 'unmanaged' ? <LockOpen16Filled /> : <LockOpen16Regular />}
                
                                    checked={showCustomApis === 'unmanaged'}
                                    onClick={
                                        () => setShowCustomApis('unmanaged')      
                                    }
                                    title="Unmanaged"
                                >
                                    <>
                                        Unmanaged
                                    </>
                                </ToggleButton>
                                <ToggleButton
                                    appearance={showCustomApis === 'managed' ? 'primary' : 'secondary'}
                                    size='small'
                                    shape='circular'
                                    icon={showCustomApis === 'managed' ? <LockClosed16Filled /> : <LockClosed16Regular />}
                                    checked={showCustomApis === 'managed'}
                                    onClick={
                                        () => setShowCustomApis('managed')      
                                    }
                                    title="Managed"
                                >
                                    <>
                                        Managed
                                        {/* {showSolutionManaged ? <CheckmarkCircleColor /> : <DismissCircleColor/>} */}
                                    </>
                                </ToggleButton>
                            </div>
                        </div>
                    }>
                        {customapisQuery.isFetching && (

                             <Input 
                                value={"Loading custom apis..."} 
                                readOnly 
                                className={styles.readOnlyInput}
                            />
                        )}
                        {customapisQuery.error && (
                            <Input 
                                value={`Error loading custom apis: ${customapisQuery.error.message}`} 
                                readOnly 
                                className={styles.readOnlyInput}
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
