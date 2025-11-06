import { Button, mergeClasses, Tag, TagPicker, TagPickerControl, TagPickerGroup, TagPickerInput, TagPickerList, TagPickerOption, TagPickerProps, useTagPickerFilter } from '@fluentui/react-components';
import React, { useMemo, useState } from 'react';
import { useStyles } from '../styles/Styles';
import { ChevronDown20Regular, DismissRegular } from '@fluentui/react-icons';
import { useSolutions } from '../hooks/useSolutions';

interface SolutionSelectorProps {
    //connection: ToolBoxAPI.DataverseConnection | null;
    onLog: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SolutionSelector: React.FC<SolutionSelectorProps> = ({ onLog }) => {
   
    const { solutions } = useSolutions();
    const [query, setQuery] = useState<string>("");                     
    const [isFocused, setIsFocused] = useState(false);
    const [isInputFocused, setInputFocused] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
    const [isDisabled] = useState(false)
    const styles = useStyles()



    const selectedOptions = useMemo(
        () => (selectedOption ? [selectedOption] : []),
        [selectedOption]
    );

    const handleBlur = () => {
        setQuery('')
        setInputFocused(false)
    };

     const handleOnChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setInputFocused(e.target.value != ''); // if there is a value in the input, set to true (will hide the selected tag)
        setQuery(e.target.value)    
    };

    const handleClear: React.MouseEventHandler = (_event) => {
        setSelectedOption(undefined)
    };

    const onOptionSelect: TagPickerProps["onOptionSelect"] = (_e, data) => {
        if (data.value === 'no-matches') {
        setQuery('')
        setInputFocused(false)
        return;
        }

        // TODO SET SELECTED SOLUTION

        
        if(data.value === undefined || data.value === '-1'){
           setSelectedOption(undefined)
           onLog(`Solution selected: none`, 'info');
        }else{
           setSelectedOption(data.value)
           onLog(`Solution selected: ${solutions.find((sol) => sol.solutionid === data.value)?.friendlyname ?? ''}`, 'info');
        }
        setQuery('');
        setInputFocused(false);
    };

    const children = useTagPickerFilter({
        query,
        options: solutions.map((sol) => sol.solutionid),
        noOptionsElement: (
        <TagPickerOption value="no-matches">
            '**no match**'
        </TagPickerOption>
        ),
        renderOption: (optionidToRender) => (
        <TagPickerOption
            className={mergeClasses(
                styles.tagPickerOption, 
                optionidToRender === selectedOption ? styles.tagSelected : '')
            }
            // media={
            // options.find((option) => option.id === optionidToRender)?.imagesrc &&
            //     <Image
            //         className={styles.tagPickerOption}
            //         alt={options.find((option) => option.id === optionidToRender)?.displaytext}
            //         key={options.find((option) => option.id === optionidToRender)?.id}
            //         shape="square"
            //         src={options.find((option) => option.id === optionidToRender)?.imagesrc}
            //         height={24}
            //         //width={25}
            //     />
            // }
            text={solutions.find((sol) => sol.solutionid === optionidToRender)?.friendlyname ?? ''}
            value={optionidToRender}
            key={optionidToRender}
        >
            {solutions.find((sol) => sol.solutionid === optionidToRender)?.friendlyname}
        </TagPickerOption>
        ),

        filter: (solution) =>
        (solutions.find((sol) => sol.solutionid === solution)?.friendlyname.toLowerCase().includes(query.toLowerCase()) ?? false)
    });

    return (

            <div className={styles.tagpicker}>
                <TagPicker
                    onOptionSelect={onOptionSelect}
                    selectedOptions={selectedOptions}
                    appearance={'filled-darker'}
                    disabled={isDisabled}
                >
                    <TagPickerControl 
                    className={mergeClasses(
                        styles.tagPickerControl, 
                        !selectedOption ? styles.tagPickerControlEmpty : '',
                        isDisabled ? styles.tagPickerControlDisabled : '')
                    }
                    onMouseEnter={()=>{setIsFocused(true)}} 
                    onMouseLeave={()=>{setIsFocused(false)}}
                    expandIcon={<ChevronDown20Regular className={isFocused ? styles.elementVisible : styles.elementHidden}/>}
                    secondaryAction={
                        selectedOption  ?
                        
                            <Button
                            className={mergeClasses(
                                styles.clearButton, 
                                isFocused ? styles.elementVisible : styles.elementHidden)
                            }
                            appearance="transparent"
                            size="small"
                            shape="rounded"
                            onClick={handleClear}
                            icon={<DismissRegular/>}
                            >
                            
                            </Button>
                        :
                        null 
                    }
                    >
                    {selectedOption && (
                        <TagPickerGroup 
                        className={mergeClasses(
                            styles.tagPickerGroup, 
                            isInputFocused ? styles.tagPickerGroupHidden : styles.tagPickerGroupVisible)
                        }>
                        <Tag
                            key={selectedOption}
                            className={mergeClasses(
                            styles.tag,
                            isDisabled ? styles.tagDisabled : '',
                            )}
                            shape={'rounded'}
                            size={'medium'}
                            appearance={'outline'}
                            // media={
                            // options.find((option) => option.id === selectedOption)?.imagesrc &&
                            //     <Image
                            //         alt={options.find((option) => option.id === selectedOption)?.displaytext}
                            //         key={options.find((option) => option.id === selectedOption)?.id}
                            //         shape="square"
                            //         src={options.find((option) => option.id === selectedOption)?.imagesrc}
                            //         height={24}
                            //     />
                            
                            // }
                            value={selectedOption}
                            title={solutions.find((sol) => sol.solutionid === selectedOption)?.friendlyname}
                            dismissible = {false}
                            primaryText={{className: styles.tagOverflow }}
                            color='brand'
                        >
                            {solutions.find((sol) => sol.solutionid === selectedOption)?.friendlyname}
                        </Tag>
                        </TagPickerGroup>
                    )}
            
                    <TagPickerInput 
                        className={styles.tagPickerInput}
                        //aria-label={pcfcontext.SelectText()}
                        //placeholder={placeholder}
                        value={query}
                        onChange={handleOnChange} 
                        onBlur={handleBlur}
                        clearable={true}
                    />
                    </TagPickerControl>
                    <TagPickerList>
                        {children}
                    </TagPickerList>
                </TagPicker>
            </div>

    );
};
