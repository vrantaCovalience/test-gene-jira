import * as React from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import "./FeedbackDetails.scss";
import { useState } from "react";

export default function MultilineTextFields({
  isRegenerated,
  title,
  handleAccept,
  handleReject,
}: Readonly<{
  isRegenerated: boolean;
  title: number;
  handleAccept: (feedback: string, isRegenerated: boolean) => void;
  handleReject: (isRegenerated: boolean) => void;
}>) {
  const [feedbackText, setFeedbackText] = useState("");
  return (
    <>
      <Box
        component="form"
        sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
        noValidate
        autoComplete="off"
      >
        <div>
          <TextField
            id="filled-multiline-static-AC"
            label={
              isRegenerated
                ? `Please tell, how would you like to regenerate the ${
                    title ? "Acceptance Criteria" : "Description"
                  }`
                : "Please provide your feedback."
            }
            multiline
            rows={12}
            variant="filled"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </div>
      </Box>
      <div className="action-buttons feedback-buttons">
        <Stack direction="row" spacing={2}>
          <Button
            className="action-buttons--bg"
            variant="contained"
            onClick={() => {
              handleReject(isRegenerated);
            }}
          >
            Dismiss
          </Button>
          <Button
            className="feedback-buttons--bg"
            disabled={feedbackText.trim() === ""}
            variant="contained"
            onClick={() => handleAccept(feedbackText, isRegenerated)}
          >
            Send
          </Button>
        </Stack>
      </div>
    </>
  );
}
