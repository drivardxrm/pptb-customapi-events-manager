import { Button, mergeClasses, Tag, TagPicker, TagPickerControl, TagPickerGroup, TagPickerInput, TagPickerList, TagPickerOption, TagPickerProps, useTagPickerFilter } from '@fluentui/react-components';
import React, { JSX, useMemo, useState } from 'react';
import { useStyles } from '../styles/Styles';
import { ChevronDown20Regular, DismissRegular } from '@fluentui/react-icons';


// TODO add image support
export interface SelectableItem {
    id: string;
    displayText: string;
    image: JSX.Element | null;
}


interface GenericTagPickerProps<T extends SelectableItem> {
    items: T[]
    isDisabled?: boolean;
    onSelect?: (id: string | null, item?: T) => void;
}

export const GenericTagPicker = <T extends SelectableItem>({ items, isDisabled, onSelect }: GenericTagPickerProps<T>) => {
   
    //const { solutions } = useSolutions();
    const [query, setQuery] = useState<string>("");                     
    const [isFocused, setIsFocused] = useState(false);
    const [isInputFocused, setInputFocused] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
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
        onSelect?.(null, undefined)
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
              onSelect?.(null, undefined)
          }else{
              setSelectedOption(data.value)
              const item = items.find((item) => item.id === data.value)
              onSelect?.(data.value, item)
          }
        setQuery('');
        setInputFocused(false);
    };

    const children = useTagPickerFilter({
        query,
        options: items.map((item) => item.id),
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
            media={
                items.find((item) => item.id === optionidToRender)?.image
            }
            text={items.find((item) => item.id === optionidToRender)?.displayText ?? ''}
            value={optionidToRender}
            key={optionidToRender}
        >
            {items.find((item) => item.id === optionidToRender)?.displayText}
        </TagPickerOption>
        ),

        filter: (item) =>
        (items.find((i) => i.id === item)?.displayText.toLowerCase().includes(query.toLowerCase()) ?? false)
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
                            media={
                                items.find((item) => item.id === selectedOption)?.image
                            }
                           
                            value={selectedOption}
                            title={items.find((item) => item.id === selectedOption)?.displayText}
                            dismissible = {false}
                            primaryText={{className: styles.tagOverflow }}
                            color='brand'
                        >
                            {items.find((item) => item.id === selectedOption)?.displayText}
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
