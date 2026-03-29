import React, { useState } from 'react'
import { 
    Field, 
    Card,
    CardHeader,
    Divider,
    Input,
    Button,
    Text,
} from '@fluentui/react-components'
import { useAppStore } from '../store/useAppStore'
import { useStyles } from '../styles/Styles'
import { useSolutions } from '../hooks/useSolutions'
import { GenericTagPicker, SelectableItem } from './generic/GenericTagPicker'
import { useCatalogs } from '../hooks/useCatalogs'
import { LockClosedRegular, LockOpenRegular, ChevronRightRegular, ChevronDownRegular } from '@fluentui/react-icons'
import { ManagedStateToggle, ManagedStateFilter } from './generic/ManagedStateToggle'


export const CatalogSelector: React.FC = () => {
    const styles = useStyles()
    const { connection, isLoadingConnection, addLog, setSelectedSolutionId, setSelectedCatalogId, selectedSolutionId, selectedCatalogId } = useAppStore()
    const solutionsQuery = useSolutions()
    const catalogsQuery = useCatalogs()
    
    const [filtersExpanded, setFiltersExpanded] = useState(false)
    const [showSolutions, setShowSolutions] = useState<ManagedStateFilter>('all')

    // Calculate active filter count
    const activeFilterCount = (selectedSolutionId ? 1 : 0) + (showSolutions !== 'all' ? 1 : 0)

    // Filter solutions based on managed state
    const filteredSolutions = solutionsQuery.solutions?.filter(s => 
        showSolutions === 'all' || 
        (s.ismanaged && showSolutions === 'managed') || 
        (!s.ismanaged && showSolutions === 'unmanaged')
    ) ?? []

    // Filter Catalogs based on selected solution
    const filteredCatalogs = catalogsQuery.catalogs ?? []

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
            />
            <Divider />
            
            <div className={styles.flexColumnM}>
                {/* Primary Picker - Catalog */}
                <div className={styles.formSection}>
                    <Field label={<span className={styles.semiBoldLabel}>Catalog</span>}>
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
                            <>
                                <GenericTagPicker 
                                    items={filteredCatalogs
                                        .map(c => ({
                                            id: c.catalogid,
                                            displayText: `${c.name} (${c.uniquename})`,
                                            image: c.ismanaged ? <LockClosedRegular /> : <LockOpenRegular />
                                        } as SelectableItem))
                                        .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}  
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
                                {filteredCatalogs.length === 0 && (
                                    <Text className={styles.hintTextItalic}>No Catalogs match your filters.</Text>
                                )}
                            </>
                        )}
                    </Field>
                </div>

                {/* Collapsible Filters Section */}
                <div className={styles.flexColumn}>
                    <Button
                        appearance="subtle"
                        icon={filtersExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
                        onClick={() => setFiltersExpanded(!filtersExpanded)}
                        size="small"
                    >
                        Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                    </Button>
                    
                    {filtersExpanded && (
                        <div className={styles.formSection} style={{ paddingLeft: '24px', paddingTop: '8px' }}>
                            {/* Solution Filter */}
                            <Field 
                                label={<span className={styles.semiBoldLabel}>Solution</span>}
                                hint={selectedSolutionId ? 'Clear to show all Catalogs' : 'Leave empty to show all Catalogs'}
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
                                    <>
                                        <GenericTagPicker 
                                            items={filteredSolutions
                                                .map(s => ({
                                                    id: s.solutionid,
                                                    displayText: `${s.friendlyname} (${s.uniquename})`,
                                                    image: s.ismanaged ? <LockClosedRegular /> : <LockOpenRegular />
                                                } as SelectableItem))
                                                .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}  
                                            initialValue={solutionsQuery.solutions.find(s => s.solutionid === selectedSolutionId)?.solutionid || ''}
                                            onSelect={(id) => {
                                                setSelectedSolutionId(id);
                                                if(id){
                                                    addLog(`Solution selected: ${id}`, 'info');
                                                } else {
                                                    addLog('Solution selection cleared', 'info');
                                                }
                                            }}
                                        />
                                        {filteredSolutions.length === 0 && (
                                            <Text className={styles.hintTextItalic}>No solutions match your filter.</Text>
                                        )}
                                    </>
                                )}
                            </Field>

                            {/* Managed State Toggle */}
                            <Field label={<span className={styles.semiBoldLabel}>Show Solutions</span>}>
                                <ManagedStateToggle 
                                    value={showSolutions} 
                                    onChange={setShowSolutions} 
                                />
                            </Field>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
