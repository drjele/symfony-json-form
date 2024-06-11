'use strict';

import '../../../css/shared/blockui.scss';
import {Box} from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

/** external libraries */
import React from 'react';

/** internal components */
import {StringArrayType} from '../type/Array';

type BlockUiProps = React.PropsWithChildren & {
    open: boolean
    fixed?: boolean
    className?: string
}

const BlockUi: React.FunctionComponent<BlockUiProps> = (props) => {
    const position: string = (props.fixed === undefined ? false : props.fixed) ? 'fixed' : 'absolute';

    const classNames: StringArrayType = ['blockui-container'];
    if (props.className !== undefined) {
        classNames.push(props.className);
    }

    return (
        <Box className={classNames.join(' ')}>
            <Backdrop sx={{color: '#FFFFFF', zIndex: (theme) => theme.zIndex.drawer + 1, position: position}}
                      open={props.open}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>

            <Box className="h-100 w-100">{props.children}</Box>
        </Box>
    );
};

export default BlockUi;
