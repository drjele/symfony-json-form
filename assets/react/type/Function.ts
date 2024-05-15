'use strict';

export type NullaryType<T = void> = () => T;
export type NullableNullaryType = NullaryType | null;

export type SetLoadingType = (loading: boolean) => void
