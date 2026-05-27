import React, { useState, useMemo, useEffect, useRef } from 'react'
import { 
    Field, 
    Card,
    Input,
    Button,
    Text,
    mergeClasses,
    ToggleButton,
    Badge,
} from '@fluentui/react-components'
import { useAppStore } from '../store/useAppStore'
import { useStyles } from '../styles/Styles'
import { useSolutions } from '../hooks/useSolutions'
import { GenericTagPicker, SelectableItem } from './generic/GenericTagPicker'
import { useCustomApis } from '../hooks/useCustomApis'
import { LockClosedRegular, LockOpenRegular, ChevronRightRegular, FilterFilled, MathFormulaRegular, MathFormulaFilled, FlashFlowRegular, FlashFlowFilled } from '@fluentui/react-icons'
import { useCatalogAssignements } from '../hooks/useCatalogAssignments'
import { ManagedStateToggle, ManagedStateFilter } from './generic/ManagedStateToggle'
import { useAppSettings } from '../hooks/useAppSettings'
import { DEFAULT_SETTINGS } from '../models/AppSettings'


export const CustomApiSelector: React.FC = () => {
    const styles = useStyles()
    const {
        connection,
        addLog,
        setSelectedSolutionId,
        setSelectedCustomApiId,
        selectedSolutionId,
        selectedCustomApiId,
        editingComponent,
        selectedNavItem,
        pendingManagedFilterHandoff,
        setPendingManagedFilterHandoff,
        setCurrentCustomApiSelectionInit,
    } = useAppStore()
    const solutionsQuery = useSolutions()
    const customapisQuery = useCustomApis()
    const catalogAssignmentsQuery = useCatalogAssignements()
    const { appsettings } = useAppSettings()
    const isLocked = editingComponent !== 'none';
    
    const [filtersExpanded, setFiltersExpanded] = useState(true)
    const [showCustomApis, setShowCustomApis] = useState<ManagedStateFilter>(DEFAULT_SETTINGS.customApiSelectionInit)
    const [showSolutions, setShowSolutions] = useState<ManagedStateFilter>('all')
    const [showPowerFxOnly, setShowPowerFxOnly] = useState(false)
    const [showBusinessEventsOnly, setShowBusinessEventsOnly] = useState(false)
    const customApiFilterWasChangedRef = useRef(false)

    useEffect(() => {
        if (selectedCustomApiId || editingComponent === 'customapi') {
            setFiltersExpanded(false)
        }
    }, [selectedCustomApiId, editingComponent])

    useEffect(() => {
        customApiFilterWasChangedRef.current = false
        setShowCustomApis(DEFAULT_SETTINGS.customApiSelectionInit)
    }, [connection?.id])

    useEffect(() => {
        if (customApiFilterWasChangedRef.current) {
            return
        }

        setShowCustomApis(appsettings?.customApiSelectionInit ?? DEFAULT_SETTINGS.customApiSelectionInit)
    }, [appsettings?.customApiSelectionInit, connection?.id])

    useEffect(() => {
        if (!pendingManagedFilterHandoff || pendingManagedFilterHandoff.target !== 'customapi') {
            return
        }

        if (selectedNavItem !== 'customapi' && selectedNavItem !== 'customapitester') {
            return
        }

        customApiFilterWasChangedRef.current = true
        setShowCustomApis(pendingManagedFilterHandoff.value)
        setPendingManagedFilterHandoff(null)
    }, [pendingManagedFilterHandoff, selectedNavItem, setPendingManagedFilterHandoff])

    useEffect(() => {
        setCurrentCustomApiSelectionInit(showCustomApis)
    }, [showCustomApis, setCurrentCustomApiSelectionInit])

    const handleShowCustomApisChange = (value: ManagedStateFilter) => {
        customApiFilterWasChangedRef.current = true
        setShowCustomApis(value)
    }

    // Create Set of Custom API IDs that are Business Events (have a CatalogAssignment)
    const businessEventCustomApiIds = new Set(
        catalogAssignmentsQuery.catalogAssignments
            .filter(ca => ca._object_value)
            .map(ca => ca._object_value)
    )

    // Calculate active filter count
    const activeFilterCount = 
        (selectedSolutionId ? 1 : 0) + 
        (showCustomApis !== 'all' ? 1 : 0) +
        (showPowerFxOnly ? 1 : 0) +
        (showBusinessEventsOnly ? 1 : 0)

    // Filter solutions based on managed state
    const filteredSolutions = solutionsQuery.solutions?.filter(s => 
        showSolutions === 'all' || 
        (s.ismanaged && showSolutions === 'managed') || 
        (!s.ismanaged && showSolutions === 'unmanaged')
    ) ?? []

    // Build filter summary for collapsed state
    const filterSummary = useMemo(() => {
        const parts: React.ReactElement[] = []
        
        // Selected solution
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

        // Managed state filter for Custom APIs
        if (showCustomApis !== 'all') {
            parts.push(
                <Badge key="customapi-managed" appearance="outline" size="small">
                    {showCustomApis === 'managed' ? <LockClosedRegular /> : <LockOpenRegular />} {showCustomApis === 'managed' ? 'Managed' : 'Unmanaged'} APIs
                </Badge>
            )
        }

        // PowerFx filter
        if (showPowerFxOnly) {
            parts.push(
                <Badge key="powerfx" appearance="filled" color="informative" size="small">
                    <MathFormulaFilled /> PowerFx
                </Badge>
            )
        }

        // Business Event filter
        if (showBusinessEventsOnly) {
            parts.push(
                <Badge key="businessevent" appearance="filled" color="informative" size="small">
                    <FlashFlowFilled /> Business Event
                </Badge>
            )
        }

        return parts
    }, [selectedSolutionId, showCustomApis, showPowerFxOnly, showBusinessEventsOnly, solutionsQuery.solutions])

    // Filter Custom APIs based on Custom API managed state filter, PowerFx filter, and Business Event filter
    const filteredCustomApis = customapisQuery.customapis?.filter(c => 
        (showCustomApis === 'all' || 
        (c.ismanaged && showCustomApis === 'managed') || 
        (!c.ismanaged && showCustomApis === 'unmanaged')) &&
        (!showPowerFxOnly || c._fxexpressionid_value) &&
        (!showBusinessEventsOnly || businessEventCustomApiIds.has(c.customapiid))
    ) ?? []

    return (
        <Card className={mergeClasses(styles.card, isLocked && styles.lockedSection)}>
            <div className={styles.selectorGrid}>
                {/* LEFT COLUMN: Custom API Picker */}
                <div className={styles.selectorColumn}>
                    <Field label={<span className={styles.semiBoldLabel}>Selected Custom API</span>}>
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
                            <>
                                <GenericTagPicker 
                                    items={filteredCustomApis
                                        .map(c => ({
                                            id: c.customapiid,
                                            displayText: `${c.name} (${c.uniquename})`,
                                            image: c.ismanaged ? <LockClosedRegular /> : <LockOpenRegular />
                                        } as SelectableItem))
                                        .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}  
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
                                {filteredCustomApis.length === 0 && (
                                    <Text className={styles.hintTextItalic}>No Custom APIs match your filters.</Text>
                                )}
                            </>
                        )}
                    </Field>
                </div>

                {/* RIGHT COLUMN: Collapsible Filters Section */}
                <div className={mergeClasses(styles.selectorColumn, styles.subtleBorderedBox)}>
                    <Button
                        appearance="subtle"
                        icon={filtersExpanded ? <FilterFilled /> : <ChevronRightRegular />}
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
                                
                                
                                
                                <Field label=
                                    {
                                        <div className={styles.fieldLabelWithToggle}>
                                            <span className={styles.semiBoldLabel}>Solution</span>
                                            <ManagedStateToggle 
                                                value={showSolutions} 
                                                onChange={setShowSolutions} 
                                            />
                                        </div>
                                    }
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

                                <Field label=
                                    {
                                        <div className={styles.fieldLabelWithToggle}>
                                            <span className={styles.semiBoldLabel}>Custom API filters</span>
                                        </div>
                                    }
                                >
                                    <div className={styles.flexColumn} style={{ alignItems: 'flex-start' }}>
                                        <ManagedStateToggle 
                                            value={showCustomApis} 
                                            onChange={handleShowCustomApisChange}
                                        />
                                        <div className={styles.flexRow} style={{ gap: '8px' }}>
                                            <ToggleButton
                                                appearance={showPowerFxOnly ? 'primary' : 'secondary'}
                                                size="small"
                                                shape="circular"
                                                icon={showPowerFxOnly ? <MathFormulaFilled /> : <MathFormulaRegular />}
                                                checked={showPowerFxOnly}
                                                onClick={() => setShowPowerFxOnly(!showPowerFxOnly)}
                                                title="PowerFx"
                                            >
                                                PowerFx
                                            </ToggleButton>
                                            <ToggleButton
                                                appearance={showBusinessEventsOnly ? 'primary' : 'secondary'}
                                                size="small"
                                                shape="circular"
                                                icon={showBusinessEventsOnly ? <FlashFlowFilled /> : <FlashFlowRegular />}
                                                checked={showBusinessEventsOnly}
                                                onClick={() => setShowBusinessEventsOnly(!showBusinessEventsOnly)}
                                                title="Business Event"
                                            >
                                                Business Event
                                            </ToggleButton>
                                        </div>
                                    </div>
                                </Field>
                                
                                
                                
                            </div>
                        </div>
                        
                    )}
                </div>
            </div>
        </Card>
    );
};
