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

const AutocompleteField = (
    {
        name,
        label,
        route,
        routeParameter,
        mode,
        required,
        readonly,
        onChange
    }
) => {
    const [options, setOptions] = React.useState([]);

    let httpRequest = React.useRef(null);

    const urlGenerator = new UrlGenerator();
    const httpClient = new HttpClient();

    const onInputChange = (event, value) => {
        httpRequest.current?.abort();

        if (value && value.length > 2) {
            httpRequest.current = new HttpRequest(
                urlGenerator.generate(route, {[routeParameter]: value}),
                (response) => {
                    const data = HttpClient.getDataFromResponse(response);
                    if (data === null) {
                        setOptions([]);

                        return;
                    }

                    setOptions(data);
                },
                HttpRequest.TYPE_GET
            );

            httpClient.send(httpRequest.current);

            return;
        }

        setOptions([]);
    }

    const multiple = mode === Element.ARRAY_MULTIPLE;

    return (
        <AutocompleteBase multiple={multiple}
                          id={name}
                          name={name}
                          options={options}
                          onChange={onChange}
                          onInputChange={onInputChange}
                          getOptionLabel={(option) => option.label}
                          autoHighlight={true}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderInput={(params) => (
                              <TextFieldBase label={label}
                                             required={required}
                                             aria-readonly={readonly}
                                             InputProps={{"readOnly": readonly}}
                                             {...params}
                              />
                          )}
                          defaultValue={multiple ? [] : null}
                          readOnly={readonly}
        />
    );
}

const TextField = (
    {
        type,
        name,
        label,
        value,
        required,
        readonly,
        onChange,
        error,
        helperText,
        inputProps,
        ...props
    }
) => {
    return (
        <TextFieldBase type={type}
                       id={name}
                       name={name}
                       label={label}
                       value={value}
                       required={required}
                       aria-readonly={readonly}
                       InputProps={{
                           "readOnly": readonly,
                           ...inputProps
                       }}
                       onChange={onChange}
                       error={error}
                       helperText={helperText}
                       {...props}
        />
    );
}

const MultipleSelectField = (
    {
        name,
        label,
        options,
        value,
        required,
        readonly,
        onChange
    }
) => {
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
            <Select id={name}
                    name={name}
                    value={value ? value : []}
                    readOnly={readonly}
                    onChange={onChange}
                    input={<OutlinedInput label={label}/>}
                    multiple
                    labelId={labelId}
                    renderValue={(selected) => (
                        <Box className="d-flex flex-wrap gap-2">
                            {selected.map((value) => (
                                <Chip key={value} label={options.indexed[value]} sx={{"height": "24px"}}/>
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
            >
                {optionsComponents}
            </Select>
        </FormControl>
    );
}

const SelectField = (
    {
        name,
        label,
        options,
        value,
        mode,
        required,
        readonly,
        onChange,
    }
) => {
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
                                  groupBy={(option) => processedOptions.groupBy === true ? option.key : null}
                                  getOptionLabel={(option) => (option.label !== undefined ? option.label : (processedOptions.indexed[option] !== undefined ? processedOptions.indexed[option] : ""))}
                                  autoHighlight={true}
                                  isOptionEqualToValue={(option, value) => option.id?.toString() === value?.toString()}
                                  onChange={onChange}
                                  renderInput={(params) => (
                                      <TextFieldBase label={label}
                                                     required={required}
                                                     aria-readonly={readonly}
                                                     InputProps={{"readOnly": readonly}}
                                                     {...params}
                                      />
                                  )}
                                  defaultValue={null}
                                  readOnly={readonly}
                />
            );
        case Element.ARRAY_MULTIPLE:
            return (
                <MultipleSelectField name={name}
                                     label={label}
                                     options={processedOptions}
                                     value={value}
                                     required={required}
                                     readOnly={readonly}
                                     onChange={onChange}
                />
            );
        default:
            throw new Exception(`invalid array element mode "${mode}" for "${name}"`);
    }
}

const FormField = (
    {
        form,
        element,
        value,
        renderProps,
        callbacks,
        parents
    }
) => {
    const translator = new Translator();

    const buildName = (element, parents) => {
        const prefix = parents === undefined ? [] : parents;

        return [...prefix, element.name].join(".");
    }

    const formControlClassNames = ["form-control"];
    if (renderProps?.formControlClassName !== undefined) {
        formControlClassNames.push(renderProps?.formControlClassName);
    }

    const name = buildName(element, parents);
    const label = element.label ? translator.translate(element.label) : null;
    const readonly = element.readonly !== undefined ? element.readonly : false;
    const required = element.required !== undefined ? element.required : false;
    const onChange = (event, value) => {
        let processedValue = undefined;

        switch (element.type) {
            case Element.ARRAY:
                switch (element.mode) {
                    case Element.ARRAY_SINGLE:
                        processedValue = value ? value.id : null;
                        break;
                }
                break;
            case Element.AUTOCOMPLETE:
                processedValue = [];

                if (value) {
                    if (value.id !== undefined) {
                        processedValue.push(value.id);
                    } else if (Array.isArray(value) === true) {
                        value.map(v => processedValue.push(v.id))
                    } else {
                        throw new Exception(`invalid value for "${name}"`);
                    }
                }
                break;
            case Element.DATE:
                const dateFormat = Element.computeDateFormat(element.format);

                processedValue = value?.format(dateFormat);
                break;
            case Element.DATE_TIME:
                const dateTimeFormat = Element.computeDateTimeFormat(element.format);

                processedValue = value?.format(dateTimeFormat);
                break;
        }

        if (processedValue !== undefined) {
            form.setFieldValue(name, processedValue);
        } else {
            form.handleChange(event);
        }

        renderProps?.onChange && renderProps.onChange(
            event,
            processedValue !== undefined ? processedValue : event.target.value
        );
    }
    const error = form.touched[name] && Boolean(form.errors[name]);
    const helperText = form.touched[name] && form.errors[name];
    const elementClassName = renderProps?.className !== undefined ? " " + renderProps.className : "";

    let formField;
    switch (element.type) {
        case Element.ARRAY:
            formField = (
                <SelectField name={name}
                             label={label}
                             options={element.options}
                             value={value}
                             mode={element.mode}
                             required={required}
                             readonly={readonly}
                             onChange={onChange}
                />
            );
            break;
        case Element.AUTOCOMPLETE:
            formField = (
                <AutocompleteField name={name}
                                   label={label}
                                   route={element.route}
                                   routeParameter={element.parameter}
                                   mode={element.mode}
                                   required={required}
                                   readonly={readonly}
                                   onChange={onChange}
                />
            );
            break;
        case Element.BOOL:
            formField = (
                <FormControlLabel control={
                    <Checkbox id={name}
                              name={name}
                              checked={value}
                              required={required}
                              readOnly={readonly}
                              onChange={onChange}
                              inputProps={{"aria-label": "controlled"}}
                    />
                }
                                  label={label}
                />
            );
            break;
        case Element.COLLECTION:
            formControlClassNames.push("col-10");

            if (callbacks !== undefined) {
                callbacks.elements = {};
            }

            formField = (
                <Box key={name + "Collection"} className={"d-flex gap-1" + elementClassName}>
                    <FormFields form={form}
                                elements={element.elements}
                                parents={[...parents, element.name]}
                                renderProps={renderProps?.elements}
                                callbacks={callbacks?.elements}
                    />
                </Box>
            );
            break;
        case Element.DATE:
            formField = (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker label={label}
                                       inputFormat={Element.computeDateFormat(element.format)}
                                       value={value ? value : null}
                                       onChange={onChange}
                                       minDate={element.min}
                                       maxDate={element.max}
                                       readOnly={readonly}
                                       renderInput={(params) =>
                                           (
                                               <TextFieldBase id={name}
                                                              name={name}
                                                              required={required}
                                                              aria-readonly={readonly}
                                                              InputProps={{"readOnly": readonly}}
                                                              {...params}
                                               />
                                           )}
                    />
                </LocalizationProvider>
            );
            break;
        case Element.DATE_TIME:
            formField = (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker label={label}
                                    inputFormat={Element.computeDateTimeFormat(element.format)}
                                    value={value ? value : null}
                                    onChange={onChange}
                                    minDate={element.min}
                                    maxDate={element.max}
                                    readOnly={readonly}
                                    renderInput={(params) =>
                                        (
                                            <TextFieldBase id={name}
                                                           name={name}
                                                           required={required}
                                                           aria-readonly={readonly}
                                                           InputProps={{"readOnly": readonly}}
                                                           {...params}
                                            />
                                        )}
                    />
                </LocalizationProvider>
            );
            break;
        case Element.FILE:
            formField = (
                <TextField type="file"
                           name={name}
                           label={label}
                           value={value}
                           required={required}
                           readonly={readonly}
                           onChange={onChange}
                           error={error}
                           helperText={helperText}
                           InputLabelProps={{"shrink": true}}
                />
            );
            break;
        case Element.HIDDEN:
            formControlClassNames.push("hidden");

            formField = (
                <TextField type="hidden"
                           name={name}
                           label={label}
                           value={value}
                           required={required}
                           readonly={readonly}
                           onChange={onChange}
                           error={error}
                           helperText={helperText}
                />
            );
            break;
        case Element.LABEL:
            formField = value ? value : label;
            break;
        case Element.NUMBER:
            formField = (
                <TextField type="number"
                           name={name}
                           label={label}
                           value={value}
                           required={required}
                           readonly={readonly}
                           onChange={onChange}
                           error={error}
                           helperText={helperText}
                           inputProps={{"inputProps": {"min": element.min, "max": element.max, "step": element.step}}}
                />
            );
            break;
        case Element.PASSWORD:
            formField = (
                <TextField type="password"
                           name={name}
                           label={label}
                           value={value}
                           required={required}
                           readonly={readonly}
                           onChange={onChange}
                           error={error}
                           helperText={helperText}
                />
            );
            break;
        case Element.PROTOTYPE_COLLECTION:
            formField = (
                <FieldArray name={element.name}
                            render={(arrayHelpers) => {
                                if (callbacks !== undefined) {
                                    const findByKey = (key) => {
                                        for (const [index, elementValues] of value.entries()) {
                                            if (elementValues[element.key] === key) {
                                                return [index, elementValues];
                                            }
                                        }

                                        return [null, null];
                                    }

                                    callbacks.remove = (key) => {
                                        const [index] = findByKey(key);

                                        if (index === null) {
                                            return null;
                                        }

                                        return arrayHelpers.remove(index);
                                    }

                                    callbacks.get = (key) => {
                                        const [_, elementValues] = findByKey(key);

                                        return elementValues;
                                    }

                                    callbacks.set = (key, elementValues, append = false) => {
                                        const [index, currentElement] = findByKey(key);

                                        const newElement = FormBuilder.createPrototypeCollectionElementValues(
                                            element.key,
                                            key,
                                            {
                                                ...(append === true ? currentElement : {}),
                                                ...elementValues
                                            }
                                        );

                                        if (index !== null) {
                                            arrayHelpers.replace(index, newElement);
                                        } else {
                                            arrayHelpers.push(newElement);
                                        }
                                    };

                                    callbacks.elements = {};
                                }

                                return (
                                    <Box key={name + "PrototypeCollection"} className="d-flex flex-column gap-1">
                                        {value.map((_, index) => (
                                            <Box key={index} className="d-flex align-items-center gap-1">
                                                <FormFields form={form}
                                                            elements={clone(element.prototype)}
                                                            parents={[...parents, element.name, index]}
                                                            renderProps={renderProps?.elements}
                                                            callbacks={callbacks?.elements}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                );
                            }}
                />
            );
            break;
        case Element.STRING:
            formField = (
                <TextField type="text"
                           name={name}
                           label={label}
                           value={value}
                           required={required}
                           readonly={readonly}
                           onChange={onChange}
                           error={error}
                           helperText={helperText}
                />
            );
            break;
        default:
            throw new Exception(`invalid form element type "${element.type}" for "${name}"`);
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

export class Button {
    static get SUBMIT() {
        return "submit";
    }

    static get RESET() {
        return "reset";
    }

    static get CANCEL() {
        return "cancel";
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
                        initialValues[name] = [];

                        Object.entries(element.elements).map(([key, elementsCollection]) =>
                            initialValues[name].push(
                                FormBuilder.createPrototypeCollectionElementValues(
                                    element.key,
                                    key,
                                    FormBuilder.computeInitialValues(elementsCollection)
                                )
                            )
                        );
                        break;
                    default:
                        initialValues[name] = element.value ? element.value : "";
                }
            }
        );

        return initialValues;
    }

    static initCallbacks = (callbacks) => {
        if (callbacks === undefined) {
            return;
        }

        callbacks.elements = {};
    }

    static createPrototypeCollectionElementValues = (keyName, keyValue, values) => {
        return {
            [keyName]: keyValue,
            ...values
        }
    }
}

export const FormFieldsContainer = (
    {
        children,
        className,
        ...props
    }
) => {
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

export const FormControl = (
    {
        children,
        ...props
    }
) => {
    return (
        <FormControlBase fullWidth {...props}>
            {children}
        </FormControlBase>
    );
}

export const FormFields = (
    {
        form,
        elements,
        renderProps,
        callbacks,
        parents
    }
) => {
    const getNestedValuesByPath = (object, path) => {
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
    const values = getNestedValuesByPath(form.values, parents);

    return Object.entries(elements).map(([, element]) => {
            if (callbacks !== undefined) {
                callbacks[element.name] = {};
            }

            return (
                <FormField key={element.name}
                           form={form}
                           element={element}
                           value={values?.[element.name] !== undefined ? values?.[element.name] : ""}
                           renderProps={renderProps?.[element.name]}
                           callbacks={callbacks?.[element.name]}
                           parents={parents}
                />
            );
        }
    );
}

export const FormButtons = (
    {
        form,
        buttons
    }
) => {
    const translator = new Translator();

    buttons = buttons === undefined ? {[Button.SUBMIT]: "wms.button.ok"} : buttons;

    return (
        <FormControl>
            <Box className="d-flex align-items-center justify-content-center gap-1">
                {
                    Object.entries(buttons).map(([type, button]) => {
                            const [icon, label, onClick] = button;

                            switch (type) {
                                case Button.SUBMIT:
                                    return (
                                        <ButtonBase key={type}
                                                    type="submit"
                                                    color="primary"
                                                    variant="contained"
                                                    fullWidth={buttons.length === 1}
                                                    onClick={onClick}
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
                                case Button.CANCEL:
                                    return (
                                        <ButtonBase key={type}
                                                    type="button"
                                                    color="error"
                                                    variant="outlined"
                                                    onClick={() => onClick && onClick()}
                                        >
                                            {icon}{translator.translate(label)}
                                        </ButtonBase>
                                    );
                                default:
                                    logger.error(`invalid button type "${type}"`);
                                    break;
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
        triggerReset,
        staticData,
        containerClassName,
        loadingClassName,
        renderProps,
        callbacks,
        children
    }
) => {
    if (blockOnSubmit === undefined) {
        blockOnSubmit = true;
    }

    const formData = React.useMemo(() => clone(data), []);

    const [loading, setLoadingState] = React.useState(false);
    const setLoading = (loading) => blockOnSubmit === true && setLoadingState(loading);

    const urlGenerator = new UrlGenerator();
    const httpClient = new HttpClient();

    const onSubmit = (values) => {
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
                setLoading(true);

                beforeSend !== undefined && beforeSend();
            })
            .setOnError(() => onSubmitFailure !== undefined && onSubmitFailure())
            .setOnComplete(() => {
                onComplete !== undefined && onComplete();

                setLoading(false);
            });

        httpClient.send(httpRequest);
    }

    return (
        <Formik initialValues={React.useMemo(() => FormBuilder.computeInitialValues(formData.elements), [])}
                onSubmit={onSubmit}
                enableReinitialize={false}
        >
            {(form) => {
                if (triggerSubmit?.current === true) {
                    triggerSubmit.current = false;
                    form.submitForm();
                }

                if (triggerReset?.current === true) {
                    triggerReset.current = false;
                    form.resetForm();
                }

                const classNames = ["form-container"];
                if (containerClassName !== undefined) {
                    classNames.push(containerClassName);
                }

                return (
                    <Box className={classNames.join(" ")}>
                        <BlockUi open={loading}
                                 className={["h-100 w-100" + (loadingClassName ? loadingClassName : "")].join(" ")}
                        >
                            <FormBase name={formData.name}
                                      onSubmit={form.handleSubmit}
                                      autoComplete="off"
                                      className="p-0 m-0 h-100 w-100"
                            >
                                {children(form, formData.elements, buttons, renderProps, callbacks)}
                            </FormBase>
                        </BlockUi>
                    </Box>
                );
            }}
        </Formik>
    );
}

export const FormVertical = (props) => {
    return (
        <Form {...props}>
            {(form, elements, buttons, renderProps, callbacks) => {
                FormBuilder.initCallbacks(callbacks);

                return (
                    <Box className="d-flex flex-column gap-1">
                        <FormFieldsContainer className="flex-column">
                            <FormFields form={form}
                                        elements={elements}
                                        renderProps={renderProps?.elements}
                                        callbacks={callbacks?.elements}
                            />
                        </FormFieldsContainer>

                        <FormButtons form={form}
                                     buttons={buttons}
                        />
                    </Box>
                );
            }}
        </Form>
    );
}

export const FormCard = (props) => {
    return (
        <Form containerClassName="card-form-container"
              loadingClassName="overflow-hidden border-radius-1"
              {...props}
        >
            {(form, elements, buttons, renderProps, callbacks) => {
                FormBuilder.initCallbacks(callbacks);

                return (
                    <Box className="card">
                        {renderProps?.title !== undefined &&
                            <Box className="card-header">{renderProps?.title}</Box>
                        }

                        <FormFieldsContainer className="card-body p-block-1 flex-wrap">
                            <FormFields form={form}
                                        elements={elements}
                                        renderProps={renderProps?.elements}
                                        callbacks={callbacks?.elements}
                            />
                        </FormFieldsContainer>

                        <Box className="card-footer p-block-1">
                            <FormButtons form={form}
                                         buttons={buttons}
                            />
                        </Box>
                    </Box>
                );
            }}
        </Form>
    );
}
