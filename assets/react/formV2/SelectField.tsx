'use strict';

import {Autocomplete as AutocompleteBase, Box, Checkbox, Chip, InputLabel, ListItemText, ListSubheader, MenuItem, OutlinedInput, Select, TextField as TextFieldBase} from '@mui/material';
import {AutocompleteValue as AutocompleteValueBase} from '@mui/material/useAutocomplete';
import React from 'react';
import {useLanguageContext} from '../context/LanguageContext';
import Exception from '../exception/Exception';
import {StringArrayType} from '../type/Array';
import {MapType} from '../type/Map';
import {NullableStringType, StringNumberType} from '../type/Scalar';
import {ElementModeEnum, FieldType, FormControl, OnChangeAutocompleteType, SelectOptionsType} from './Form';

type SelectFieldProps = FieldType & {
    options: SelectOptionsType
    mode: ElementModeEnum
}

export const SelectField: React.FunctionComponent<SelectFieldProps> = (props) => {
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

    const languageContext = useLanguageContext();

    const processOptions = (options: SelectOptionsType): SelectFieldProcessedOptionsType => {
        let groupBy = false;
        const groupedOptions: SelectFieldOptionListType = [];
        const indexedOptions: MapType<string> = {};

        Object.entries(options).map(([id, optionData]) => {
            if (typeof optionData === 'string') {
                const translatedLabel = languageContext.translate(optionData);

                groupedOptions.push({id: id, label: translatedLabel, key: null});

                indexedOptions[id] = translatedLabel;
            } else {
                groupBy = true;

                Object.entries(optionData).map(([childId, label]) => {
                    const translatedLabel = languageContext.translate(label);

                    groupedOptions.push({id: childId, label: translatedLabel, key: id});

                    indexedOptions[childId] = translatedLabel;
                });
            }
        });

        return {
            groupBy: groupBy,
            grouped: groupedOptions,
            indexed: indexedOptions
        };
    };

    const processedOptions = processOptions(props.options);

    switch (props.mode) {
        case ElementModeEnum.SINGLE:
            let value: AutocompleteValueBase<SelectFieldOptionType, false, boolean, boolean>;
            if (props.value && processedOptions.indexed[props.value] !== undefined) {
                value = {
                    id: props.value,
                    label: processedOptions.indexed[props.value],
                    key: null
                };
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
            const labelId: string = props.name + 'Label';
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
            );

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
                                        <Chip key={value} label={<>{processedOptions.indexed[value]}</>} sx={{height: '22px'}}/>
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
};
