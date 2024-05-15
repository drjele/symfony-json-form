'use strict';

import {InputLabelProps, TextField as TextFieldBase} from '@mui/material';
import {InputProps as StandardInputProps} from '@mui/material/Input/Input';
import React, {HTMLInputTypeAttribute} from 'react';
import {FieldType} from './Form';

type TextFieldProps = FieldType & {
    type: HTMLInputTypeAttribute
    error: boolean
    helperText: any
    inputProps?: StandardInputProps
    inputLabelProps?: InputLabelProps
}

export const TextField: React.FunctionComponent<TextFieldProps> = (props) => {
    const inputRef = React.useRef<any>(null);

    React.useEffect(() => {
        if (inputRef.current !== null && props.autoFocus.current === true) {
            if (props.value.length > 0 && props.selectOnFocus === true) {
                inputRef.current.select();
            } else {
                inputRef.current.focus();
            }

            props.autoFocus.current = false;
        }
    });

    return (
        <TextFieldBase type={props.type}
                       id={props.name}
                       name={props.name}
                       label={props.label}
                       value={props.value}
                       required={props.required}
                       aria-readonly={props.readonly}
                       InputProps={{
                           readOnly: props.readonly,
                           ...props.inputProps
                       }}
                       onChange={props.onChange}
                       error={props.error}
                       helperText={props.helperText}
                       InputLabelProps={props.inputLabelProps}
                       inputRef={inputRef}
        />
    );
};
