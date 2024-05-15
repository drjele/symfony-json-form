'use strict';

import React from 'react';

export type RefType<T> = React.MutableRefObject<T>;

export type BooleanRefType = RefType<boolean>;
export type NullableBooleanRefType = BooleanRefType | null;
