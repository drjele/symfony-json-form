'use strict';

import {StringNumberType} from './Scalar';

export type MapType<T = unknown> = {
    [key: StringNumberType]: T
}

export type NullableMapType<T = unknown> = MapType<T> | null;
