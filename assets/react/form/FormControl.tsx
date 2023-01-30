"use strict";

/** external libraries */
import React from "react";
import {FormControl as FormControlBase} from "@mui/material";

type FormControlProps = React.PropsWithChildren & {
    className?: string
    required?: boolean
}

export const FormControl: React.FunctionComponent<FormControlProps> = (props) => {
    return (
        <FormControlBase fullWidth className={props.className} required={props.required}>
            {props.children}
        </FormControlBase>
    );
}
