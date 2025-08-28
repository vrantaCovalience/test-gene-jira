import {
  SnackbarContent,
  Stack,
  type SnackbarContentProps,
} from "@mui/material";

interface ISnackbarProps {
  message?: SnackbarContentProps["message"];
}

export default function Snackbar({ message = "" }: ISnackbarProps) {
  return (
    <Stack className="infoSnackbar" spacing={2}>
      <SnackbarContent
        className="infoSnackbar__message"
        message={message}
        sx={{
          backgroundColor: "#1976d2",
          color: "white",
        }}
      />
    </Stack>
  );
}
