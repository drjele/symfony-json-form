"use strict";

import "../css/form.scss";

/** external libraries */
import React from "react";
import {Form as FormBase, Formik, useFormikContext} from "formik";
import {Box} from "@mui/material";

/** internal components */
import BlockUi from "../component/BlockUi";
import useUrlGenerator from "../service/UrlGenerator";
import {HttpRequest, useHttpClient} from "../service/HttpClient";
import {MapType} from "../type/Map";
import {NullaryType, SetLoadingType} from "../type/Function";
import {BooleanRefType} from "../type/React";
import {ButtonListType, ElementListType, FormCallbacksType, FormDataType, FormRenderPropsType, FormType, OnSubmitFailureType, OnSubmitSuccessType} from "./Types";
import {FormBuilder} from "./FormBuilder";
import {FormFields, FormFieldsContainer} from "./FormField";
import {FormButtons} from "./FormButtons";

export * from "./Types";
export * from "./FormBuilder";
export * from "./AutocompleteField";
export * from "./TextField";
export * from "./SelectField";
export * from "./DateField";
export * from "./DateTimeField";
export * from "./FormField";
export * from "./FormControl";
export * from "./FormButtons";

type FormContextType = {
    form: FormType
    elements: ElementListType
    buttons: ButtonListType
    renderProps?: FormRenderPropsType
    callbacks?: FormCallbacksType
}

export const FormContext = React.createContext<FormContextType>({} as FormContextType);

const FormContextProvider: React.FunctionComponent<React.PropsWithChildren & FormContextType> = (props) => {
    const context = {
        form: props.form,
        elements: props.elements,
        buttons: props.buttons,
        renderProps: props.renderProps,
        callbacks: props.callbacks
    };

    return (
        <FormContext.Provider value={context}>
            {props.children}
        </FormContext.Provider>
    );
}

type SharedFormProps = React.PropsWithChildren & {
    buttons: ButtonListType
    renderProps?: FormRenderPropsType
    callbacks?: FormCallbacksType
    triggerSubmit?: BooleanRefType
    triggerReset?: BooleanRefType
    containerClassName?: string
    loadingClassName?: string
}

export type FormChildrenType = (form: FormType, elements: ElementListType, buttons: ButtonListType, renderProps: FormRenderPropsType, callbacks: FormCallbacksType) => React.ReactElement;

type InnerFormProps = SharedFormProps & {
    elements: ElementListType
    name: string
    loading: boolean
}

const InnerForm: React.FunctionComponent<InnerFormProps> = (props) => {
    const form = useFormikContext<FormType>();

    FormBuilder.initCallbacks(props.callbacks);

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
        <FormContextProvider form={form}
                             elements={props.elements}
                             buttons={props.buttons}
                             renderProps={props.renderProps}
                             callbacks={props.callbacks}
        >
            <Box className={classNames.join(" ")}>
                <BlockUi open={props.loading}
                         className={["h-100 w-100" + (props.loadingClassName ? props.loadingClassName : "")].join(" ")}
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
}

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

            <InnerForm elements={props.data.elements}
                       name={props.data.name}
                       loading={loading}
                       buttons={props.buttons}
                       triggerSubmit={props.triggerSubmit}
                       triggerReset={props.triggerReset}
                       containerClassName={props.containerClassName}
                       loadingClassName={props.loadingClassName}
                       renderProps={props.renderProps}
                       callbacks={props.callbacks}
            >
                {props.children}
            </InnerForm>
        </Formik>
    );
}

const FormVerticalInner: React.FunctionComponent = () => {
    const formContext = React.useContext(FormContext);

    return (
        <Box className="d-flex flex-column gap-1">
            <FormFieldsContainer className="flex-column">
                <FormFields form={formContext.form}
                            elements={formContext.elements}
                            renderProps={formContext.renderProps?.elements}
                            callbacks={formContext.callbacks?.elements}
                />
            </FormFieldsContainer>

            <FormButtons form={formContext.form}
                         buttons={formContext.buttons}
            />
        </Box>
    );
}

export const FormVertical: React.FunctionComponent<FormProps> = (props) => {
    return (
        <Form {...props}>
            <FormVerticalInner/>
        </Form>
    );
}

const FormCardInner: React.FunctionComponent = () => {
    const formContext = React.useContext(FormContext);

    return (
        <Box className="card">
            {formContext.renderProps?.title !== undefined &&
                <Box className="card-header">{formContext.renderProps?.title}</Box>
            }

            <FormFieldsContainer className="card-body flex-wrap p-1">
                <FormFields form={formContext.form}
                            elements={formContext.elements}
                            renderProps={formContext.renderProps?.elements}
                            callbacks={formContext.callbacks?.elements}
                />
            </FormFieldsContainer>

            <Box className="card-footer p-1">
                <FormButtons form={formContext.form}
                             buttons={formContext.buttons}
                />
            </Box>
        </Box>
    );
}

export const FormCard: React.FunctionComponent<FormProps> = (props) => {
    return (
        <Form containerClassName="card-form-container"
              loadingClassName="overflow-hidden border-radius-1"
              {...props}
        >
            <FormCardInner/>
        </Form>
    );
}
