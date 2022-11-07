"use strict";

import "./css/form.scss";

/** external libraries */
import React from "react";
import {useFormik} from "formik";
import {default as TextFieldBase} from "@material-ui/core/TextField";
import {Autocomplete as AutocompleteBase, Box, Button as ButtonBase, Checkbox, Chip, FormControl as FormControlBase, FormControlLabel, InputLabel, ListItemText, ListSubheader, MenuItem, OutlinedInput, Select} from "@mui/material";
import {DateTimePicker, DesktopDatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

/** internal components */
import BlockUi from "./BlockUi";
import Exception from "../exception/Exception";
import Translator from "./Translator";
import UrlGenerator from "./UrlGenerator";
import {HttpClient, HttpRequest} from "../service/HttpClient";

const AutocompleteField = ({form, name, label, route, routeParameter, mode, required, ...props}) => {
    const isMounted = React.useRef(false);
    React.useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        }
    }, []);

    const [options, setOptionsState] = React.useState([]);
    const setOptions = (options) => isMounted.current === true && setOptionsState(options);

    let httpRequest = null;

    const urlGenerator = new UrlGenerator();
    const httpClient = new HttpClient();

    const onInputChange = (event, value) => {
        httpRequest?.abort();

        if (value && value.length > 2) {
            httpRequest = new HttpRequest(
                urlGenerator.generate(route, {[routeParameter]: value}),
                (response) => {
                    const data = HttpClient.getDataFromResponse(response);
                    if (data === null) {
                        return [];
                    }

                    setOptions(data);
                },
                HttpRequest.TYPE_GET
            );

            httpClient.send(httpRequest);

            return;
        }

        setOptions([]);
    }

    return (
        <AutocompleteBase multiple={mode === Element.ARRAY_MULTIPLE}
                          id={name}
                          name={name}
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
                                      throw new Exception("invalid value for `" + name + "`");
                                  }
                              }

                              form.setFieldValue(name, values);
                          }}
                          renderInput={params => (
                              <TextFieldBase label={label} required={required} {...params}/>
                          )}
                          defaultValue={null}
                          {...props}
        />
    );
}

const TextField = ({form, type, name, label, value, required, ...props}) => {
    return (
        <TextFieldBase id={name}
                       name={name}
                       label={label}
                       required={required}
                       type={type}
                       value={value}
                       onChange={form.handleChange}
                       error={form.touched[name] && Boolean(form.errors[name])}
                       helperText={form.touched[name] && form.errors[name]}
                       {...props}
        />
    );
}

const MultipleSelectField = ({form, name, label, options, value, required, ...props}) => {
    const labelId = name + "Label";
    let lastRenderedGroup = null;
    const optionsComponents = [];

    options.grouped.map((option) => {
            if (options.groupBy === true && option.key !== lastRenderedGroup) {
                lastRenderedGroup = option.key;

                optionsComponents.push((<ListSubheader key={option.key}>{option.key}</ListSubheader>));
            }

            optionsComponents.push((
                <MenuItem key={option.id} value={option.id}>
                    <Checkbox checked={value.indexOf(option.id) > -1}/>
                    <ListItemText primary={option.label}/>
                </MenuItem>
            ));
        }
    )

    return (
        <FormControl required={required}>
            <InputLabel id={labelId}>{label}</InputLabel>
            <Select multiple
                    labelId={labelId}
                    id={name}
                    name={name}
                    value={value}
                    onChange={form.handleChange}
                    input={<OutlinedInput label={label}/>}
                    renderValue={selected => (
                        <Box className="d-flex flex-wrap gap-2">
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
        </FormControl>
    );
}

const SelectField = ({form, name, label, options, value, mode, required, ...props}) => {
    const translator = new Translator();

    const processOptions = (options) => {
        let groupBy = false;
        const groupedOptions = [];
        const indexedOptions = {};
        Object.entries(options).map(([id, optionData]) => {
            if (typeof optionData === "string") {
                const translatedLabel = translator.translate(optionData);

                groupedOptions.push({"id": id, "label": translatedLabel, "key": null});

                indexedOptions[id] = translatedLabel;
            } else {
                groupBy = true;

                Object.entries(optionData).map(([childId, label]) => {
                    const translatedLabel = translator.translate(label);

                    groupedOptions.push({"id": childId, "label": translatedLabel, "key": id});

                    indexedOptions[childId] = translatedLabel;
                })
            }
        });

        return {
            "groupBy": groupBy,
            "grouped": groupedOptions,
            "indexed": indexedOptions
        };
    }

    const processedOptions = processOptions(options);

    switch (mode) {
        case Element.ARRAY_SINGLE:
            return (
                <AutocompleteBase id={name}
                                  name={name}
                                  value={value}
                                  options={processedOptions.grouped}
                                  groupBy={option => processedOptions.groupBy === true ? option.key : null}
                                  getOptionLabel={option => (option.label !== undefined ? option.label : (processedOptions.indexed[option] !== undefined ? processedOptions.indexed[option] : ""))}
                                  autoHighlight={true}
                                  isOptionEqualToValue={(option, value) => option.id?.toString() === value?.toString()}
                                  onChange={(e, value) => {
                                      form.setFieldValue(name, value ? value.id : null);
                                  }}
                                  renderInput={params => (
                                      <TextFieldBase label={label} required={required} {...params}/>
                                  )}
                                  defaultValue={null}
                                  {...props}
                />
            );
        case Element.ARRAY_MULTIPLE:
            return (
                <MultipleSelectField form={form}
                                     name={name}
                                     label={label}
                                     options={processedOptions}
                                     value={value}
                                     required={required}
                                     {...props}
                />
            );
        default:
            throw new Exception("invalid array element mode `" + element.mode + "` for `" + name + "`");
    }
}

export class Button {
    static get SUBMIT() {
        return "submit";
    }

    static get RESET() {
        return "reset";
    }
}

export class Element {
    static get ARRAY() {
        return "array";
    }

    static get AUTOCOMPLETE() {
        return "autocomplete";
    }

    static get ARRAY_SINGLE() {
        return "single";
    }

    static get ARRAY_MULTIPLE() {
        return "multiple";
    }

    static get BOOL() {
        return "bool";
    }

    static get COLLECTION() {
        return "collection";
    }

    static get DATE() {
        return "date";
    }

    static get DATE_TIME() {
        return "dateTime";
    }

    static get FILE() {
        return "file";
    }

    static get HIDDEN() {
        return "hidden";
    }

    static get LABEL() {
        return "label";
    }

    static get NUMBER() {
        return "number";
    }

    static get PASSWORD() {
        return "password";
    }

    static get PROTOTYPE_COLLECTION() {
        return "prototypeCollection";
    }

    static get STRING() {
        return "string";
    }

    static computeDateFormat = (elementFormat) => {
        let format = "YYYY-MM-DD";

        switch (elementFormat) {
            case "d-m-Y":
                format = "DD-MM-YYYY";
                break;
        }

        return format;
    }

    static computeDateTimeFormat = (elementFormat) => {
        let format = "YYYY-MM-DD HH:mm";

        switch (elementFormat) {
            case "d-m-Y H:i":
                format = "DD-MM-YYYY HH:mm";
                break;
        }

        return format;
    }
}

export class FormBuilder {
    static computeInitialValues = (elements) => {
        const initialValues = {};

        Object.entries(elements).map(([name, element]) => {
                switch (element.type) {
                    case Element.ARRAY:
                        switch (element.mode) {
                            case Element.ARRAY_SINGLE:
                                initialValues[name] = element.value && element.value.length > 0 ? element.value[0] : null;
                                break;
                            default:
                                initialValues[name] = element.value ? element.value : [];
                        }
                        break;
                    case Element.BOOL:
                        initialValues[name] = element.value ? element.value : false;
                        break;
                    case Element.COLLECTION:
                        initialValues[name] = FormBuilder.computeInitialValues(element.elements);
                        break;
                    case Element.PROTOTYPE_COLLECTION:
                        initialValues[name] = {}

                        element.elements.map((elementsCollection, index) =>
                            initialValues[name][index] = FormBuilder.computeInitialValues(elementsCollection)
                        )
                        break;
                    default:
                        initialValues[name] = element.value ? element.value : "";
                }
            }
        );

        return initialValues;
    }

    static createForm = (form, onSubmitSuccess, onSubmitFailure, beforeSend, onComplete, staticData) => {
        const urlGenerator = new UrlGenerator();
        const httpClient = new HttpClient();

        return useFormik({
            "initialValues": FormBuilder.computeInitialValues(form.elements),
            "onSubmit": (values) => {
                const httpRequest = (new HttpRequest(
                    urlGenerator.generate(form.action.route, form.action.parameters),
                    (response) => {
                        if (response.success === false) {
                            onSubmitFailure !== undefined && onSubmitFailure(response.errors);

                            return;
                        }

                        onSubmitSuccess !== undefined && onSubmitSuccess(values, response.data);
                    },
                    form.method
                ))
                    .setData(
                        {
                            [form.name]: values,
                            ...staticData
                        }
                    )
                    .setBeforeSend(beforeSend)
                    .setOnError(() => onSubmitFailure !== undefined && onSubmitFailure())
                    .setOnComplete(onComplete);

                httpClient.send(httpRequest);
            }
        });
    }
}

export const FormContainer = ({children, loading, name, onSubmit, className, loadingClassName, ...props}) => {
    const classNames = ["form-container"];
    if (className !== undefined) {
        classNames.push(className);
    }

    return (
        <Box className={classNames.join(" ")} {...props}>
            <BlockUi open={loading} className={"h-100 w-100" + (loadingClassName ? " " + loadingClassName : "")}>
                <form name={name}
                      onSubmit={onSubmit}
                      autoComplete="off"
                      className="d-flex flex-column gap-1 p-0 m-0 h-100 w-100"
                >
                    {children}
                </form>
            </BlockUi>
        </Box>
    );
}

export const FormFieldsContainer = ({children, className, ...props}) => {
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

export const FormControl = ({children, ...props}) => {
    return (
        <FormControlBase fullWidth {...props}>
            {children}
        </FormControlBase>
    );
}

export const FormFields = ({form, elements, parents}) => {
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

    parents = parents === undefined ? [] : parents;
    const initialValues = getNestedValueByPath(form.values, parents);

    return Object.entries(elements).map(([, element]) => (
            <FormField key={element.name}
                       form={form}
                       element={element}
                       value={initialValues[element.name]}
                       parents={parents}
            />
        )
    );
}

export const FormField = ({form, element, value, parents}) => {
    const translator = new Translator();

    const buildName = (element, parents) => {
        const prefix = parents === undefined ? [] : parents;

        return [...prefix, element.name].join(".");
    }

    const formControlClassNames = ["form-control"];

    const name = buildName(element, parents);
    const label = translator.translate(element.label);
    const required = false /* element.required !== undefined ? element.required : false */;

    let formField;
    switch (element.type) {
        case Element.ARRAY:
            formField = (
                <SelectField form={form}
                             name={name}
                             label={label}
                             value={value}
                             options={element.options}
                             mode={element.mode}
                             required={required}
                />
            );
            break;
        case Element.AUTOCOMPLETE:
            formField = (
                <AutocompleteField form={form}
                                   name={name}
                                   label={label}
                                   route={element.route}
                                   routeParameter={element.parameter}
                                   mode={element.mode}
                                   required={required}
                />
            );
            break;
        case Element.BOOL:
            formField = (
                <FormControlLabel control={
                    <Checkbox id={name}
                              name={name}
                              checked={value}
                              onChange={(event, value) => {
                                  element.onChange && element.onChange(value);

                                  form.handleChange(event, value);
                              }}
                              inputProps={{"aria-label": "controlled"}}
                    />
                }
                                  label={label}
                />
            );
            break;
        case Element.COLLECTION:
            formField = (
                <Box key={name + "Collection"}>
                    <FormFields form={form}
                                elements={element.elements}
                                parents={[...parents, element.name]}
                    />
                </Box>
            );
            break;
        case Element.DATE:
            const dateFormat = Element.computeDateFormat(element.format);

            formField = (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker label={label}
                                       inputFormat={dateFormat}
                                       value={value ? value : null}
                                       onChange={(value) => {
                                           form.setFieldValue(name, value?.format(dateFormat), true);
                                       }}
                                       minDate={element.min}
                                       maxDate={element.max}
                                       renderInput={(params) =>
                                           (
                                               <TextFieldBase id={name}
                                                              name={name}
                                                              required={required}
                                                              {...params}
                                               />
                                           )}
                    />
                </LocalizationProvider>
            );
            break;
        case Element.DATE_TIME:
            const dateTimeFormat = Element.computeDateTimeFormat(element.format);

            formField = (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker label={label}
                                    inputFormat={dateTimeFormat}
                                    value={value ? value : null}
                                    onChange={(value) => {
                                        form.setFieldValue(name, value?.format(dateTimeFormat), true);
                                    }}
                                    minDate={element.min}
                                    maxDate={element.max}
                                    renderInput={(params) =>
                                        (
                                            <TextFieldBase id={name}
                                                           name={name}
                                                           required={required}
                                                           {...params}
                                            />
                                        )}
                    />
                </LocalizationProvider>
            );
            break;
        case Element.FILE:
            formField = (
                <TextField form={form}
                           type="file"
                           name={name}
                           label={label}
                           value={value}
                           required={required}
                           InputLabelProps={{"shrink": true}}
                />
            );
            break;
        case Element.HIDDEN:
            formControlClassNames.push("hidden");

            formField = (
                <TextField form={form}
                           type="hidden"
                           name={name}
                           label={label}
                           value={value}
                           required={required}
                />
            );
            break;
        case Element.LABEL:
            formField = label + (value ? ": " + value : "");
            break;
        case Element.NUMBER:
            formField = (
                <TextField form={form}
                           type="number"
                           name={name}
                           label={label}
                           value={value}
                           required={required}
                           InputProps={{"inputProps": {"min": element.min, "max": element.max, "step": element.step}}}
                />
            );
            break;
        case Element.PASSWORD:
            formField = (
                <TextField form={form}
                           type="password"
                           name={name}
                           label={label}
                           value={value}
                           required={required}
                />
            );
            break;
        case Element.PROTOTYPE_COLLECTION:
            formField = (
                <Box key={name + "PrototypeCollection"}>{
                    element.elements.map((elementsCollection, index) =>
                        <Box key={index}>
                            <FormFields form={form}
                                        elements={elementsCollection}
                                        parents={[...parents, element.name, index]}
                            />
                        </Box>
                    )
                }
                </Box>
            );
            break;
        case Element.STRING:
            formField = (
                <TextField form={form}
                           type="text"
                           name={name}
                           label={label}
                           value={value}
                           required={required}
                />
            );
            break;
        default:
            throw new Exception("invalid form element type `" + element.type + "` for `" + name + "`");
    }

    return (
        <FormControl key={name}
                     required={required}
                     className={formControlClassNames.join(" ")}
        >
            {formField}
        </FormControl>
    );
}

export const FormButtons = ({form, buttons}) => {
    const translator = new Translator();

    buttons = buttons === undefined ? {[Button.SUBMIT]: "wms.button.ok"} : buttons;

    return (
        <FormControl>
            <Box textAlign="center">{
                Object.entries(buttons).map(([type, label]) => {
                        let icon = null;
                        let onClick = null;

                        if (Array.isArray(label)) {
                            [icon, label, onClick] = label;
                        }

                        switch (type) {
                            case Button.SUBMIT:
                                return (
                                    <ButtonBase key={type}
                                                type="submit"
                                                color="primary"
                                                variant="contained"
                                                fullWidth={buttons.length === 1}
                                                onClick={() => onClick && onClick()}
                                    >
                                        {icon}{translator.translate(label)}
                                    </ButtonBase>
                                );
                            case Button.RESET:
                                return (
                                    <ButtonBase key={type}
                                                type="reset"
                                                color="secondary"
                                                onClick={() => {
                                                    form.resetForm();

                                                    onClick && onClick()
                                                }}
                                    >
                                        {icon}{translator.translate(label)}
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

export const Form = (
    {
        data,
        buttons,
        onSubmitSuccess,
        onSubmitFailure,
        beforeSend,
        onComplete,
        blockOnSubmit,
        triggerSubmit,
        staticData
    }
) => {
    const isMounted = React.useRef(false);
    React.useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        }
    }, []);

    if (blockOnSubmit === undefined) {
        blockOnSubmit = true;
    }

    const [loading, setLoadingState] = React.useState(false);
    const setLoading = (loading) => isMounted.current === true && blockOnSubmit === true && setLoadingState(loading);

    const form = FormBuilder.createForm(
        data,
        onSubmitSuccess,
        onSubmitFailure,
        () => {
            setLoading(true);

            beforeSend !== undefined && beforeSend();
        },
        () => {
            onComplete !== undefined && onComplete();

            setLoading(false);
        },
        staticData
    );

    React.useEffect(() => {
        if (triggerSubmit?.current === true) {
            triggerSubmit.current = false;

            form.submitForm();
        }
    });

    return (
        <FormContainer loading={loading}
                       name={data.name}
                       onSubmit={form.handleSubmit}
        >
            <FormFieldsContainer className="flex-column">
                <FormFields form={form}
                            elements={data.elements}
                />
            </FormFieldsContainer>

            <FormButtons form={form}
                         buttons={buttons}
            />
        </FormContainer>
    );
}

export const FormCard = (
    {
        data,
        buttons,
        onSubmitSuccess,
        onSubmitFailure,
        beforeSend,
        onComplete,
        blockOnSubmit,
        triggerSubmit,
        staticData
    }
) => {
    const isMounted = React.useRef(false);
    React.useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        }
    }, []);

    if (blockOnSubmit === undefined) {
        blockOnSubmit = true;
    }

    const [loading, setLoadingState] = React.useState(false);
    const setLoading = (loading) => isMounted.current === true && blockOnSubmit === true && setLoadingState(loading);

    const form = FormBuilder.createForm(
        data,
        onSubmitSuccess,
        onSubmitFailure,
        () => {
            setLoading(true);

            beforeSend !== undefined && beforeSend();
        },
        () => {
            onComplete !== undefined && onComplete();

            setLoading(false);
        },
        staticData
    );

    React.useEffect(() => {
        if (triggerSubmit?.current === true) {
            triggerSubmit.current = false;

            form.submitForm();
        }
    });

    return (
        <FormContainer loading={loading}
                       name={data.name}
                       onSubmit={form.handleSubmit}
                       className="card-form-container"
                       loadingClassName="overflow-hidden border-radius-1"
        >
            <Box className="card">
                <FormFieldsContainer className="card-body p-block-1 flex-wrap">
                    <FormFields form={form}
                                elements={data.elements}
                    />
                </FormFieldsContainer>

                <Box className="card-footer p-block-1">
                    <FormButtons form={form}
                                 buttons={buttons}
                    />
                </Box>
            </Box>
        </FormContainer>
    );
}
