import * as React from "react";
import Stack from "@mui/material/Stack";
import SnackbarContent from "@mui/material/SnackbarContent";

export default function LongTextSnackbar() {
  return (
    <Stack className="infoSnackbar" spacing={2}>
      <SnackbarContent
        className="infoSnackbar__message"
        message="I will help you write clear, actionable description and detailed acceptance criteria."
      />
    </Stack>
  );
}
