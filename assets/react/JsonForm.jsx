"use strict";

/** external libraries */
import React from "react";
import {useFormik} from "formik";
import {default as TextFieldBase} from "@material-ui/core/TextField";
import {Autocomplete as AutocompleteBase, Box, Button as ButtonBase, Checkbox, Chip, FormControl, FormControlLabel, InputLabel, ListItemText, MenuItem, OutlinedInput, Select} from "@mui/material";

/** internal components */
import BlockUi from "./BlockUi";
import Exception from "../exception/Exception";
import Translator from "./Translator";
import UrlGenerator from "./UrlGenerator";
import HttpClient from "./HttpClient";

export class Button {
    static get SUBMIT() {
        return "submit";
    }

    static get RESET() {
        return "reset";
    }
}

const AutocompleteField = ({formFieldName, formFieldLabel, formFieldValue, route, routeParameter, mode, required, formik, ...props}) => {
    const [options, setOptions] = React.useState([]);

    const httpRequest = React.useRef();

    const urlGenerator = new UrlGenerator();

    const onInputChange = (event, value) => {
        if (httpRequest.current) {
            httpRequest.current.abort();
        }

        if (value && value.length > 2) {
            httpRequest.current = HttpClient.new(
                urlGenerator.generate(route, {[routeParameter]: value}),
                (response) => {
                    let responseData = HttpClient.getDataFromResponse(response);
                    if (responseData === null) {
                        return [];
                    }

                    setOptions(responseData);
                }
            )
                .setType(HttpClient.TYPE_GET)
                .send();

            return;
        }

        setOptions([]);
    }

    return (
        <AutocompleteBase
            multiple={mode === "multiple"}
            id={formFieldName}
            name={formFieldName}
            options={options}
            onInputChange={onInputChange}
            getOptionLabel={option => option.label}
            autoHighlight={true}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(e, value) => {
                const values = [];

                if (value) {
                    if (value.id !== undefined) {
                        values.push(value.id);
                    } else if (Array.isArray(value)) {
                        value.map(v => values.push(v.id))
                    } else {
                        throw new Exception("invalid value for `" + formFieldName + "`");
                    }
                }

                formik.setFieldValue(formFieldName, values);
            }}
            renderInput={params => (
                <TextFieldBase label={formFieldLabel} required={required} {...params}/>
            )}
            {...props}
        />
    );
}

const TextField = ({type, formFieldName, formFieldLabel, formFieldValue, required, formik, ...props}) => {
    return (
        <TextFieldBase
            id={formFieldName}
            name={formFieldName}
            label={formFieldLabel}
            required={required}
            type={type}
            value={formFieldValue}
            onChange={formik.handleChange}
            error={formik.touched[formFieldName] && Boolean(formik.errors[formFieldName])}
            helperText={formik.touched[formFieldName] && formik.errors[formFieldName]}
            {...props}
        />
    );
}

const MultipleSelect = ({formFieldName, formFieldLabel, formFieldValue, options, required, formik, ...props}) => {
    const labelId = formFieldName + "Label";

    return (
        <FormControl fullWidth required={required}>
            <InputLabel id={labelId}>{formFieldLabel}</InputLabel>
            <Select
                multiple
                labelId={labelId}
                id={formFieldName}
                name={formFieldName}
                value={formFieldValue}
                onChange={formik.handleChange}
                input={<OutlinedInput label={formFieldLabel}/>}
                renderValue={(selected) => (
                    <Box sx={{"display": "flex", "flexWrap": "wrap", "gap": 0.5}}>
                        {selected.map((value) => (
                            <Chip key={value} label={options[value]}/>
                        ))}
                    </Box>
                )}
                MenuProps={{
                    "PaperProps": {
                        "style": {
                            "maxHeight": 48 * 4.5 + 8
                        },
                    },
                }}
                {...props}
            >
                {Object.entries(options).map((option) => {
                        const [id, label] = option;

                        return (
                            <MenuItem key={id} value={id}>
                                <Checkbox checked={formFieldValue.indexOf(id) > -1}/>
                                <ListItemText primary={label}/>
                            </MenuItem>
                        );
                    }
                )}
            </Select>
        </FormControl>
    );
}

const SelectField = ({formFieldName, formFieldLabel, formFieldValue, options, mode, required, formik, ...props}) => {
    switch (mode) {
        case "single":
            return (
                <AutocompleteBase
                    id={formFieldName}
                    name={formFieldName}
                    value={formFieldValue}
                    options={Object.entries(options).map((option) => {
                            const [id, label] = option;

                            return {"label": label, "id": id};
                        }
                    )}
                    getOptionLabel={(option) => (option.label !== undefined ? option.label : (options[option] !== undefined ? options[option] : ""))}
                    autoHighlight={true}
                    isOptionEqualToValue={(option, value) => option.id === value}
                    onChange={(e, value) => {
                        formik.setFieldValue(formFieldName, value ? value.id : null);
                    }}
                    renderInput={params => (
                        <TextFieldBase label={formFieldLabel} required={required} {...params}/>
                    )}
                    {...props}
                />
            );
        case "multiple":
            return (
                <MultipleSelect
                    formFieldName={formFieldName}
                    formFieldLabel={formFieldLabel}
                    formFieldValue={formFieldValue}
                    options={options}
                    required={required}
                    formik={formik}
                    {...props}
                />
            );
        default:
            throw new Exception("invalid array element mode `" + element.mode + "` for `" + formFieldName + "`");
    }
}

const JsonForm = ({formData, buttons, onSubmitSuccess, onSubmitFailure}) => {
    const [loading, setLoading] = React.useState(false);

    const translator = new Translator();

    const buildFormFieldName = (element, parents) => {
        const prefix = parents === undefined ? [] : parents;

        return [...prefix, element.name].join(".");
    }

    const getNestedValueByPath = (object, path) => {
        if (path === undefined || path.length === 0) {
            return object;
        }

        let result = object;

        for (let i = 0; i < path.length; i++) {
            if (result === undefined) {
                break;
            }

            result = result[path[i]];
        }

        return result;
    }

    const createFormFields = (elements, formik, parents) => {
        parents = parents === undefined ? [] : parents;
        const initialValues = getNestedValueByPath(formik.values, parents);

        return elements.map(element => {
                let formField, formControlClassName;

                const formFieldName = buildFormFieldName(element, parents);
                const formFieldLabel = translator.translate(element.label);
                const required = false /* element.required !== undefined ? element.required : false */;
                const formFieldValue = initialValues[element.name];

                switch (element.type) {
                    case "array":
                        formField = (
                            <SelectField
                                formFieldName={formFieldName}
                                formFieldLabel={formFieldLabel}
                                formFieldValue={formFieldValue}
                                options={element.options}
                                mode={element.mode}
                                required={required}
                                formik={formik}
                            />
                        );
                        break;
                    case "autocomplete":
                        formField = (
                            <AutocompleteField
                                formFieldName={formFieldName}
                                formFieldLabel={formFieldLabel}
                                formFieldValue={formFieldValue}
                                route={element.route}
                                routeParameter={element.parameter}
                                mode={element.mode}
                                required={required}
                                formik={formik}
                            />
                        );
                        break;
                    case "bool":
                        formField = (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        id={formFieldName}
                                        name={formFieldName}
                                        checked={formFieldValue}
                                        onChange={formik.handleChange}
                                        inputProps={{"aria-label": "controlled"}}
                                    />
                                }
                                label={formFieldLabel}
                            />
                        );
                        break;
                    case "collection":
                        formField = (
                            <div key={formFieldName + "Collection"}>{
                                createFormFields(element.elements, formik, [...parents, element.name])
                            }
                            </div>
                        );
                        break;
                    case "date":
                        formField = (
                            <TextField
                                type="date"
                                formFieldName={formFieldName}
                                formFieldLabel={formFieldLabel}
                                formFieldValue={formFieldValue}
                                required={required}
                                formik={formik}
                                format={element.format}
                                InputProps={{"inputProps": {"min": element.min, "max": element.max}}}
                                InputLabelProps={{"shrink": true}}
                            />
                        );
                        break;
                    case "file":
                        formField = (
                            <TextField
                                type="file"
                                formFieldName={formFieldName}
                                formFieldLabel={formFieldLabel}
                                formFieldValue={formFieldValue}
                                required={required}
                                formik={formik}
                                InputLabelProps={{"shrink": true}}
                            />
                        );
                        break;
                    case "hidden":
                        formControlClassName = "hidden";

                        formField = (
                            <TextField
                                type="hidden"
                                formFieldName={formFieldName}
                                formFieldLabel={formFieldLabel}
                                formFieldValue={formFieldValue}
                                required={required}
                                formik={formik}
                            />
                        );
                        break;
                    case "label":
                        formField = formFieldLabel;
                        break;
                    case "number":
                        formField = (
                            <TextField
                                type="number"
                                formFieldName={formFieldName}
                                formFieldLabel={formFieldLabel}
                                formFieldValue={formFieldValue}
                                required={required}
                                formik={formik}
                                InputProps={{"inputProps": {"min": element.min, "max": element.max, "step": element.step}}}
                            />
                        );
                        break;
                    case "password":
                        formField = (
                            <TextField
                                type="password"
                                formFieldName={formFieldName}
                                formFieldLabel={formFieldLabel}
                                formFieldValue={formFieldValue}
                                required={required}
                                formik={formik}
                            />
                        );
                        break;
                    case "prototypeCollection":
                        formField = (
                            <div key={formFieldName + "PrototypeCollection"}>{
                                element.elements.map((elementsCollection, index) =>
                                    createFormFields(elementsCollection, formik, [...parents, element.name, index])
                                )
                            }
                            </div>
                        );
                        break;
                    case "string":
                        formField = (
                            <TextField
                                type="text"
                                formFieldName={formFieldName}
                                formFieldLabel={formFieldLabel}
                                formFieldValue={formFieldValue}
                                required={required}
                                formik={formik}
                            />
                        );
                        break;
                    default:
                        throw new Exception("invalid form element type `" + element.type + "` for `" + formFieldName + "`");
                }

                return (
                    <FormControl
                        fullWidth
                        key={formFieldName}
                        required={required}
                        className={formControlClassName}
                        style={{"paddingBlock": "5px"}}
                    >
                        {formField}
                    </FormControl>
                );
            }
        );
    }

    const computeInitialValues = (elements) => {
        const initialValues = {};

        elements.map(element => {
                const formFieldName = element.name;

                switch (element.type) {
                    case "array":
                        switch (element.mode) {
                            case "single":
                                initialValues[formFieldName] = element.value && element.value.length > 0 ? element.value[0] : null;
                                break;
                            default:
                                initialValues[formFieldName] = element.value ? element.value : [];
                        }
                        break;
                    case "bool":
                        initialValues[formFieldName] = element.value ? element.value : false;
                        break;
                    case "collection":
                        initialValues[formFieldName] = computeInitialValues(element.elements);
                        break;
                    case "prototypeCollection":
                        initialValues[formFieldName] = {}

                        element.elements.map((elementsCollection, index) =>
                            initialValues[formFieldName][index] = computeInitialValues(elementsCollection)
                        )
                        break;
                    default:
                        initialValues[formFieldName] = element.value ? element.value : "";
                }
            }
        );

        return initialValues;
    }

    const createButtons = (buttons, formik) => {
        buttons = buttons === undefined ? {[Button.SUBMIT]: "wms.button.ok"} : buttons;
        if (buttons[Button.SUBMIT] === undefined) {
            buttons [Button.SUBMIT] = "wms.button.ok";
        }

        return (
            <Box textAlign="center">{
                Object.entries(buttons).map(button => {
                        const [type, label] = button;

                        switch (type) {
                            case Button.SUBMIT:
                                return (<ButtonBase key={type} type="submit" color="primary" variant="contained" fullWidth={buttons.length === 1}>{translator.translate(label)}</ButtonBase>);
                            case Button.RESET:
                                return (<ButtonBase key={type} type="reset" color="secondary" onClick={formik.resetForm}>{translator.translate(label)}</ButtonBase>);
                        }
                    }
                )
            }
            </Box>
        );
    }

    const urlGenerator = new UrlGenerator();

    const formik = useFormik({
        "initialValues": computeInitialValues(formData.elements),
        "onSubmit": (values) => {
            HttpClient.new(
                urlGenerator.generate(formData.action.route, formData.action.parameters),
                (response) => {
                    if (response.success === false) {
                        onSubmitFailure !== undefined && onSubmitFailure(response.errors);

                        return;
                    }

                    onSubmitSuccess !== undefined && onSubmitSuccess(response.data);
                }
            )
                .setData(JSON.stringify({[formData.name]: values}))
                .setType(formData.method)
                .setBeforeSend(() => setLoading(true))
                .setOnError(() => onSubmitFailure !== undefined && onSubmitFailure())
                .setOnComplete(() => setLoading(false))
                .send();
        }
    });

    return (
        <form name={formData.name} onSubmit={formik.handleSubmit} autoComplete="off">
            <BlockUi open={loading}>
                {createFormFields(formData.elements, formik)}
                {createButtons(buttons, formik)}
            </BlockUi>
        </form>
    );
}

export default JsonForm;

