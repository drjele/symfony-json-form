'use strict';

import {Box} from '@mui/material';
import React from 'react';
import {default as Icon, NameType} from '../component/Icon';

type IconProps = {
    name: NameType
    className?: string
}

export const CheckboxIcon: React.FunctionComponent<IconProps> = (props) => {
    const className = ['checkbox-icon d-flex align-items-center justify-content-center'];
    if (props.className !== undefined) {
        className.push(props.className);
    }

    return (
        <Box className={className.join(' ')}>
            <Icon name={props.name}/>
        </Box>
    );
};

