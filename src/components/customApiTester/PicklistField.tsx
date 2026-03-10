import React from 'react';
import {
    Dropdown,
    Option,
    Spinner,
} from '@fluentui/react-components';
import { useOptionSetValues } from '../../hooks/useOptionSetValues';

interface PicklistFieldProps {
    entityLogicalName: string;
    attributeLogicalName: string;
    value: number | undefined;
    onChange: (value: number | undefined) => void;
}

export const PicklistField: React.FC<PicklistFieldProps> = ({
    entityLogicalName,
    attributeLogicalName,
    value,
    onChange,
}) => {
    const { options, isFetching } = useOptionSetValues(entityLogicalName, attributeLogicalName);

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
            {options.map(opt => (
                <Option key={opt.Value} value={opt.Value.toString()}>
                    {opt.Label?.UserLocalizedLabel?.Label ?? opt.Value.toString()}
                </Option>
            ))}
        </Dropdown>
    );
};
