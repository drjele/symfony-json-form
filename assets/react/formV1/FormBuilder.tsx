"use strict";

/** external libraries */
import {Box} from "@mui/material";
import {FastField, FormikValues} from "formik";
import React from "react";

/** internal components */
import {MapType} from "../type/Map";
import {StringNumberType} from "../type/Scalar";
import {StringArrayType} from "../type/Array";
import {clone} from "../service/Uility";
import {ElementListType, ElementModeEnum, ElementType, ElementTypeEnum, FormCallbacksType, FormFieldCallbacksType, FormFieldRenderPropsType, FormFieldValueType, FormType, PrototypeCollectionType} from "./Types";
import {FormFields} from "./FormField";

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

    static renderPrototypeCollection = (
        name: string,
        elementClassName: string,
        values: FormFieldValueType,
        form: FormType,
        element: ElementType,
        parents: StringArrayType,
        renderProps: FormFieldRenderPropsType,
        callbacks: FormFieldCallbacksType
    ) => {
        const collectionElements: PrototypeCollectionType[] = [];
        values.map((v, index) => collectionElements.push({
            key: v[element.key],
            parents: [...parents, element.name, index]
        }));

        const elements = clone<ElementListType>(element.prototype);

        if (renderProps?.prototypeCollectionRender) {
            collectionElements.map((collectionElement) => {
                collectionElement.values = FormBuilder.getNestedValuesByPath(form.values, collectionElement.parents);
            });

            return renderProps.prototypeCollectionRender(
                collectionElements,
                elements,
                form,
                renderProps,
                callbacks
            );
        }

        return (
            <Box key={name + "PrototypeCollection"} className={"d-flex flex-column gap-1 w-100" + elementClassName}>
                {collectionElements.map((collectionElement) => (
                    <Box key={collectionElement.key} className="d-flex align-items-center gap-1">
                        <FastField name={name + collectionElement.key}>
                            {() => (
                                <FormFields form={form}
                                            elements={elements}
                                            parents={collectionElement.parents}
                                            renderProps={renderProps?.elements}
                                            callbacks={callbacks?.elements}
                                />
                            )}
                        </FastField>
                    </Box>
                ))}
            </Box>
        );
    }

    static sliceElements = (elements: ElementListType, names: StringArrayType): ElementListType => {
        const slice: ElementListType = {};

        names.map((name) => {
            const element = elements[name];

            slice[element.name] = element;

            delete elements[name];
        });

        return slice;
    }

    static getNestedValuesByPath = (values: FormikValues, path?: StringArrayType): FormikValues => {
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
}
