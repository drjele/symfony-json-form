'use strict';

import {SelectChangeEvent} from '@mui/material/Select/SelectInput';
import {AutocompleteChangeDetails, AutocompleteChangeReason} from '@mui/material/useAutocomplete';
import {FormikProps, FormikValues} from 'formik';
import React from 'react';
import {HttpRequestTypeEnum} from '../service/HttpClient';
import {StringArrayType} from '../type/Array';
import {NullaryType} from '../type/Function';
import {MapType, NullableMapType} from '../type/Map';
import {BooleanRefType} from '../type/React';
import {StringNumberType} from '../type/Scalar';

export enum ElementTypeEnum {
    ARRAY = 'array',
    AUTOCOMPLETE = 'autocomplete',
    BOOL = 'bool',
    COLLECTION = 'collection',
    DATE = 'date',
    DATE_TIME = 'dateTime',
    FILE = 'file',
    HIDDEN = 'hidden',
    LABEL = 'label',
    NUMBER = 'number',
    PASSWORD = 'password',
    PROTOTYPE_COLLECTION = 'prototypeCollection',
    STRING = 'string'
}

export enum ElementModeEnum {
    SINGLE = 'single',
    MULTIPLE = 'multiple'
}

export type SelectOptionsType = {
    [id: StringNumberType]: (StringNumberType | { [id: StringNumberType]: StringNumberType })
}

export type FormFieldValueType = any;

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

export type OnChangeEventType = (React.SyntheticEvent | SelectChangeEvent<any> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) & { target: { value: unknown }, format?: any };
export type OnChangeValueType = any;
export type OnChangeCallbackType = (event: OnChangeEventType, value?: OnChangeValueType, reason?: any) => void;
export type OnChangeAutocompleteType<T> = (event: React.SyntheticEvent, value: any, reason?: AutocompleteChangeReason, details?: AutocompleteChangeDetails<T>) => void;

export type FocusType = {
    autoFocus?: BooleanRefType
    selectOnFocus?: boolean
}

export type PrototypeCollectionRenderType = (collectionElements: PrototypeCollectionType[], prototype: ElementListType, renderProps: FormFieldRenderPropsType, modifiers: PrototypeCollectionModifiersType) => React.ReactElement;

export type FormFieldRenderPropsType = FocusType & {
    formControlClassName?: string
    onChange?: (event: OnChangeEventType, value: OnChangeValueType) => void
    className?: string
    elements?: FormFieldsRenderPropsType
    /** @todo modify this to a custom component */
    prototypeCollectionRender?: PrototypeCollectionRenderType
    checkboxCheckedIcon?: React.ReactElement
    checkboxIcon?: React.ReactElement
}
export type FormFieldsRenderPropsType = {
    [name: string]: FormFieldRenderPropsType
}
export type FormRenderPropsType = {
    title?: string
    elements?: FormFieldsRenderPropsType
}

export type PrototypeCollectionModifiersType = {
    remove?: (key: StringNumberType) => void
    get?: <RT = unknown>(key: StringNumberType) => MapType<RT>
    set?: (key: StringNumberType, values: MapType) => void
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

export type FieldType = FocusType & {
    name: string
    label: string
    required: boolean
    readonly: boolean
    value: any
    onChange: OnChangeCallbackType
}

export enum ButtonTypeEnum {
    SUBMIT = 'submit',
    RESET = 'reset',
    CANCEL = 'cancel'
}

export type ButtonType = [React.ReactElement, string, NullaryType?];
export type ButtonListType = {
    [type in ButtonTypeEnum]?: ButtonType
}

export type PrototypeCollectionType = {
    key: StringNumberType
    parents: StringArrayType
    values?: FormikValues
}
