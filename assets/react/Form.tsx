"use strict";

import "./css/form.scss";

/** external libraries */
import React, {HTMLInputTypeAttribute} from "react";
import {FieldArray, Form as FormBase, Formik, FormikProps, FormikValues} from "formik";
import {Autocomplete as AutocompleteBase, Box, Button as ButtonBase, Checkbox, Chip, FormControl as FormControlBase, FormControlLabel, InputLabel, InputLabelProps, ListItemText, ListSubheader, MenuItem, OutlinedInput, Select, TextField as TextFieldBase} from "@mui/material";
import {DateTimePicker, DesktopDatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {InputProps as StandardInputProps} from "@mui/material/Input/Input";
import {AutocompleteChangeDetails, AutocompleteChangeReason, AutocompleteInputChangeReason, AutocompleteValue as AutocompleteValueBase} from "@mui/base/AutocompleteUnstyled/useAutocomplete";
import {SelectChangeEvent} from "@mui/material/Select/SelectInput";

/** internal components */
import BlockUi from "./BlockUi";
import Exception from "../exception/Exception";
import useUrlGenerator from "UrlGenerator";
import {HttpRequest, HttpRequestTypeEnum, useHttpClient} from "HttpClient";
import logger from "../service/Logger";
import {clone} from "../service/Uility";
import Icon from "./Icon";
import {NullableStringType, StringNumberType} from "../type/Scalar";
import {MapType, NullableMapType} from "../type/Map";
import {NullaryType, SetLoadingType} from "../type/Function";
import {StringArrayType} from "../type/Array";
import {BooleanRefType} from "../type/React";
import LanguageContext from "../context/LanguageContext";
import {buttonErrorOutlined, resetSecondary, submitPrimaryOutlined} from "./Button";

export enum ElementTypeEnum {
    ARRAY = "array",
    AUTOCOMPLETE = "autocomplete",
    BOOL = "bool",
    COLLECTION = "collection",
    DATE = "date",
    DATE_TIME = "dateTime",
    FILE = "file",
    HIDDEN = "hidden",
    LABEL = "label",
    NUMBER = "number",
    PASSWORD = "password",
    PROTOTYPE_COLLECTION = "prototypeCollection",
    STRING = "string"
}

export enum ElementModeEnum {
    SINGLE = "single",
    MULTIPLE = "multiple"
}

type SelectOptionsType = {
    [id: StringNumberType]: (StringNumberType | { [id: StringNumberType]: StringNumberType })
}

type FormFieldValueType = any;

export type ElementType = {
    type: ElementTypeEnum
    name: string
    label: string
    readonly?: boolean
    required?: boolean
    format?: string
    mode?: ElementModeEnum
    value?: FormFieldValueType
    elements?: ElementListType | ElementListType[]
    key?: string
    route?: string
    parameter?: string
    prototype?: ElementListType
    min?: any
    max?: any
    step?: number
    options?: SelectOptionsType
}

export type ElementListType = {
    [name: string]: ElementType
};

export type FormType = FormikProps<FormikValues>;

type OnChangeEventType = (React.SyntheticEvent | SelectChangeEvent<any> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) & { target: { value: unknown }, format?: any };
type OnChangeValueType = any;
type OnChangeCallbackType = (event: OnChangeEventType, value?: OnChangeValueType, reason?: any) => void;
type OnChangeAutocompleteType<T> = (event: React.SyntheticEvent, value: any, reason?: AutocompleteChangeReason, details?: AutocompleteChangeDetails<T>) => void;

type FocusType = {
    autoFocus?: BooleanRefType
    selectOnFocus?: boolean
}

export type FormFieldRenderPropsType = FocusType & {
    formControlClassName?: string
    onChange?: (event: OnChangeEventType, value: OnChangeValueType) => void
    className?: string
    elements?: FormFieldsRenderPropsType
}
export type FormFieldsRenderPropsType = {
    [name: string]: FormFieldRenderPropsType
}
export type FormRenderPropsType = {
    title?: string
    elements?: FormFieldsRenderPropsType
}

export type FormFieldCallbacksType = {
    remove?: (key: StringNumberType) => void
    get?: <RT = unknown>(key: StringNumberType) => MapType<RT>
    set?: (key: StringNumberType, values: MapType) => void
    elements?: FormFieldsCallbacksType
}
export type FormFieldsCallbacksType = {
    [name: string]: FormFieldCallbacksType
}
export type FormCallbacksType = {
    elements?: FormFieldsCallbacksType
}

export type FormDataType = MapType & {
    action: {
        route: string
        parameters: NullableMapType
    }
    method: HttpRequestTypeEnum
    name: string
    elements: ElementListType
}

export type OnSubmitSuccessType<VT = MapType, DT = MapType> = (values: VT, data: DT) => void;
export type OnSubmitFailureType = (errors?: StringArrayType) => void;

type FieldType = FocusType & {
    name: string
    label: string
    required: boolean
    readonly: boolean
    value: any
    onChange: OnChangeCallbackType
}

export enum ButtonTypeEnum {
    SUBMIT = "submit",
    RESET = "reset",
    CANCEL = "cancel"
}

type ButtonType = [React.ReactElement, string, NullaryType?];
type ButtonListType = {
    [type in ButtonTypeEnum]?: ButtonType
}

export class FormBuilder {
    static computeDateFormat = (elementFormat: string): string => {
        let format = "YYYY-MM-DD";

        switch (elementFormat) {
            case "d-m-Y":
                format = "DD-MM-YYYY";
                break;
        }

        return format;
    }

    static computeDateTimeFormat = (elementFormat: string): string => {
        let format = "YYYY-MM-DD HH:mm";

        switch (elementFormat) {
            case "d-m-Y H:i":
                format = "DD-MM-YYYY HH:mm";
                break;
        }

        return format;
    }

    static computeInitialValues = (elements: ElementListType): MapType => {
        const initialValues = {};

        Object.entries(elements).map(([name, element]) => {
                switch (element.type) {
                    case ElementTypeEnum.ARRAY:
                        switch (element.mode) {
                            case ElementModeEnum.SINGLE:
                                const value = element.value ? element.value : null

                                initialValues[name] = value && element.value.length > 0 ? element.value[0] : null;
                                break;
                            default:
                                initialValues[name] = element.value ? element.value : [];
                        }
                        break;
                    case ElementTypeEnum.BOOL:
                        initialValues[name] = element.value ? element.value : false;
                        break;
                    case ElementTypeEnum.COLLECTION:
                        initialValues[name] = FormBuilder.computeInitialValues(element.elements as ElementListType);
                        break;
                    case ElementTypeEnum.PROTOTYPE_COLLECTION:
                        initialValues[name] = [];

                        Object.entries(element.elements as ElementListType[]).map(([key, elementsCollection]) =>
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

    static initCallbacks = (callbacks: FormCallbacksType): void => {
        if (callbacks === undefined) {
            return;
        }

        callbacks.elements = {};
    }

    static createPrototypeCollectionElementValues = (keyName: string, keyValue: StringNumberType, values: MapType): MapType => {
        return {
            [keyName]: keyValue,
            ...values
        }
    }
}

type AutocompleteFieldProps = FieldType & {
    mode: ElementModeEnum
    route: string
    routeParameter: string
}

const AutocompleteField: React.FunctionComponent<AutocompleteFieldProps> = (props) => {
    type AutocompleteFieldOptionType = {
        id: number
        label: string
    }

    type AutocompleteFieldOptionListType = AutocompleteFieldOptionType[];

    type AutocompleteValue = AutocompleteValueBase<AutocompleteFieldOptionType | AutocompleteFieldOptionType[], boolean, boolean, boolean>;

    const multiple: boolean = props.mode === ElementModeEnum.MULTIPLE;

    const initialValue: AutocompleteValue = multiple ? [] : null;

    const [value, setValue] = React.useState<AutocompleteValue>(initialValue);
    const [inputValue, setInputValue] = React.useState<string>("");
    const [options, setOptions] = React.useState<AutocompleteFieldOptionListType>([]);

    const httpRequest = React.useRef<HttpRequest>(null);

    const urlGenerator = useUrlGenerator();
    const httpClient = useHttpClient();

    const onInputChange = (event: React.SyntheticEvent, value: NullableStringType, reason: AutocompleteInputChangeReason): void => {
        setInputValue(value);

        httpRequest.current?.abort();

        if (reason === "reset" && multiple == true) {
            return;
        }

        if (value && value.length > 2) {
            httpRequest.current = new HttpRequest(
                urlGenerator.generate(props.route, {[props.routeParameter]: value}),
                (response) => {
                    const data = httpClient.getDataFromResponse(response);
                    if (data === null) {
                        setOptions([]);

                        return;
                    }

                    setOptions(data as AutocompleteFieldOptionListType);
                },
                HttpRequestTypeEnum.GET
            );

            httpClient.send(httpRequest.current);

            return;
        }

        setOptions([]);
    }

    React.useEffect(() => {
        if (props.value === null || props.value.length === 0) {
            setValue(initialValue);
            setInputValue("");
            setOptions([]);
        }
    }, [props.value]);

    const onChange: OnChangeAutocompleteType<AutocompleteFieldOptionType> = (event, value) => {
        setValue(value);
        props.onChange(event as OnChangeEventType, value);
    }

    /** @todo autofocus */

    return (
        <AutocompleteBase<AutocompleteFieldOptionType | AutocompleteFieldOptionType[], boolean, boolean, boolean>
            multiple={multiple}
            freeSolo={true}
            disableCloseOnSelect={multiple}
            id={props.name}
            options={options}
            value={value}
            inputValue={inputValue}
            defaultValue={initialValue}
            onChange={onChange}
            onInputChange={onInputChange}
            getOptionLabel={(option: AutocompleteFieldOptionType) => option ? option.label : ""}
            autoHighlight={true}
            isOptionEqualToValue={(option: AutocompleteFieldOptionType, value: AutocompleteFieldOptionType) => option.id === value.id}
            renderInput={(params) => (
                <TextFieldBase {...params}
                               label={props.label}
                               required={props.required}
                               fullWidth
                />
            )}
            readOnly={props.readonly}
        />
    );
}

type TextFieldProps = FieldType & {
    type: HTMLInputTypeAttribute
    error: boolean
    helperText: any
    inputProps?: StandardInputProps
    inputLabelProps?: InputLabelProps
}

const TextField: React.FunctionComponent<TextFieldProps> = (props) => {
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
}

type SelectFieldProps = FieldType & {
    options: SelectOptionsType
    mode: ElementModeEnum
}

const SelectField: React.FunctionComponent<SelectFieldProps> = (props) => {
    type SelectFieldOptionType = {
        id: StringNumberType
        label: string
        key: NullableStringType
    }

    type SelectFieldOptionListType = SelectFieldOptionType[];

    type SelectFieldProcessedOptionsType = {
        groupBy: boolean
        grouped: SelectFieldOptionListType
        indexed: MapType<string>
    }

    const languageContext = React.useContext(LanguageContext);

    const processOptions = (options: SelectOptionsType): SelectFieldProcessedOptionsType => {
        let groupBy = false;
        const groupedOptions: SelectFieldOptionListType = [];
        const indexedOptions: MapType<string> = {};

        Object.entries(options).map(([id, optionData]) => {
            if (typeof optionData === "string") {
                const translatedLabel = languageContext.translate(optionData);

                groupedOptions.push({id: id, label: translatedLabel, key: null});

                indexedOptions[id] = translatedLabel;
            } else {
                groupBy = true;

                Object.entries(optionData).map(([childId, label]) => {
                    const translatedLabel = languageContext.translate(label);

                    groupedOptions.push({id: childId, label: translatedLabel, key: id});

                    indexedOptions[childId] = translatedLabel;
                })
            }
        });

        return {
            groupBy: groupBy,
            grouped: groupedOptions,
            indexed: indexedOptions
        }
    }

    const processedOptions = processOptions(props.options);

    switch (props.mode) {
        case ElementModeEnum.SINGLE:
            let value: AutocompleteValueBase<SelectFieldOptionType, false, boolean, boolean>;
            if (props.value && processedOptions.indexed[props.value] !== undefined) {
                value = {
                    id: props.value,
                    label: processedOptions.indexed[props.value],
                    key: null
                }
            }

            return (
                <AutocompleteBase<SelectFieldOptionType, false, boolean, boolean>
                    multiple={false}
                    id={props.name}
                    value={value ? value : null}
                    options={processedOptions.grouped}
                    groupBy={(option) => processedOptions.groupBy === true ? option.key : null}
                    getOptionLabel={(option: SelectFieldOptionType) => option.label}
                    autoHighlight={true}
                    isOptionEqualToValue={(option, value) => option.id?.toString() === value.id?.toString()}
                    onChange={props.onChange as OnChangeAutocompleteType<SelectFieldOptionType>}
                    renderInput={(params) => (
                        <TextFieldBase {...params}
                                       label={props.label}
                                       required={props.required}
                                       fullWidth
                        />
                    )}
                    defaultValue={null}
                    readOnly={props.readonly}
                />
            );
        case ElementModeEnum.MULTIPLE:
            const labelId: string = props.name + "Label";
            let lastRenderedGroup: NullableStringType = null;
            const optionsComponents: React.ReactElement[] = [];

            processedOptions.grouped.map((option) => {
                    if (processedOptions.groupBy === true && option.key !== lastRenderedGroup) {
                        lastRenderedGroup = option.key;

                        optionsComponents.push((<ListSubheader key={option.key}>{option.key}</ListSubheader>));
                    }

                    optionsComponents.push((
                        <MenuItem key={option.id} value={option.id}>
                            <Checkbox checked={props.value.indexOf(option.id) > -1}/>
                            <ListItemText primary={option.label}/>
                        </MenuItem>
                    ));
                }
            )

            return (
                <FormControl required={props.required}>
                    <InputLabel id={labelId}>{props.label}</InputLabel>
                    <Select id={props.name}
                            name={props.name}
                            value={props.value}
                            readOnly={props.readonly}
                            autoFocus={props.autoFocus.current}
                            onChange={props.onChange}
                            input={<OutlinedInput label={props.label}/>}
                            multiple
                            labelId={labelId}
                            renderValue={(selected: StringArrayType) => (
                                <Box className="d-flex flex-wrap gap-2">
                                    {selected.map((value) => (
                                        <Chip key={value} label={<>{processedOptions.indexed[value]}</>} sx={{height: "24px"}}/>
                                    ))}
                                </Box>
                            )}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 225
                                    },
                                },
                            }}
                            defaultValue={null}
                    >
                        {optionsComponents}
                    </Select>
                </FormControl>
            );
        default:
            throw new Exception(`invalid array element mode "${props.mode}" for "${props.name}"`);
    }
}

type DesktopDateFieldProps = FieldType & {
    format: string
    min: any
    max: any
}

const DateField: React.FunctionComponent<DesktopDateFieldProps> = (props) => {
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
}

type DateTimeFieldProps = FieldType & {
    format: string
    min: any
    max: any
}

const DateTimeField: React.FunctionComponent<DateTimeFieldProps> = (props) => {
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

type FormFieldProps = {
    form: FormType
    element: ElementType
    value?: FormFieldValueType
    renderProps?: FormFieldRenderPropsType
    callbacks?: FormFieldCallbacksType
    parents?: StringArrayType
}

const FormField: React.FunctionComponent<FormFieldProps> = (props) => {
    const languageContext = React.useContext(LanguageContext);
    const defaultAutoFocus = React.useRef<boolean>(false);

    const buildName = (element: ElementType, parents: StringArrayType): string => {
        const prefix = parents === undefined ? [] : parents;

        return [...prefix, element.name].join(".");
    }

    const formControlClassNames: StringArrayType = ["form-control"];
    if (props.renderProps?.formControlClassName !== undefined) {
        formControlClassNames.push(props.renderProps?.formControlClassName);
    }

    const name: string = buildName(props.element, props.parents);
    const label: NullableStringType = props.element.label ? languageContext.translate(props.element.label) : null;
    const readonly: boolean = (props.element.readonly !== undefined ? props.element.readonly : false) || props.form.isSubmitting;
    const required: boolean = props.element.required !== undefined ? props.element.required : false;
    const autoFocus: BooleanRefType = props.renderProps?.autoFocus !== undefined ? props.renderProps.autoFocus : defaultAutoFocus;
    const selectOnFocus: boolean = props.renderProps?.selectOnFocus !== undefined ? props.renderProps.selectOnFocus : false;
    const onChange: OnChangeCallbackType = (event, value) => {
        let processedValue = undefined;

        switch (props.element.type) {
            case ElementTypeEnum.ARRAY:
                switch (props.element.mode) {
                    case ElementModeEnum.SINGLE:
                        processedValue = value ? value.id : null;
                        break;
                }
                break;
            case ElementTypeEnum.AUTOCOMPLETE:
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
            case ElementTypeEnum.DATE:
                const dateFormat = FormBuilder.computeDateFormat(props.element.format);

                processedValue = event?.format(dateFormat);
                break;
            case ElementTypeEnum.DATE_TIME:
                const dateTimeFormat = FormBuilder.computeDateTimeFormat(props.element.format);

                processedValue = event?.format(dateTimeFormat);
                break;
        }

        if (processedValue !== undefined) {
            props.form.setFieldValue(name, processedValue);
        } else {
            props.form.handleChange(event);
        }

        props.renderProps?.onChange && props.renderProps.onChange(
            event,
            processedValue !== undefined ? processedValue : event.target.value
        );
    }
    const error: boolean = props.form.touched[name] && Boolean(props.form.errors[name]);
    const helperText = props.form.touched[name] && props.form.errors[name];
    const elementClassName: string = props.renderProps?.className !== undefined ? " " + props.renderProps.className : "";

    let formField: React.ReactElement;
    switch (props.element.type) {
        case ElementTypeEnum.ARRAY:
            formField = (
                <SelectField name={name}
                             label={label}
                             options={props.element.options}
                             value={props.value}
                             mode={props.element.mode}
                             required={required}
                             readonly={readonly}
                             autoFocus={autoFocus}
                             onChange={onChange}
                />
            );
            break;
        case ElementTypeEnum.AUTOCOMPLETE:
            formField = (
                <AutocompleteField name={name}
                                   label={label}
                                   value={props.value}
                                   route={props.element.route}
                                   routeParameter={props.element.parameter}
                                   mode={props.element.mode}
                                   required={required}
                                   readonly={readonly}
                                   autoFocus={autoFocus}
                                   onChange={onChange}
                />
            );
            break;
        case ElementTypeEnum.BOOL:
            formField = (
                <FormControlLabel control={
                    <Checkbox id={name}
                              name={name}
                              checked={props.value as boolean}
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
        case ElementTypeEnum.COLLECTION:
            formControlClassNames.push("col-10");

            if (props.callbacks !== undefined) {
                props.callbacks.elements = {};
            }

            formField = (
                <Box key={name + "Collection"} className={"d-flex gap-1" + elementClassName}>
                    <FormFields form={props.form}
                                elements={props.element.elements as ElementListType}
                                parents={[...props.parents, props.element.name]}
                                renderProps={props.renderProps?.elements}
                                callbacks={props.callbacks?.elements}
                    />
                </Box>
            );
            break;
        case ElementTypeEnum.DATE:
            formField = (
                <DateField label={label}
                           format={props.element.format}
                           value={props.value}
                           onChange={onChange}
                           min={props.element.min}
                           max={props.element.max}
                           readonly={readonly}
                           autoFocus={autoFocus}
                           name={name}
                           required={required}
                />
            );
            break;
        case ElementTypeEnum.DATE_TIME:
            formField = (
                <DateTimeField label={label}
                               format={props.element.format}
                               value={props.value}
                               onChange={onChange}
                               min={props.element.min}
                               max={props.element.max}
                               readonly={readonly}
                               autoFocus={autoFocus}
                               name={name}
                               required={required}
                />
            );
            break;
        case ElementTypeEnum.FILE:
            formField = (
                <TextField type="file"
                           name={name}
                           label={label}
                           value={props.value}
                           required={required}
                           readonly={readonly}
                           autoFocus={autoFocus}
                           selectOnFocus={selectOnFocus}
                           onChange={onChange}
                           error={error}
                           helperText={helperText}
                           inputLabelProps={{shrink: true}}
                />
            );
            break;
        case ElementTypeEnum.HIDDEN:
            formControlClassNames.push("hidden");

            formField = (
                <TextField type="hidden"
                           name={name}
                           label={label}
                           value={props.value}
                           required={required}
                           readonly={readonly}
                           autoFocus={autoFocus}
                           selectOnFocus={selectOnFocus}
                           onChange={onChange}
                           error={error}
                           helperText={helperText}
                />
            );
            break;
        case ElementTypeEnum.LABEL:
            formField = props.value ? props.value : label;
            break;
        case ElementTypeEnum.NUMBER:
            formField = (
                <TextField type="number"
                           name={name}
                           label={label}
                           value={props.value}
                           required={required}
                           readonly={readonly}
                           autoFocus={autoFocus}
                           selectOnFocus={selectOnFocus}
                           onChange={onChange}
                           error={error}
                           helperText={helperText}
                           inputProps={{inputProps: {min: props.element.min, max: props.element.max, step: props.element.step}}}
                />
            );
            break;
        case ElementTypeEnum.PASSWORD:
            formField = (
                <TextField type="password"
                           name={name}
                           label={label}
                           value={props.value}
                           required={required}
                           readonly={readonly}
                           autoFocus={autoFocus}
                           selectOnFocus={selectOnFocus}
                           onChange={onChange}
                           error={error}
                           helperText={helperText}
                />
            );
            break;
        case ElementTypeEnum.PROTOTYPE_COLLECTION:
            formField = (
                <FieldArray name={props.element.name}
                            render={(arrayHelpers) => {
                                if (props.callbacks !== undefined) {
                                    const findByKey = (key: unknown): [number | null, FormikValues | null] => {
                                        for (const [index, elementValues] of props.value.entries()) {
                                            if (elementValues[props.element.key] === key) {
                                                return [index, elementValues];
                                            }
                                        }

                                        return [null, null];
                                    }

                                    props.callbacks.remove = (key): void => {
                                        const [index] = findByKey(key);

                                        if (index === null) {
                                            return null;
                                        }

                                        arrayHelpers.remove(index);
                                    }

                                    props.callbacks.get = (key) => {
                                        const [_, elementValues] = findByKey(key);

                                        return elementValues;
                                    }

                                    props.callbacks.set = (key, values): void => {
                                        const [index] = findByKey(key);

                                        const elementValues = FormBuilder.createPrototypeCollectionElementValues(
                                            props.element.key,
                                            key,
                                            {...values}
                                        );

                                        if (index !== null) {
                                            arrayHelpers.replace(index, elementValues);
                                        } else {
                                            arrayHelpers.push(elementValues);
                                        }
                                    }

                                    props.callbacks.elements = {};
                                }

                                return (
                                    <Box key={name + "PrototypeCollection"} className="d-flex flex-column gap-1">
                                        {props.value.map((_, index) => (
                                            <Box key={index} className="d-flex align-items-center gap-1">
                                                <FormFields form={props.form}
                                                            elements={clone(props.element.prototype)}
                                                            parents={[...props.parents, props.element.name, index]}
                                                            renderProps={props.renderProps?.elements}
                                                            callbacks={props.callbacks?.elements}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                );
                            }}
                />
            );
            break;
        case ElementTypeEnum.STRING:
            formField = (
                <TextField type="text"
                           name={name}
                           label={label}
                           value={props.value}
                           required={required}
                           readonly={readonly}
                           autoFocus={autoFocus}
                           selectOnFocus={selectOnFocus}
                           onChange={onChange}
                           error={error}
                           helperText={helperText}
                />
            );
            break;
        default:
            throw new Exception(`invalid form element type "${props.element.type}" for "${name}"`);
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

type FormFieldsContainerProps = {
    children: React.ReactNode
    className?: string
}

export const FormFieldsContainer: React.FunctionComponent<FormFieldsContainerProps> = (props) => {
    const classNames: StringArrayType = ["form-fields-container", "d-flex flex-wrap gap-1 align-items-center"];
    if (props.className !== undefined) {
        classNames.push(props.className);
    }

    return (
        <Box className={classNames.join(" ")}>
            {props.children}
        </Box>
    );
}

type FormControlProps = {
    children: React.ReactNode
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

type FormFieldsProps = {
    form: FormType
    elements: ElementListType
    renderProps?: FormFieldsRenderPropsType
    callbacks?: FormFieldsCallbacksType
    parents?: StringArrayType
}

export const FormFields: React.FunctionComponent<FormFieldsProps> = (props) => {
    const getNestedValuesByPath = (values: FormikValues, path?: StringArrayType): FormikValues => {
        if (path === undefined || path.length === 0) {
            return values;
        }

        let result: FormikValues = values;

        for (let i = 0; i < path.length; i++) {
            if (result === undefined) {
                break;
            }

            result = result[path[i]];
        }

        return result;
    }

    const parents: StringArrayType = props.parents === undefined ? [] : props.parents;
    const values: FormikValues = getNestedValuesByPath(props.form.values, parents);

    return (
        <>
            {Object.entries(props.elements).map(([, element]) => {
                    if (props.callbacks !== undefined) {
                        props.callbacks[element.name] = {};
                    }

                    return (
                        <FormField key={element.name}
                                   form={props.form}
                                   element={element}
                                   value={values?.[element.name] !== undefined ? values?.[element.name] : ""}
                                   renderProps={props.renderProps?.[element.name]}
                                   callbacks={props.callbacks?.[element.name]}
                                   parents={parents}
                        />
                    );
                }
            )}
        </>
    );
}

type FormButtonsProps = {
    form: FormType
    buttons?: ButtonListType
}

export const FormButtons: React.FunctionComponent<FormButtonsProps> = (props) => {
    const languageContext = React.useContext(LanguageContext);

    const buttonsList: ButtonListType =
        props.buttons === undefined ? {[ButtonTypeEnum.SUBMIT]: [<Icon name="check"/>, "wms.button.ok"]} : props.buttons;
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

                                                    onClick && onClick()
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
}

type FormProps = {
    data: FormDataType
    buttons: ButtonListType
    onSubmitSuccess?: OnSubmitSuccessType
    onSubmitFailure?: OnSubmitFailureType
    beforeSend?: NullaryType
    onComplete?: NullaryType
    blockOnSubmit?: boolean
    triggerSubmit?: BooleanRefType
    triggerReset?: BooleanRefType
    staticData?: MapType
    containerClassName?: string
    loadingClassName?: string
    renderProps?: FormRenderPropsType
    callbacks?: FormCallbacksType
    enableReinitialize?: boolean
    children?: (form: FormType, elements: ElementListType, buttons: ButtonListType, renderProps: FormRenderPropsType, callbacks: FormCallbacksType) => React.ReactElement
}

export const Form: React.FunctionComponent<FormProps> = (props) => {
    const blockOnSubmit: boolean = props.blockOnSubmit === undefined ? true : props.blockOnSubmit;

    const enableReinitialize: boolean = props.enableReinitialize === undefined ? false : props.enableReinitialize;

    const [loading, setLoadingState] = React.useState<boolean>(false);
    const setLoading: SetLoadingType = (loading) => blockOnSubmit === true && setLoadingState(loading);

    const urlGenerator = useUrlGenerator();
    const httpClient = useHttpClient();

    const onSubmit = (values: MapType, {setSubmitting}): void => {
        const httpRequest = (new HttpRequest(
            urlGenerator.generate(props.data.action.route, props.data.action.parameters),
            (response) => {
                if (response.success === false) {
                    props.onSubmitFailure !== undefined && props.onSubmitFailure(response.errors);

                    return;
                }

                props.onSubmitSuccess !== undefined && props.onSubmitSuccess(values, response.data);
            },
            props.data.method
        ))
            .setData(
                {
                    [props.data.name]: values,
                    ...props.staticData
                }
            )
            .setBeforeSend(() => {
                setLoading(true);

                props.beforeSend !== undefined && props.beforeSend();
            })
            .setOnError(() => props.onSubmitFailure !== undefined && props.onSubmitFailure())
            .setOnComplete(() => {
                props.onComplete !== undefined && props.onComplete();

                setSubmitting(false);

                setLoading(false);
            });

        httpClient.send(httpRequest);
    }

    return (
        <Formik initialValues={FormBuilder.computeInitialValues(props.data.elements)}
                onSubmit={onSubmit}
                enableReinitialize={enableReinitialize}
        >
            {(form) => {
                if (props.triggerSubmit?.current === true) {
                    props.triggerSubmit.current = false;
                    form.submitForm();
                }

                if (props.triggerReset?.current === true) {
                    props.triggerReset.current = false;
                    form.resetForm();
                }

                const classNames = ["form-container"];
                if (props.containerClassName !== undefined) {
                    classNames.push(props.containerClassName);
                }

                return (
                    <Box className={classNames.join(" ")}>
                        <BlockUi open={loading}
                                 className={["h-100 w-100" + (props.loadingClassName ? props.loadingClassName : "")].join(" ")}
                        >
                            <FormBase name={props.data.name}
                                      onSubmit={form.handleSubmit}
                                      autoComplete="off"
                                      className="p-0 m-0 h-100 w-100"
                            >
                                {props.children(form, props.data.elements, props.buttons, props.renderProps, props.callbacks)}
                            </FormBase>
                        </BlockUi>
                    </Box>
                );
            }}
        </Formik>
    );
}

export const FormVertical: React.FunctionComponent<FormProps> = (props) => {
    return (
        <Form {...props}>
            {(form, elements, buttons, renderProps, callbacks): React.ReactElement => {
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

export const FormCard: React.FunctionComponent<FormProps> = (props) => {
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

                        <FormFieldsContainer className="card-body p-1 flex-wrap">
                            <FormFields form={form}
                                        elements={elements}
                                        renderProps={renderProps?.elements}
                                        callbacks={callbacks?.elements}
                            />
                        </FormFieldsContainer>

                        <Box className="card-footer p-1">
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
