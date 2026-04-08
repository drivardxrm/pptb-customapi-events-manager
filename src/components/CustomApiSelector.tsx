import React, { useState } from 'react'
import { 
    Field, 
    Card,
    Input,
    Button,
    Text,
    mergeClasses,
    ToggleButton,
} from '@fluentui/react-components'
import { useAppStore } from '../store/useAppStore'
import { useStyles } from '../styles/Styles'
import { useSolutions } from '../hooks/useSolutions'
import { GenericTagPicker, SelectableItem } from './generic/GenericTagPicker'
import { useCustomApis } from '../hooks/useCustomApis'
import { LockClosedRegular, LockOpenRegular, ChevronRightRegular, FilterFilled, MathFormulaRegular, MathFormulaFilled } from '@fluentui/react-icons'
import { ManagedStateToggle, ManagedStateFilter } from './generic/ManagedStateToggle'


export const CustomApiSelector: React.FC = () => {
    const styles = useStyles()
    const { addLog, setSelectedSolutionId, setSelectedCustomApiId, selectedSolutionId, selectedCustomApiId, editingComponent } = useAppStore()
    const solutionsQuery = useSolutions()
    const customapisQuery = useCustomApis()
    const isLocked = editingComponent !== 'none';
    
    const [filtersExpanded, setFiltersExpanded] = useState(true)
    const [showCustomApis, setShowCustomApis] = useState<ManagedStateFilter>('all')
    const [showSolutions, setShowSolutions] = useState<ManagedStateFilter>('all')
    const [showPowerFxOnly, setShowPowerFxOnly] = useState(false)

    // Calculate active filter count
    const activeFilterCount = 
        (selectedSolutionId ? 1 : 0) + 
        (showCustomApis !== 'all' ? 1 : 0) +
        (showPowerFxOnly ? 1 : 0)

    // Filter solutions based on managed state
    const filteredSolutions = solutionsQuery.solutions?.filter(s => 
        showSolutions === 'all' || 
        (s.ismanaged && showSolutions === 'managed') || 
        (!s.ismanaged && showSolutions === 'unmanaged')
    ) ?? []

    // Filter Custom APIs based on Custom API managed state filter and PowerFx filter
    const filteredCustomApis = customapisQuery.customapis?.filter(c => 
        (showCustomApis === 'all' || 
        (c.ismanaged && showCustomApis === 'managed') || 
        (!c.ismanaged && showCustomApis === 'unmanaged')) &&
        (!showPowerFxOnly || c._fxexpressionid_value)
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
                                            onChange={setShowCustomApis} 
                                        />
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
