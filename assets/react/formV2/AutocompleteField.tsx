'use strict';

import {Autocomplete as AutocompleteBase, TextField as TextFieldBase} from '@mui/material';
import {AutocompleteInputChangeReason, AutocompleteValue as AutocompleteValueBase} from '@mui/material/useAutocomplete';
import React from 'react';
import {useUrlGeneratorContext} from '../context/UrlGeneratorContext';
import {HttpRequest, HttpRequestTypeEnum, useHttpClient} from '../service/HttpClient';
import {NullableStringType} from '../type/Scalar';
import {ElementModeEnum, FieldType, OnChangeAutocompleteType, OnChangeEventType} from './Form';

type AutocompleteFieldProps = FieldType & {
    mode: ElementModeEnum
    route: string
    routeParameter: string
}

export const AutocompleteField: React.FunctionComponent<AutocompleteFieldProps> = (props) => {
    type AutocompleteFieldOptionType = {
        id: number
        label: string
    }

    type AutocompleteFieldOptionListType = AutocompleteFieldOptionType[];

    type AutocompleteValue = AutocompleteValueBase<AutocompleteFieldOptionType | AutocompleteFieldOptionType[], boolean, boolean, boolean>;

    const multiple: boolean = props.mode === ElementModeEnum.MULTIPLE;

    const initialValue: AutocompleteValue = multiple ? [] : null;

    const [value, setValue] = React.useState<AutocompleteValue>(initialValue);
    const [inputValue, setInputValue] = React.useState<string>('');
    const [options, setOptions] = React.useState<AutocompleteFieldOptionListType>([]);

    const httpRequest = React.useRef<HttpRequest>(null);

    const urlGenerator = useUrlGeneratorContext();
    const httpClient = useHttpClient();

    const onInputChange = (event: React.SyntheticEvent, value: NullableStringType, reason: AutocompleteInputChangeReason): void => {
        setInputValue(value);

        httpRequest.current?.abort();

        if (reason === 'reset' && multiple == true) {
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
    };

    React.useEffect(() => {
        if (props.value === null || props.value.length === 0) {
            setValue(initialValue);
            setInputValue('');
            setOptions([]);
        }
    }, [props.value]);

    const onChange: OnChangeAutocompleteType<AutocompleteFieldOptionType> = (event, value) => {
        setValue(value);
        props.onChange(event as OnChangeEventType, value);
    };

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
            getOptionLabel={(option: AutocompleteFieldOptionType) => option ? option.label : ''}
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
};
