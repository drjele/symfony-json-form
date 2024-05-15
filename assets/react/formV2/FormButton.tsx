'use strict';

import {Box, Button} from '@mui/material';
import React from 'react';
import {buttonErrorOutlined, resetSecondary, submitPrimaryOutlined} from '../component/Button';
import Icon from '../component/Icon';
import {useLanguageContext} from '../context/LanguageContext';
import logger from '../service/Logger';
import {NullaryType} from '../type/Function';
import {ButtonListType, ButtonTypeEnum, FormContext, FormControl} from './Form';

type FormButtonProps = {
    buttons?: ButtonListType
}

export const FormButton: React.FunctionComponent<FormButtonProps> = (props) => {
    const formContext = React.useContext(FormContext);
    const languageContext = useLanguageContext();

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
                                    <Button key={type}
                                            {...submitPrimaryOutlined}
                                            onClick={onClick}
                                    >
                                        {icon}{languageContext.translate(label)}
                                    </Button>
                                );
                            case ButtonTypeEnum.RESET:
                                return (
                                    <Button key={type}
                                            {...resetSecondary}
                                            onClick={() => {
                                                formContext.form.resetForm();

                                                onClick && onClick();
                                            }}
                                    >
                                        {icon}{languageContext.translate(label)}
                                    </Button>
                                );
                            case ButtonTypeEnum.CANCEL:
                                return (
                                    <Button key={type}
                                            {...buttonErrorOutlined}
                                            onClick={() => onClick && onClick()}
                                    >
                                        {icon}{languageContext.translate(label)}
                                    </Button>
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
