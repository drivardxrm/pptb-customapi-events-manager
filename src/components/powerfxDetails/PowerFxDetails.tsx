import React, { useMemo } from 'react';
import {  
    Card,
    CardHeader,
    Field,
    Image,
    mergeClasses,
    Spinner,
    Textarea,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';
import powerFxImage from '../../assets/powerfx.png';
import { useAppStore } from '../../store/useAppStore';
import { useFxExpression } from '../../hooks/useFxExpressions';
import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { darkTheme } from '@uiw/react-json-view/dark';

interface PowerFxDetailsProps {
    fxexpressionid: string;
}

export const PowerFxDetails: React.FC<PowerFxDetailsProps> = ({ fxexpressionid }) => {
    const styles = useStyles();
    const { editingComponent, theme } = useAppStore();
    const isLocked = editingComponent !== 'none';
    const { fxexpression, isFetching } = useFxExpression(fxexpressionid);

       // Parse the expression string into a JSON object
    const parsedContext = useMemo(() => {
        if (!fxexpression?.context) return null;
        try {
            return JSON.parse(fxexpression.context);
        } catch {
            return { raw: fxexpression.context };
        }
    }, [fxexpression?.context]);


    return (
        <>
            <Card className={mergeClasses(styles.card, isLocked && styles.lockedSection)}>
                <CardHeader 
                    header={
                        <div className={styles.cardHeaderContainer}>
                            <div className={styles.cardHeaderRow}>
                                <Image alt="PowerFx" src={powerFxImage} height={40} width={40} />
                                <h3 className={styles.headingNoMargin}>PowerFx Function</h3>
                            </div>
                        </div>
                    }
                />
                
                <div className={mergeClasses(styles.formSection, styles.fullWidth)}>
                    <Field label={<span className={styles.fieldLabelStandard}>Expression</span>}>
                        {isFetching ? (
                            <Spinner size="tiny" />
                        ) : (
                            <Textarea
                                value={fxexpression?.expression ?? ''}
                                readOnly
                                spellCheck={false}
                                appearance='filled-darker'
                                resize="vertical"
                                rows={4}
                            />
                        )}
                    </Field>
                </div>
                 <div className={styles.formSection}>
                    <Field label={<span className={styles.fieldLabelStandard}>Context</span>}>
                        {isFetching ? (
                            <Spinner size="tiny" />
                        ) : (
                            <JsonView
                                value={parsedContext}
                                displayDataTypes={false}
                                collapsed={2}
                                style={theme === 'light' ? lightTheme : darkTheme}
                                shortenTextAfterLength={0}
                            />
                        )}
                    </Field>
                </div>
            </Card>
           
        </>
    );

};
