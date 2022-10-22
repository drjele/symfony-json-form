"use strict";

/** external libraries */
import React from "react";
import {useFormik} from "formik";
import {default as TextFieldBase} from "@material-ui/core/TextField";
import {Autocomplete as AutocompleteBase, Box, Button as ButtonBase, Checkbox, Chip, FormControl as FormControlBase, FormControlLabel, InputLabel, ListItemText, ListSubheader, MenuItem, OutlinedInput, Select} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import UndoIcon from "@mui/icons-material/Replay";

/** internal components */
import BlockUi from "./BlockUi";
import Exception from "../exception/Exception";
import Translator from "./Translator";
import UrlGenerator from "./UrlGenerator";
import HttpClient, {HttpRequest} from "./HttpClient";

export class Button {
    static get SUBMIT() {
        return "submit";
    }

    static get RESET() {
        return "reset";
    }
}

class Form {
    static computeInitialValues = (elements) => {
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
                        initialValues[formFieldName] = Form.computeInitialValues(element.elements);
                        break;
                    case "prototypeCollection":
                        initialValues[formFieldName] = {}

                        element.elements.map((elementsCollection, index) =>
                            initialValues[formFieldName][index] = Form.computeInitialValues(elementsCollection)
                        )
                        break;
                    default:
                        initialValues[formFieldName] = element.value ? element.value : "";
                }
            }
        );

        return initialValues;
    }

    static createForm = (formData, onSubmitSuccess, onSubmitFailure, beforeSend, onComplete, setLoading, staticData) => {
        const urlGenerator = new UrlGenerator();
        const httpClient = new HttpClient();

        return useFormik({
            "initialValues": Form.computeInitialValues(formData.elements),
            "onSubmit": (values) => {
                const httpRequest = (new HttpRequest(
                    urlGenerator.generate(formData.action.route, formData.action.parameters),
                    (response) => {
                        if (response.success === false) {
                            onSubmitFailure !== undefined && onSubmitFailure(response.errors);

                            return;
                        }

                        onSubmitSuccess !== undefined && onSubmitSuccess(values, response.data);
                    },
                    formData.method
                ))
                    .setData(
                        {
                            [formData.name]: values,
                            ...staticData
                        }
                    )
                    .setBeforeSend(() => {
                        setLoading !== undefined && setLoading(true);

                        beforeSend !== undefined && beforeSend();
                    })
                    .setOnError(() => onSubmitFailure !== undefined && onSubmitFailure())
                    .setOnComplete(() => {
                        onComplete !== undefined && onComplete();

                        setLoading !== undefined && setLoading(false);
                    });

                httpClient.send(httpRequest);
            }
        });
    }
}

export const FormControl = ({children, ...props}) => {
    return (
        <FormControlBase
            fullWidth
            {...props}
        >
            {children}
        </FormControlBase>
    );
}

const AutocompleteField = ({formFieldName, formFieldLabel, formFieldValue, route, routeParameter, mode, required, formik, ...props}) => {
    const isMounted = React.useRef(false);
    React.useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    const [options, setOptionsState] = React.useState([]);
    const setOptions = (options) => isMounted.current === true && setOptionsState(options);

    const httpRequest = React.useRef();

    const urlGenerator = new UrlGenerator();
    const httpClient = new HttpClient();

    const onInputChange = (event, value) => {
        httpRequest.current?.abort();

        if (value && value.length > 2) {
            httpRequest.current = new HttpRequest(
                urlGenerator.generate(route, {[routeParameter]: value}),
                (response) => {
                    let responseData = HttpClient.getDataFromResponse(response);
                    if (responseData === null) {
                        return [];
                    }

                    setOptions(responseData);
                },
                HttpRequest.TYPE_GET
            );

            httpClient.send(httpRequest.current);

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
            defaultValue={null}
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

const MultipleSelectField = ({formFieldName, formFieldLabel, formFieldValue, options, required, formik, ...props}) => {
    const labelId = formFieldName + "Label";
    let lastRenderedGroup = null;
    const optionsComponents = [];

    options.grouped.map((option) => {
            if (options.groupBy === true && option.key !== lastRenderedGroup) {
                lastRenderedGroup = option.key;

                optionsComponents.push((<ListSubheader key={option.key}>{option.key}</ListSubheader>));
            }

            optionsComponents.push((
                <MenuItem key={option.id} value={option.id}>
                    <Checkbox checked={formFieldValue.indexOf(option.id) > -1}/>
                    <ListItemText primary={option.label}/>
                </MenuItem>
            ));
        }
    )

    return (
        <FormControlBase fullWidth required={required}>
            <InputLabel id={labelId}>{formFieldLabel}</InputLabel>
            <Select
                multiple
                labelId={labelId}
                id={formFieldName}
                name={formFieldName}
                value={formFieldValue}
                onChange={formik.handleChange}
                input={<OutlinedInput label={formFieldLabel}/>}
                renderValue={selected => (
                    <Box sx={{"display": "flex", "flexWrap": "wrap", "gap": 0.5}}>
                        {selected.map(value => (
                            <Chip key={value} label={options.indexed[value]}/>
                        ))}
                    </Box>
                )}
                MenuProps={{
                    "PaperProps": {
                        "style": {
                            "maxHeight": 225
                        },
                    },
                }}
                defaultValue={null}
                {...props}
            >
                {optionsComponents}
            </Select>
        </FormControlBase>
    );
}

const SelectField = ({formFieldName, formFieldLabel, formFieldValue, options, mode, required, formik, ...props}) => {
    const processOptions = (options) => {
        let groupBy = false;
        const groupedOptions = [];
        const indexedOptions = {};
        Object.entries(options).map(([id, optionData]) => {
            if (typeof optionData === "string") {
                groupedOptions.push({"id": id, "label": optionData, "key": null});

                indexedOptions[id] = optionData;
            } else {
                groupBy = true;

                Object.entries(optionData).map(([childId, label]) => {
                    groupedOptions.push({"id": childId, "label": label, "key": id});

                    indexedOptions[childId] = label;
                })
            }
        });

        return {
            "groupBy": groupBy,
            "grouped": groupedOptions,
            "indexed": indexedOptions
        };
    };

    const processedOptions = processOptions(options);

    switch (mode) {
        case "single":
            return (
                <AutocompleteBase
                    id={formFieldName}
                    name={formFieldName}
                    value={formFieldValue}
                    options={processedOptions.grouped}
                    groupBy={option => processedOptions.groupBy === true ? option.key : null}
                    getOptionLabel={option => (option.label !== undefined ? option.label : (processedOptions.indexed[option] !== undefined ? processedOptions.indexed[option] : ""))}
                    autoHighlight={true}
                    isOptionEqualToValue={(option, value) => option.id === value}
                    onChange={(e, value) => {
                        formik.setFieldValue(formFieldName, value ? value.id : null);
                    }}
                    renderInput={params => (
                        <TextFieldBase label={formFieldLabel} required={required} {...params}/>
                    )}
                    defaultValue={null}
                    {...props}
                />
            );
        case "multiple":
            return (
                <MultipleSelectField
                    formFieldName={formFieldName}
                    formFieldLabel={formFieldLabel}
                    formFieldValue={formFieldValue}
                    options={processedOptions}
                    required={required}
                    formik={formik}
                    {...props}
                />
            );
        default:
            throw new Exception("invalid array element mode `" + element.mode + "` for `" + formFieldName + "`");
    }
}

const FormFields = ({elements, formik, baseFormControlClassNames}) => {
    baseFormControlClassNames = baseFormControlClassNames === undefined ? [] : baseFormControlClassNames;

    const translator = new Translator();

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

    const buildFormFieldName = (element, parents) => {
        const prefix = parents === undefined ? [] : parents;

        return [...prefix, element.name].join(".");
    }

    const createFormFields = (elements, parents) => {
        parents = parents === undefined ? [] : parents;
        const initialValues = getNestedValueByPath(formik.values, parents);

        return elements.map(element => {
                let formField;
                const formControlClassNames = [...baseFormControlClassNames];

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
                            <Box key={formFieldName + "Collection"}>{
                                createFormFields(element.elements, formik, [...parents, element.name])
                            }
                            </Box>
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
                        formControlClassNames.push("hidden");

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
                            <Box key={formFieldName + "PrototypeCollection"}>{
                                element.elements.map((elementsCollection, index) =>
                                    createFormFields(elementsCollection, formik, [...parents, element.name, index])
                                )
                            }
                            </Box>
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
                        key={formFieldName}
                        required={required}
                        className={formControlClassNames.join(" ")}
                    >
                        {formField}
                    </FormControl>
                );
            }
        );
    }

    return createFormFields(elements);
}

const FormButtons = ({buttons, formik}) => {
    const translator = new Translator();

    buttons = buttons === undefined ? {[Button.SUBMIT]: "wms.button.ok"} : buttons;
    if (buttons[Button.SUBMIT] === undefined) {
        buttons [Button.SUBMIT] = "wms.button.ok";
    }

    return (
        <FormControl>
            <Box textAlign="center">{
                Object.entries(buttons).map(button => {
                        let [type, label] = button;
                        let icon = null;
                        let onClick = null;

                        if (Array.isArray(label)) {
                            [icon, label, onClick] = label;
                        }

                        switch (type) {
                            case Button.SUBMIT:
                                return (
                                    <ButtonBase
                                        key={type}
                                        type="submit"
                                        color="primary"
                                        variant="contained"
                                        fullWidth={buttons.length === 1}
                                        onClick={() => onClick && onClick()}
                                    >
                                        {icon}{icon === null ? "" : " "}{translator.translate(label)}
                                    </ButtonBase>
                                );
                            case Button.RESET:
                                return (
                                    <ButtonBase
                                        key={type}
                                        type="reset"
                                        color="secondary"
                                        onClick={() => {
                                            formik.resetForm();

                                            onClick && onClick()
                                        }}
                                    >
                                        {icon}{icon === null ? "" : " "}{translator.translate(label)}
                                    </ButtonBase>
                                );
                        }
                    }
                )
            }
            </Box>
        </FormControl>
    );
}

const FormContainer = ({children, loading, name, onSubmit, className, ...props}) => {
    const classNames = ["form-container"];
    if (className !== undefined) {
        classNames.push(className);
    }

    return (
        <Box className={classNames.join(" ")} {...props}>
            <BlockUi open={loading}>
                <form name={name} onSubmit={onSubmit} autoComplete="off" className="d-flex flex-column gap-1 p-block-1">
                    {children}
                </form>
            </BlockUi>
        </Box>
    );
}

const FormFieldsContainer = ({children, className, ...props}) => {
    const classNames = ["form-fields-container", "d-flex flex-wrap gap-1 align-items-center"];
    if (className !== undefined) {
        classNames.push(className);
    }

    return (
        <Box className={classNames.join(" ")} {...props}>
            {children}
        </Box>
    );
}

const JsonForm = ({formData, fixedElements, buttons, onSubmitSuccess, onSubmitFailure, beforeSend, onComplete}) => {
    const isMounted = React.useRef(false);
    React.useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    const [loading, setLoadingState] = React.useState(false);
    const setLoading = (loading) => isMounted.current !== true && setLoadingState(loading);

    const formik = Form.createForm(
        formData,
        onSubmitSuccess,
        onSubmitFailure,
        beforeSend,
        onComplete,
        setLoading
    );

    return (
        <FormContainer loading={loading} name={formData.name} onSubmit={formik.handleSubmit}>
            <FormFieldsContainer className="flex-column">
                <FormFields elements={formData.elements} formik={formik}/>
            </FormFieldsContainer>
            {fixedElements && (<Box>{fixedElements}</Box>)}
            <FormButtons buttons={buttons} formik={formik}/>
        </FormContainer>
    );
}

export const SearchForm = ({triggerSubmit, formData, onSubmitSuccess, onSubmitFailure, beforeSend, onComplete, onReset, staticData}) => {
    const isMounted = React.useRef(false);
    React.useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    const [loading, setLoadingState] = React.useState(false);
    const setLoading = (loading) => isMounted.current === true && setLoadingState(loading);

    const formik = Form.createForm(
        formData,
        onSubmitSuccess,
        onSubmitFailure,
        beforeSend,
        onComplete,
        setLoading,
        staticData
    );

    React.useEffect(() => {
        if (triggerSubmit.current === true) {
            triggerSubmit.current = false;

            formik.submitForm();
        }
    });

    return (
        <FormContainer loading={loading} name={formData.name} onSubmit={formik.handleSubmit} className="search-form-container">
            <Box className="card">
                <FormFieldsContainer className="card-body pt-1 pb-1 flex-wrap">
                    <FormFields
                        elements={formData.elements}
                        formik={formik}
                        baseFormControlClassNames={["form-control"]}
                    />
                </FormFieldsContainer>

                <Box className="card-footer pt-1 pb-1">
                    <FormButtons
                        buttons={
                            {
                                [Button.SUBMIT]: [<SearchIcon/>, "wms.button.search"],
                                [Button.RESET]: [<UndoIcon/>, "wms.button.reset", onReset]
                            }
                        }
                        formik={formik}
                    />
                </Box>
            </Box>
        </FormContainer>
    );
}

export default JsonForm;
