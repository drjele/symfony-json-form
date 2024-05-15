"use strict";

/** external libraries */
import React from "react";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {TextField as TextFieldBase} from "@mui/material";

/** internal components */
import {FieldType} from "./Types";
import {FormBuilder} from "./FormBuilder";

type DateTimeFieldProps = FieldType & {
    format: string
    min: any
    max: any
}

export const DateTimeField: React.FunctionComponent<DateTimeFieldProps> = (props) => {
    const inputRef = React.useRef<any>(null);

    React.useEffect(() => {
        if (inputRef.current !== null && props.autoFocus.current === true) {
            inputRef.current.focus();

            props.autoFocus.current = false;
        }
    });

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker label={props.label}
                            inputFormat={FormBuilder.computeDateTimeFormat(props.format)}
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
}