'use strict';

import {Box, Button as ButtonBase} from '@mui/material';
/** external libraries */
import React from 'react';
import {buttonErrorOutlined, resetSecondary, submitPrimaryOutlined} from '../component/Button';
import Icon from '../component/Icon';

/** internal components */
import LanguageContext from '../context/LanguageContext';
import logger from '../service/Logger';
import {NullaryType} from '../type/Function';
import {FormControl} from './FormControl';
import {ButtonListType, ButtonTypeEnum, FormType} from './Types';

type FormButtonsProps = {
    form: FormType
    buttons?: ButtonListType
}

export const FormButtons: React.FunctionComponent<FormButtonsProps> = (props) => {
    const languageContext = React.useContext(LanguageContext);

    const buttonsList: ButtonListType =
        props.buttons === undefined ? {[ButtonTypeEnum.SUBMIT]: [<Icon name="check"/>, 'button.ok']} : props.buttons;
    /** @info hack for ts compiler */
    const buttons: [string, [React.ReactElement, string, NullaryType?]][] = Object.entries(buttonsList);

    return (
        <FormControl>
            <Box className="d-flex align-items-center justify-content-center gap-1">
                {buttons.map(([type, button]) => {
                        const [icon, label, onClick] = button;

                        switch (type) {
                            case ButtonTypeEnum.SUBMIT:
                                return (
                                    <ButtonBase key={type}
                                                {...submitPrimaryOutlined}
                                                onClick={onClick}
                                    >
                                        {icon}{languageContext.translate(label)}
                                    </ButtonBase>
                                );
                            case ButtonTypeEnum.RESET:
                                return (
                                    <ButtonBase key={type}
                                                {...resetSecondary}
                                                onClick={() => {
                                                    props.form.resetForm();

                                                    onClick && onClick();
                                                }}
                                    >
                                        {icon}{languageContext.translate(label)}
                                    </ButtonBase>
                                );
                            case ButtonTypeEnum.CANCEL:
                                return (
                                    <ButtonBase key={type}
                                                {...buttonErrorOutlined}
                                                onClick={() => onClick && onClick()}
                                    >
                                        {icon}{languageContext.translate(label)}
                                    </ButtonBase>
                                );
                            default:
                                logger.error(`invalid button type "${type}"`);
                                break;
                        }
                    }
                )}
            </Box>
        </FormControl>
    );
};
