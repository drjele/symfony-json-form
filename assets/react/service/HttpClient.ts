'use strict';

/** external libraries */
import $ from 'jquery';
import React from 'react';
import AlertContext, {AlertContextType} from '../context/AlertContext';
import UserContext from '../context/UserContext';
import {FormDataType} from '../form/Form';
import {NullableStringArrayType} from '../type/Array';
import {NullableNullaryType, NullaryType} from '../type/Function';
import {MapType, NullableMapType} from '../type/Map';
import {NullableStringType} from '../type/Scalar';

/** internal components */
import logger from './Logger';

type ResponseType = MapType & {
    success: boolean,
    data: NullableMapType,
    errors: NullableStringArrayType
}

export type OnSuccessType<T> = (response: T) => void;
export type OnCompleteType<T> = (response: T) => void;

export enum HttpRequestTypeEnum {
    GET = 'get',
    POST = 'post'
}

type HttpClientRequestType = JQuery.jqXHR;
type AjaxSettingsType = JQuery.AjaxSettings;

export class HttpRequest<RT = ResponseType> {
    private readonly url: string;
    private readonly onSuccess: OnSuccessType<RT>;
    private readonly type: HttpRequestTypeEnum;

    private data: MapType = {};

    private beforeSend: NullableNullaryType = null;
    private onComplete: OnCompleteType<MapType> = null;
    private onError: NullableNullaryType = null;

    private httpClientRequest: HttpClientRequestType = null;

    constructor(url: string, onSuccess: OnSuccessType<RT>, type: HttpRequestTypeEnum) {
        this.url = url;
        this.onSuccess = onSuccess;
        this.type = type;
    }

    getUrl = (): string => {
        return this.url;
    };

    getOnSuccess = (): OnSuccessType<RT> => {
        return this.onSuccess;
    };

    getType = (): HttpRequestTypeEnum => {
        return this.type;
    };

    getData = (): MapType => {
        return this.data;
    };

    setData = (data: MapType): HttpRequest<RT> => {
        this.data = data;

        return this;
    };

    getBeforeSend = (): NullableNullaryType => {
        return this.beforeSend;
    };

    setBeforeSend = (beforeSend: NullaryType): HttpRequest<RT> => {
        this.beforeSend = beforeSend;

        return this;
    };

    getOnComplete = (): OnCompleteType<MapType> => {
        return this.onComplete;
    };

    setOnComplete = (complete: OnCompleteType<MapType>): HttpRequest<RT> => {
        this.onComplete = complete;

        return this;
    };

    getOnError = (): NullableNullaryType => {
        return this.onError;
    };

    setOnError = (error: NullaryType): HttpRequest<RT> => {
        this.onError = error;

        return this;
    };

    setHttpClientRequest = (httpClientRequest: HttpClientRequestType): HttpRequest<RT> => {
        this.httpClientRequest = httpClientRequest;

        return this;
    };

    abort = (message?: string): boolean => {
        if (this.httpClientRequest === null) {
            return false;
        }

        message !== undefined && logger.info(`abort with message "${message}"`);

        this.httpClientRequest.abort();

        this.httpClientRequest = null;

        return true;
    };
}

declare global {
    interface Navigator {
        msSaveBlob?: (blob: unknown, defaultName?: string) => boolean;
    }
}

class HttpClient {
    private accessToken: NullableStringType;
    private alertContext: AlertContextType;

    constructor(
        accessToken: NullableStringType,
        alertContext: AlertContextType
    ) {
        this.accessToken = accessToken;
        this.alertContext = alertContext;
    }

    getFormDataFromResponse = (response: ResponseType): FormDataType => {
        const data = this.getDataFromResponse<{ form?: FormDataType }>(response);

        return data?.form ? data.form : null;
    };

    getDataFromResponse = <T>(response: ResponseType): T => {
        if (!response.success) {
            this.error(response.errors);

            return null;
        }

        return <T>response.data;
    };

    download = (httpRequest: HttpRequest): void => {
        httpRequest.abort();

        const ajax = $.ajax(
            {
                ...this.buildAjaxRequest(httpRequest),
                xhrFields: {
                    responseType: 'blob'
                },
                success: (blob, status, xhr) => {
                    let filename = '';
                    const disposition = xhr.getResponseHeader('Content-Disposition');

                    if (disposition && disposition.indexOf('attachment') !== -1) {
                        const filenameRegex = /filename[^;=\n]*=((["']).*?\2|[^;\n]*)/;
                        const matches = filenameRegex.exec(disposition);

                        if (matches != null && matches[1]) {
                            filename = matches[1].replace(/["']/g, '');
                        }
                    }

                    if (window.navigator.msSaveBlob !== undefined) {
                        window.navigator.msSaveBlob(blob, filename);
                    } else {
                        const url = window.URL || window.webkitURL;
                        const downloadUrl = url.createObjectURL(blob);

                        if (filename) {
                            const a = document.createElement('a');

                            if (a.download === undefined) {
                                window.location.href = downloadUrl;
                            } else {
                                a.href = downloadUrl;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                            }
                        } else {
                            window.location.href = downloadUrl;
                        }

                        setTimeout(
                            () => {
                                url.revokeObjectURL(downloadUrl);
                            },
                            100
                        );
                    }

                    httpRequest.getOnSuccess() && httpRequest.getOnSuccess()(blob);
                }
            }
        );

        httpRequest.setHttpClientRequest(ajax);
    };

    send = (httpRequest: HttpRequest<any>): void => {
        httpRequest.abort();

        const ajax = $.ajax(
            {
                ...this.buildAjaxRequest(httpRequest),
                dataType: 'json',
                contentType: 'application/json'
            }
        );

        httpRequest.setHttpClientRequest(ajax);
    };

    private buildAjaxRequest = (httpRequest: HttpRequest): AjaxSettingsType => {
        const data = httpRequest.getType().toLowerCase() === HttpRequestTypeEnum.GET ? httpRequest.getData() : JSON.stringify(httpRequest.getData());

        logger.info(httpRequest.getType(), httpRequest.getUrl(), data);

        const headers: MapType<string> = {};
        if (this.accessToken) {
            headers['X-AUTH-TOKEN'] = this.accessToken;
        }

        return {
            url: httpRequest.getUrl(),
            data: data,
            type: httpRequest.getType(),
            xhrFields: {
                withCredentials: true
            },
            headers: headers,
            crossDomain: true,
            beforeSend: () => {
                httpRequest.getBeforeSend() && httpRequest.getBeforeSend()();
            },
            success: (response) => {
                httpRequest.getOnSuccess() && httpRequest.getOnSuccess()(response);
            },
            error: (jqXhr, textStatus, errorThrown) => {
                if (textStatus === 'abort') {
                    logger.info('http request aborted');
                    return;
                }

                logger.error(
                    {
                        jqXhr: jqXhr,
                        textStatus: textStatus,
                        errorThrown: errorThrown
                    }
                );

                const errors = jqXhr.responseJSON?.errors ? jqXhr.responseJSON?.errors : 'invalid backend response received';

                this.error(errors);

                httpRequest.getOnError() && httpRequest.getOnError()();
            },
            complete: (jqXhr) => {
                httpRequest.getOnComplete() && httpRequest.getOnComplete()(
                    this.getXhrJsonResponse(jqXhr)
                );
            }
        };
    };

    private getXhrJsonResponse = (jqXhr: HttpClientRequestType): ResponseType => {
        return jqXhr && jqXhr.responseJSON ? jqXhr?.responseJSON : null;
    };

    private error = (errors: string | string[] | null): void => {
        if (errors === null) {
            return;
        }

        logger.error(errors);

        if (this.alertContext === null || this.alertContext.addError === undefined) {
            return;
        }

        if (Array.isArray(errors)) {
            errors.map((error: string) => this.alertContext.addError(error));

            return;
        }

        this.alertContext.addError(errors as string);
    };
}

export const useHttpClient = (): HttpClient => {
    const userContext = React.useContext(UserContext);
    const alertContext = React.useContext(AlertContext);

    return new HttpClient(
        userContext.user.accessToken,
        alertContext
    );
};
