'use strict';

import '../../../css/shared/form.scss';
import {Box} from '@mui/material';
import {Form as FormBase, Formik, FormikValues, useFormikContext} from 'formik';
import React from 'react';
import BlockUi from '../component/BlockUi';
import {useUrlGeneratorContext} from '../context/UrlGeneratorContext';
import {HttpRequest, useHttpClient} from '../service/HttpClient';
import {StringArrayType} from '../type/Array';
import {NullaryType, SetLoadingType} from '../type/Function';
import {MapType} from '../type/Map';
import {BooleanRefType} from '../type/React';
import {StringNumberType} from '../type/Scalar';
import {FormButton} from './FormButton';
import {FormFields, FormFieldsContainer} from './FormField';
import {ButtonListType, ElementListType, ElementModeEnum, ElementTypeEnum, FormDataType, FormRenderPropsType, FormType, OnSubmitFailureType, OnSubmitSuccessType} from './Types';

export * from './Types';
export * from './AutocompleteField';
export * from './TextField';
export * from './SelectField';
export * from './DateField';
export * from './DateTimeField';
export * from './FormField';
export * from './FormButton';
export * from './CheckboxField';
export * from './PrototypeCollectionField';

export class FormBuilder {
    static computeDateFormat = (elementFormat: string): string => {
        let format = 'YYYY-MM-DD';

        switch (elementFormat) {
            case 'd-m-Y':
                format = 'DD-MM-YYYY';
                break;
        }

        return format;
    };

    static computeDateTimeFormat = (elementFormat: string): string => {
        let format = 'YYYY-MM-DD HH:mm';

        switch (elementFormat) {
            case 'd-m-Y H:i':
                format = 'DD-MM-YYYY HH:mm';
                break;
        }

        return format;
    };

    static computeInitialValues = (elements: ElementListType): MapType => {
        const initialValues = {};

        Object.entries(elements).map(([name, element]) => {
                switch (element.type) {
                    case ElementTypeEnum.ARRAY:
                        switch (element.mode) {
                            case ElementModeEnum.SINGLE:
                                const value = element.value ? element.value : null;

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
                        initialValues[name] = element.value ? element.value : '';
                }
            }
        );

        return initialValues;
    };

    static createPrototypeCollectionElementValues = (keyName: string, keyValue: StringNumberType, values: MapType): MapType => {
        return {
            [keyName]: keyValue,
            ...values
        };
    };

    static sliceElements = (elements: ElementListType, names: StringArrayType): ElementListType => {
        const slice: ElementListType = {};

        names.map((name) => {
            const element = elements[name];

            slice[element.name] = element;

            delete elements[name];
        });

        return slice;
    };

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
    };
}

type FormContextType = {
    form: FormType
    elements: ElementListType
    buttons: ButtonListType
    renderProps?: FormRenderPropsType
}

export const FormContext = React.createContext<FormContextType>({} as FormContextType);

const FormContextProvider: React.FunctionComponent<React.PropsWithChildren & FormContextType> = (props) => {
    const context = {
        form: props.form,
        elements: props.elements,
        buttons: props.buttons,
        renderProps: props.renderProps
    };

    return (
        <FormContext.Provider value={context}>
            {props.children}
        </FormContext.Provider>
    );
};

type SharedFormProps = React.PropsWithChildren & {
    buttons: ButtonListType
    renderProps?: FormRenderPropsType
    triggerSubmit?: BooleanRefType
    triggerReset?: BooleanRefType
    containerClassName?: string
    loadingClassName?: string
}

type InnerFormProps = SharedFormProps & {
    elements: ElementListType
    name: string
    loading: boolean
}

const InnerForm: React.FunctionComponent<InnerFormProps> = (props) => {
    const form = useFormikContext<FormType>();

    React.useEffect(() => {
            if (props.triggerSubmit?.current === true) {
                props.triggerSubmit.current = false;
                form.submitForm();
            }

            if (props.triggerReset?.current === true) {
                props.triggerReset.current = false;
                form.resetForm();
            }
        }, [props.triggerSubmit?.current, props.triggerReset?.current]
    );

    const classNames = ['form-container'];
    if (props.containerClassName !== undefined) {
        classNames.push(props.containerClassName);
    }

    return (
        <FormContextProvider form={form}
                             elements={props.elements}
                             buttons={props.buttons}
                             renderProps={props.renderProps}
        >
            <Box className={classNames.join(' ')}>
                <BlockUi open={props.loading}
                         className={['h-100 w-100' + (props.loadingClassName ? props.loadingClassName : '')].join(' ')}
                >
                    <FormBase name={props.name}
                              onSubmit={form.handleSubmit}
                              autoComplete="off"
                              className="p-0 m-0 h-100 w-100"
                    >
                        {props.children}
                    </FormBase>
                </BlockUi>
            </Box>
        </FormContextProvider>
    );
};

type FormProps = SharedFormProps & {
    data: FormDataType
    onSubmitSuccess?: OnSubmitSuccessType
    onSubmitFailure?: OnSubmitFailureType
    beforeSend?: NullaryType
    onComplete?: NullaryType
    blockOnSubmit?: boolean
    staticData?: MapType
    enableReinitialize?: boolean
}

export const Form: React.FunctionComponent<FormProps> = (props) => {
    const blockOnSubmit: boolean = props.blockOnSubmit === undefined ? true : props.blockOnSubmit;

    const enableReinitialize: boolean = props.enableReinitialize === undefined ? false : props.enableReinitialize;

    const [loading, setLoadingState] = React.useState<boolean>(false);
    const setLoading: SetLoadingType = (loading) => blockOnSubmit === true && setLoadingState(loading);

    const urlGenerator = useUrlGeneratorContext();
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
    };

    return (
        <Formik initialValues={FormBuilder.computeInitialValues(props.data.elements)}
                onSubmit={onSubmit}
                enableReinitialize={enableReinitialize}
        >

            <InnerForm elements={props.data.elements}
                       name={props.data.name}
                       loading={loading}
                       buttons={props.buttons}
                       triggerSubmit={props.triggerSubmit}
                       triggerReset={props.triggerReset}
                       containerClassName={props.containerClassName}
                       loadingClassName={props.loadingClassName}
                       renderProps={props.renderProps}
            >
                {props.children}
            </InnerForm>
        </Formik>
    );
};

const FormVerticalInner: React.FunctionComponent = () => {
    const formContext = React.useContext(FormContext);

    return (
        <Box className="d-flex flex-column gap-1">
            <FormFieldsContainer className="flex-column">
                <FormFields elements={formContext.elements}
                            renderProps={formContext.renderProps?.elements}
                />
            </FormFieldsContainer>

            <FormButton buttons={formContext.buttons}/>
        </Box>
    );
};

export const FormVertical: React.FunctionComponent<FormProps> = (props) => {
    return (
        <Form {...props}>
            <FormVerticalInner/>
        </Form>
    );
};

const FormCardInner: React.FunctionComponent = () => {
    const formContext = React.useContext(FormContext);

    return (
        <Box className="card">
            {formContext.renderProps?.title !== undefined &&
                <Box className="card-header">{formContext.renderProps?.title}</Box>
            }

            <FormFieldsContainer className="card-body flex-wrap p-1">
                <FormFields elements={formContext.elements}
                            renderProps={formContext.renderProps?.elements}
                />
            </FormFieldsContainer>

            <Box className="card-footer p-1">
                <FormButton buttons={formContext.buttons}/>
            </Box>
        </Box>
    );
};

export const FormCard: React.FunctionComponent<FormProps> = (props) => {
    return (
        <Form containerClassName="card-form-container"
              loadingClassName="overflow-hidden border-radius-1"
              {...props}
        >
            <FormCardInner/>
        </Form>
    );
};
