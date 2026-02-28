import React from 'react';
import {  
    Card,
    CardHeader,
    Field,
    Image,
    mergeClasses,
    Textarea,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';
import powerFxImage from '../../assets/powerfx.png';
import { useAppStore } from '../../store/useAppStore';





export const PowerFxDetails: React.FC = () => {
    const styles = useStyles();
    const { editingComponent} = useAppStore();
    const isLocked = editingComponent !== 'none';

   
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
                        <Textarea
                            value={"{Exists: !IsBlank(LookUp(systemuser, fullname = FullName ))}"}
                            readOnly
                            appearance='filled-darker'
                            resize="vertical"
                            rows={2}
                        />
                    </Field>
                </div>
            </Card>
           
        </>
    );

};
