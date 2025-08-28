import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import "./RegenerateDialogBox.scss";

const RegenerateDialog = ({
  title,
  subTitle,
  tabNumber,
  open,
  handleNo,
  handleYes,
  handleClose,
}: {
  title: string;
  subTitle: string;
  tabNumber: number;
  open: boolean;
  handleNo: (arg0: boolean) => void;
  handleYes: (arg0: boolean) => void;
  handleClose: () => void;
}) => {
  return (
    <Dialog
      open={open}
      aria-labelledby="dialog-title"
      fullWidth
      style={{ overflow: "none" }}
    >
      <DialogTitle id="dialog-title">
        {title
          ? title
          : `Regenerate ${tabNumber ? "Acceptance Criteria" : "Description"}`}
        <IconButton
          aria-label="close"
          onClick={handleClose} // Function to handle closing the dialog
          edge="end"
          sx={{
            position: "absolute",
            right: 14,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {subTitle
          ? subTitle
          : `Would you like to provide specific details on how you would like to
      regenerate the ${tabNumber ? "Acceptance Criteria" : "Description"}?`}
      </DialogContent>
      <DialogActions className="dialog__button">
        <Button
          className="dialog__button--bg-light"
          onClick={() => handleNo(!title)}
        >
          No, Continue
        </Button>
        <Button
          className="dialog__button--bg-dark"
          onClick={() => handleYes(!title)}
        >
          Yes, Specify
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default RegenerateDialog;
