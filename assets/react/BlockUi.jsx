"use strict";

/** external libraries */
import React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const BlockUi = ({open, onClick, children}) => {
    return (
        <div style={{"position": "relative"}}>
            <Backdrop
                sx={{"color": "#FFFFFF", "zIndex": (theme) => theme.zIndex.drawer + 1, "position": "absolute"}}
                open={open}
                onClick={onClick ? onClick : null}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
            {children}
        </div>
    );
}

export default BlockUi;
