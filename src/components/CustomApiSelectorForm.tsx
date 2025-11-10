import React, { useState } from 'react';
import { 
    Field, 
    Card,
    CardHeader,
    Divider,
    RadioGroup,
    Radio
} from '@fluentui/react-components';
import { useAppStore } from '../store/useAppStore';
import { useStyles } from '../styles/Styles';
import { useSolutions } from '../hooks/useSolutions';
import { GenericTagPicker } from './GenericTagPicker';
import { solutionToSelectableItem } from '../models/Solution';
import { useCustomApis } from '../hooks/useCustomApis';
import { customapiToSelectableItem } from '../models/CustomApi';



export const CustomApiSelectorForm: React.FC = () => {
    const styles = useStyles();
    const connection = useAppStore((state) => state.connection);
    const isLoading = useAppStore((state) => state.isLoadingConnection);
    const addLog = useAppStore((state) => state.addLog);
    const setSelectedSolutionId = useAppStore((state) => state.setSelectedSolutionId);
    const setSelectedCustomApiId = useAppStore((state) => state.setSelectedCustomApiId);
    const solutionsQuery = useSolutions();
    const customapisQuery = useCustomApis();
    const [filter, setFilter] = useState<string>("all");   
    

    if (!isLoading && connection?.isActive === false) {
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
                {/* Filters */}
                <div className={styles.formSection}>
                    <Field label="Filter" >
                        <RadioGroup layout="horizontal"
                            value={filter}
                            onChange={(_, data) => setFilter(data.value)}
                        >
                            <Radio value="all" label="All" />
                            <Radio value="solution" label="BySolution" />
                        </RadioGroup>
                    </Field>
                    
                </div>
                <div className={styles.formSection}>
                    <Field label="Solution">
                        {!solutionsQuery.isFetching && solutionsQuery.solutions && (
                            <GenericTagPicker 
                                items={solutionsQuery.solutions.map(s => solutionToSelectableItem(s))} 
                                isDisabled={filter !== 'solution'} 
                                onSelect={(id) => {
                                    setSelectedSolutionId(id);
                                    if(id){
                                        addLog(`Solution selected: ${id}`, 'success');
                                    } else {
                                        addLog('Solution selection cleared', 'warning');
                                    }
                                }}
                            />
                        )}
                    </Field>
                    
                </div>
            </div>
            <div className={styles.formGrid}>
                <div className={styles.formSection}>
                    <Field label="Custom API">
                        {!customapisQuery.isFetching && customapisQuery.customapis && (
                            <GenericTagPicker 
                                items={customapisQuery.customapis.map(c => customapiToSelectableItem(c))}
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
