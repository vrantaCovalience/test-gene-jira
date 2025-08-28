import * as React from "react";
import Snackbar from "@mui/material/Snackbar";

const AutoHideSnackbar = (props: {
  open: boolean;
  message: string;
  onClose: (event: React.SyntheticEvent | Event, reason?: any) => void;
}) => {
  const { open, message, onClose } = props;
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      message={message}
    />
  );
};

export default AutoHideSnackbar;
