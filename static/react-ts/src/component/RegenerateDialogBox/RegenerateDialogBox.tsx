import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface RegenerateDialogProps {
  title: string;
  subTitle: string;
  open: boolean;
  handleNo: (isRegenerate?: boolean) => void;
  handleYes: (isRegenerate?: boolean) => void;
  handleClose: () => void;
}

export default function RegenerateDialog({
  title,
  subTitle,
  open,
  handleNo,
  handleYes,
  handleClose,
}: RegenerateDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {subTitle}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleNo(false)}>No</Button>
        <Button onClick={() => handleYes(true)} autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
