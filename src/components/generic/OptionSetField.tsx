import React from 'react';
import {
    Dropdown,
    Option,
    Spinner,
} from '@fluentui/react-components';
import { CircleFilled } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { useOptionSetValues } from '../../hooks/useOptionSetValues';
import { OptionsetType } from '../../models/OptionSet';

interface OptionSetFieldProps {
    entityLogicalName: string;
    attributeLogicalName: string;
    optionSetType: OptionsetType;
    value: number | undefined;
    onChange: (value: number | undefined) => void;
}

export const OptionSetField: React.FC<OptionSetFieldProps> = ({
    entityLogicalName,
    attributeLogicalName,
    optionSetType,
    value,
    onChange,
}) => {
    const styles = useStyles();
    const { options, isFetching } = useOptionSetValues(entityLogicalName, attributeLogicalName, optionSetType);

    if (isFetching) {
        return <Spinner size="tiny" label="Loading options..." />;
    }

    const selectedValue = value?.toString();

    return (
        <Dropdown
            appearance="filled-darker"
            placeholder="Select value"
            selectedOptions={selectedValue ? [selectedValue] : []}
            value={options.find(o => o.Value.toString() === selectedValue)?.Label?.UserLocalizedLabel?.Label ?? ''}
            onOptionSelect={(_, data) => {
                onChange(data.optionValue ? parseInt(data.optionValue, 10) : undefined);
            }}
        >
            {options.map(opt => {
                const label = opt.Label?.UserLocalizedLabel?.Label ?? opt.Value.toString();
                return (
                    <Option key={opt.Value} value={opt.Value.toString()} text={label}>
                        <span className={styles.optionLabel}>
                            {opt.Color && (
                                <CircleFilled className={styles.icon12} style={{ color: opt.Color }} />
                            )}
                            {label}
                        </span>
                    </Option>
                );
            })}
        </Dropdown>
    );
};
