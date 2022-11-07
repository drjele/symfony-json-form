"use strict";

import "./css/blockui.scss";

/** external libraries */
import React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import {Box} from "@mui/material";

const BlockUi = ({children, open, fixed, className}) => {
    if (fixed === undefined) {
        fixed = false;
    }

    const position = fixed === true ? "fixed" : "absolute";

    const classNames = ["blockui-container"];
    if (className !== undefined) {
        classNames.push(className);
    }

    return (
        <Box className={classNames.join(" ")}>
            <Backdrop sx={{"color": "#FFFFFF", "zIndex": (theme) => theme.zIndex.drawer + 1, "position": position}}
                      open={open}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>

            <Box className="h-100 w-100">{children}</Box>
        </Box>
    );
}

export default BlockUi;
