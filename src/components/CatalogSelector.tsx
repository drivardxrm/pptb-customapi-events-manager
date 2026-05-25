import React, { useEffect, useMemo, useRef, useState } from 'react'
import { 
    Field, 
    Card,
    CardHeader,
    Input,
    Button,
    Text,
    Badge,
    mergeClasses,
} from '@fluentui/react-components'
import { useAppStore } from '../store/useAppStore'
import { useStyles } from '../styles/Styles'
import { useSolutions } from '../hooks/useSolutions'
import { GenericTagPicker, SelectableItem } from './generic/GenericTagPicker'
import { useRootCatalogs } from '../hooks/useCatalogs'
import { LockClosedRegular, LockOpenRegular, ChevronRightRegular, ChevronDownRegular } from '@fluentui/react-icons'
import { ManagedStateToggle, ManagedStateFilter } from './generic/ManagedStateToggle'
import { useAppSettings } from '../hooks/useAppSettings'
import { DEFAULT_SETTINGS } from '../models/AppSettings'


export const CatalogSelector: React.FC = () => {
    const styles = useStyles()
    const { connection, isLoadingConnection, addLog, setSelectedSolutionId, setSelectedCatalogId, selectedSolutionId, selectedCatalogId, selectedNavItem } = useAppStore()
    const solutionsQuery = useSolutions()
    const catalogsQuery = useRootCatalogs()
    const { appsettings } = useAppSettings()
    
    const [filtersExpanded, setFiltersExpanded] = useState(false)
    const [showSolutions, setShowSolutions] = useState<ManagedStateFilter>('all')
    const [showCatalogs, setShowCatalogs] = useState<ManagedStateFilter>(DEFAULT_SETTINGS.businessEventSelectionInit)
    const previousSelectedCatalogId = useRef<string | null>(selectedCatalogId)
    const catalogFilterWasChangedRef = useRef(false)

    useEffect(() => {
        if (selectedNavItem === 'businessevent') {
            setFiltersExpanded(true)
        }
    }, [selectedNavItem])

    useEffect(() => {
        if (selectedCatalogId && selectedCatalogId !== previousSelectedCatalogId.current) {
            setFiltersExpanded(false)
        }

        previousSelectedCatalogId.current = selectedCatalogId
    }, [selectedCatalogId])

    useEffect(() => {
        catalogFilterWasChangedRef.current = false
        setShowCatalogs(DEFAULT_SETTINGS.businessEventSelectionInit)
    }, [connection?.id])

    useEffect(() => {
        if (catalogFilterWasChangedRef.current) {
            return
        }

        setShowCatalogs(appsettings?.businessEventSelectionInit ?? DEFAULT_SETTINGS.businessEventSelectionInit)
    }, [appsettings?.businessEventSelectionInit, connection?.id])

    const handleShowCatalogsChange = (value: ManagedStateFilter) => {
        catalogFilterWasChangedRef.current = true
        setShowCatalogs(value)
    }

    const filterSummary = useMemo(() => {
        const parts: React.ReactElement[] = []

        if (selectedSolutionId) {
            const solution = solutionsQuery.solutions?.find(s => s.solutionid === selectedSolutionId)
            if (solution) {
                parts.push(
                    <Badge key="solution" appearance="outline" size="small">
                        {solution.ismanaged ? <LockClosedRegular /> : <LockOpenRegular />} {solution.friendlyname}
                    </Badge>
                )
            }
        }

        if (showCatalogs !== 'all') {
            parts.push(
                <Badge key="catalog-managed" appearance="outline" size="small">
                    {showCatalogs === 'managed' ? <LockClosedRegular /> : <LockOpenRegular />} {showCatalogs === 'managed' ? 'Managed' : 'Unmanaged'} Catalogs
                </Badge>
            )
        }

        return parts
    }, [selectedSolutionId, showCatalogs, solutionsQuery.solutions])

    // Calculate active filter count
    const activeFilterCount = filterSummary.length

    // Filter solutions based on managed state
    const filteredSolutions = solutionsQuery.solutions?.filter(s => 
        showSolutions === 'all' || 
        (s.ismanaged && showSolutions === 'managed') || 
        (!s.ismanaged && showSolutions === 'unmanaged')
    ) ?? []

    // Filter catalogs based on managed state
    const filteredCatalogs = catalogsQuery.rootCatalogs?.filter(c =>
        showCatalogs === 'all' ||
        (c.ismanaged && showCatalogs === 'managed') ||
        (!c.ismanaged && showCatalogs === 'unmanaged')
    ) ?? []

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
            <div className={styles.selectorGrid}>
                {/* LEFT COLUMN: Catalog Picker */}
                <div className={styles.selectorColumn}>
                    <Field label={<span className={styles.semiBoldLabel}>Selected Catalog</span>}>
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
                        {!catalogsQuery.isFetching && catalogsQuery.rootCatalogs && (
                            <>
                                <GenericTagPicker 
                                    items={filteredCatalogs
                                        .map(c => ({
                                            id: c.catalogid,
                                            displayText: `${c.name} (${c.uniquename})`,
                                            image: c.ismanaged ? <LockClosedRegular /> : <LockOpenRegular />
                                        } as SelectableItem))
                                        .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}  
                                    initialValue={catalogsQuery.rootCatalogs.find(c => c.catalogid === selectedCatalogId)?.catalogid || ''}
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

                {/* RIGHT COLUMN: Collapsible Filters Section */}
                <div className={mergeClasses(styles.selectorColumn, styles.subtleBorderedBox)}>
                    <Button
                        appearance="subtle"
                        icon={filtersExpanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
                        onClick={() => setFiltersExpanded(!filtersExpanded)}
                        size="small"
                        className={styles.filterToggleButton}
                    >
                        Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                    </Button>

                    {!filtersExpanded && filterSummary.length > 0 && (
                        <div className={styles.badgeContainer}>
                            {filterSummary}
                        </div>
                    )}
                    
                    {filtersExpanded && (
                        <div className={styles.flexColumnM}>
                            {/* Solutions Filter Section */}
                            <div className={styles.filterSubsection}>
                                <Field label={
                                    <div className={styles.fieldLabelWithToggle}>
                                        <span className={styles.semiBoldLabel}>Selected Solution</span>
                                        <ManagedStateToggle 
                                            value={showSolutions} 
                                            onChange={setShowSolutions} 
                                        />
                                    </div>
                                }>
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

                                <Field label={
                                    <div className={styles.fieldLabelWithToggle}>
                                        <span className={styles.semiBoldLabel}>Catalog Filters</span>
                                    </div>
                                }>
                                    <ManagedStateToggle
                                        value={showCatalogs}
                                        onChange={handleShowCatalogsChange}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
