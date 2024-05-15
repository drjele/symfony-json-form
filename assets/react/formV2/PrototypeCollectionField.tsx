'use strict';

import {Box} from '@mui/material';
import {FieldArray, FormikValues} from 'formik';
import React from 'react';
import {clone} from '../service/Uility';
import {StringArrayType} from '../type/Array';
import {NullableNumberType} from '../type/Scalar';
import {ElementListType, ElementType, FormBuilder, FormContext, FormFieldRenderPropsType, FormFields, FormFieldValueType, PrototypeCollectionModifiersType, PrototypeCollectionType} from './Form';

type PrototypeCollectionDefaultFieldProps = {
    collectionElements: PrototypeCollectionType[]
    elements: ElementListType
    renderProps?: FormFieldRenderPropsType
}

export const PrototypeCollectionDefaultField: React.FunctionComponent<PrototypeCollectionDefaultFieldProps> = (props) => {
    return (
        <>
            {props.collectionElements.map((collectionElement) => (
                <Box key={collectionElement.key} className="d-flex align-items-center gap-1">
                    <FormFields elements={props.elements}
                                parents={collectionElement.parents}
                                renderProps={props.renderProps?.elements}
                    />
                </Box>
            ))}
        </>
    );
};

type PrototypeCollectionFieldProps = {
    name: string
    elementClassName: string
    value: FormFieldValueType
    element: ElementType
    parents: StringArrayType,
    renderProps: FormFieldRenderPropsType
}

const PrototypeCollectionField: React.FunctionComponent<PrototypeCollectionFieldProps> = (props) => {
    const formContext = React.useContext(FormContext);

    const renderPrototypeCollectionComponent = (modifiers: PrototypeCollectionModifiersType) => {
        const collectionElements: PrototypeCollectionType[] = [];
        props.value.map((v, index) => collectionElements.push({
            key: v[props.element.key],
            parents: [...props.parents, props.element.name, index]
        }));

        const elements = clone<ElementListType>(props.element.prototype);

        if (props.renderProps?.prototypeCollectionRender) {
            collectionElements.map((collectionElement) => {
                collectionElement.values = FormBuilder.getNestedValuesByPath(formContext.form.values, collectionElement.parents);
            });

            return props.renderProps.prototypeCollectionRender(
                collectionElements,
                elements,
                props.renderProps,
                modifiers
            );
        }

        return (
            <PrototypeCollectionDefaultField collectionElements={collectionElements}
                                             elements={elements}
                                             renderProps={props.renderProps}
            />
        );
    };

    const renderPrototypeCollection = (arrayHelpers) => {
        const findByKey = (key: unknown): [NullableNumberType, FormikValues | null] => {
            for (const [index, elementValues] of props.value.entries()) {
                if (elementValues[props.element.key] === key) {
                    return [index, elementValues];
                }
            }

            return [null, null];
        };

        const modifiers: PrototypeCollectionModifiersType = {};

        modifiers.remove = (key): void => {
            const [index] = findByKey(key);

            if (index === null) {
                return null;
            }

            arrayHelpers.remove(index);
        };

        modifiers.get = (key) => {
            const [_, elementValues] = findByKey(key);

            return elementValues;
        };

        modifiers.set = (key, values): void => {
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
        };

        return renderPrototypeCollectionComponent(modifiers);
    };

    return (
        <Box key={props.name + 'PrototypeCollection'} className={'d-flex flex-column gap-1 w-100' + props.elementClassName}>
            <FieldArray name={props.element.name}
                        render={renderPrototypeCollection}
            />
        </Box>
    );
};

export default PrototypeCollectionField;
