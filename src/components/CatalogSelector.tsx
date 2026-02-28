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
import { useCatalogs } from '../hooks/useCatalogs'
import { LockClosed16Regular,LockClosed16Filled, LockOpen16Regular, LockOpen16Filled, SelectAllOffRegular, SelectAllOffFilled } from '@fluentui/react-icons'




export const CatalogSelector: React.FC = () => {
    const styles = useStyles()
    const { connection, isLoadingConnection, addLog, setSelectedSolutionId, setSelectedCatalogId, selectedSolutionId, selectedCatalogId } = useAppStore()
    const solutionsQuery = useSolutions()
    const catalogsQuery = useCatalogs()
    
    
    //const [filter, setFilter] = useState<string>("all")
    const [showSolutions, setShowSolutions] = useState<'all'|'unmanaged'|'managed'>('all')
    const [showCatalogs, setShowCatalogs] = useState<'all'|'unmanaged'|'managed'>('all')
    

    if (!isLoadingConnection && connection?.isActive === false) {
        return (
            <Card className={styles.card}>
                <CardHeader header={<h3>Catalog Selector</h3>} />
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
                header={<h2>Catalog Selector</h2>}
                // description={"Select a Catalog or Create a new one"}
            />
            <Divider />
            
            <div className={styles.formGrid}>
               
                <div className={styles.formSection}>
                    <Field label={
                        <div className={styles.flexRowCentered}>
                            <span className={styles.semiBoldLabel}>Selected Solution</span>
                            <div className={styles.toggleGroup}>
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
                    hint={selectedSolutionId != null && selectedSolutionId != '' ? 'Clear to show all Catalogs' : 'Leave empty to show all Catalogs'}
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
                        <div className={styles.flexRowCentered}>
                            <span className={styles.semiBoldLabel}>Selected Catalog</span>
                            <div className={styles.toggleGroup}>
                                <ToggleButton
                                    appearance={showCatalogs === 'all' ? 'primary' : 'secondary'}
                                    size='small'
                                    shape='circular'
                                    icon={showCatalogs === 'all' ? <SelectAllOffFilled /> : <SelectAllOffRegular />}
                                    checked={showCatalogs === 'all'}
                                    onClick={
                                        () => setShowCatalogs('all')      
                                    }
                                    title="All"
                                >
                                    <>
                                        All
                                        
                                    </>
                                </ToggleButton>                         
                                <ToggleButton
                                    appearance={showCatalogs === 'unmanaged' ? 'primary' : 'secondary'}
                                    size='small'
                                    shape='circular'
                                    icon={showCatalogs === 'unmanaged' ? <LockOpen16Filled /> : <LockOpen16Regular />}
                
                                    checked={showCatalogs === 'unmanaged'}
                                    onClick={
                                        () => setShowCatalogs('unmanaged')      
                                    }
                                    title="Unmanaged"
                                >
                                    <>
                                        Unmanaged
                                    </>
                                </ToggleButton>
                                <ToggleButton
                                    appearance={showCatalogs === 'managed' ? 'primary' : 'secondary'}
                                    size='small'
                                    shape='circular'
                                    icon={showCatalogs === 'managed' ? <LockClosed16Filled /> : <LockClosed16Regular />}
                                    checked={showCatalogs === 'managed'}
                                    onClick={
                                        () => setShowCatalogs('managed')      
                                    }
                                    title="Managed"
                                >
                                    <>
                                        Managed
                                    </>
                                </ToggleButton>
                            </div>
                        </div>
                    }>
                        {catalogsQuery.isFetching && (

                             <Input 
                                appearance='filled-darker'
                                value={"Loading catalogs..."} 
                                readOnly 
                            />
                        )}
                        {catalogsQuery.error && (
                            <Input 
                                value={`Error loading catalogs: ${catalogsQuery.error.message}`} 
                                readOnly 
                                appearance='filled-darker'
                            />
                        )}
                        {!catalogsQuery.isFetching && catalogsQuery.catalogs && (
                            <GenericTagPicker 
                                items={catalogsQuery.catalogs
                                    .filter(c => showCatalogs === 'all' || (c.ismanaged && showCatalogs === 'managed') || (!c.ismanaged && showCatalogs === 'unmanaged'))
                                    .map(c => ({
                                        id: c.catalogid,
                                        displayText: `${c.name} (${c.uniquename})`,
                                        image: c.ismanaged ? <LockClosed16Regular /> : <LockOpen16Regular />
                                    } as SelectableItem)      
                                ).sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}  
                                initialValue={catalogsQuery.catalogs.find(c => c.catalogid === selectedCatalogId)?.catalogid || ''}
                                onSelect={(id) => {
                                    setSelectedCatalogId(id);
                                    if(id){
                                        addLog(`Catalog selected: ${id}`, 'info');
                                    } else {
                                        addLog('Catalog selection cleared', 'warning');
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
