'use strict';

import {TextField as TextFieldBase} from '@mui/material';
import {DesktopDatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
/** external libraries */
import React from 'react';
import {FormBuilder} from './FormBuilder';

/** internal components */
import {FieldType} from './Types';

type DateFieldProps = FieldType & {
    format: string
    min: any
    max: any
}

export const DateField: React.FunctionComponent<DateFieldProps> = (props) => {
    const inputRef = React.useRef<any>(null);

    React.useEffect(() => {
        if (inputRef.current !== null && props.autoFocus.current === true) {
            inputRef.current.focus();

            props.autoFocus.current = false;
        }
    });

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DesktopDatePicker label={props.label}
                               inputFormat={FormBuilder.computeDateFormat(props.format)}
                               value={props.value ? props.value : null}
                               onChange={props.onChange}
                               minDate={props.min}
                               maxDate={props.max}
                               readOnly={props.readonly}
                               autoFocus={props.autoFocus.current}
                               renderInput={(params) => (
                                   <TextFieldBase name={props.name} {...params}/>
                               )}
                               inputRef={inputRef}
            />
        </LocalizationProvider>
    );
};
