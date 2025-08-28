import { invoke } from "@forge/bridge";
import CachedIcon from "@mui/icons-material/Cached";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import type { ComponentProps } from "react";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { EditableWrapper } from "../../assets/styles/EditableWrapper.ts";
import { DisplayMessages, USER_CHOICE } from "../../constant/Constants.tsx";
import {
  extractFormattedTextFromHTML,
  formatWithBoldAcceptanceCriteria,
  formatWithBoldUserStory,
} from "../../utilities/helper.tsx";
import InfoSnackbar from "../../utilities/InfoSnackbar.tsx";
import FeedbackDetails from "../FeedbackDetails/FeedbackDetails.tsx";
import RegenerateDialog from "../RegenerateDialogBox/RegenerateDialogBox.tsx";
import "./GenerateDescription.scss";

const ParentComponent = (props: {
  workItem: any;
  userChoice: string;
  setUserChoice: React.Dispatch<React.SetStateAction<string>>;
  ticketDescription: string;
  ticketTitle: string;
  owner: string;
  workItemType: string;
  fieldValues: { [key: string]: any };
  token: string;
}) => {
  const theme = useTheme();
  const {
    workItem,
    userChoice,
    setUserChoice,
    ticketDescription,
    ticketTitle,
    owner,
    workItemType,
    fieldValues,
  } = props;
  // Define state for tab value
  const [value, setValue] = useState(
    userChoice === USER_CHOICE.USER_STORY ? 0 : 1
  );

  const [descriptionResponse, setDescriptionResponse] = useState<string>("");
  const [acceptanceCriteriaResponse, setAcceptanceCriteriaResponse] =
    useState<string>("");

  const [editableText, setEditableText] = useState({
    description: descriptionResponse,
    acceptanceCriteria: acceptanceCriteriaResponse,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [subTitle, setSubTitle] = useState<string>("");
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isManualIntervened, setIsManualIntervened] = useState<boolean>(false);
  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: React.SetStateAction<number>
  ) => {
    if (newValue) {
      setUserChoice(USER_CHOICE.ACCEPTANCE_CRITERIA);
    } else {
      setUserChoice(USER_CHOICE.USER_STORY);
    }
    setValue(newValue);
  };
  const [feedback, setFeedback] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [isRegenerated, setIsRegenerated] = useState<boolean>(false);

  const handleOpen = (title: string, subTitle: string, isLiked?: boolean) => {
    setTitle(title);
    setSubTitle(subTitle);
    setOpen(true);
    setIsLiked(isLiked ?? false);
  };

  const handleClose = (isRegenerate?: boolean) => {
    setOpen(false);
    if (isRegenerate) {
      reGenerateResponse();
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleRegenerate = (isRegenerate?: boolean) => {
    setIsRegenerated(isRegenerate ?? false);
    setShowRegenerate(!showRegenerate);
    setOpen(false);
  };

  const handleAcceptFeedback = (feedback: string, isRegenerated: boolean) => {
    setFeedback(feedback);
    setShowRegenerate(false);
    if (isRegenerated) {
      reGenerateResponse(feedback);
    } else {
      toast.success(DisplayMessages.SUBMITTED_MESSAGE);
    }
  };

  const handleRejectFeedback = () => {
    setShowRegenerate(false);
  };

  const handleAccept = async (
    fieldName: string,
    updatedValue: string,
    type: string
  ) => {
    try {
      await acceptResponse();
      // Update issue field via Forge API
      const context = (await invoke("getContext")) as unknown as {
        extension: { issue: { key: string } };
      };
      const issueKey = context.extension.issue.key;
      const updateData = {
        fields: {
          [fieldName]:
            type === "userStory"
              ? formatWithBoldUserStory(updatedValue)
              : formatWithBoldAcceptanceCriteria(updatedValue),
        },
      };
      await invoke("updateIssue", { issueKey, updateData });
      toast.success(DisplayMessages.WORK_ITEM_UPDATED);
    } catch (error: any) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error(DisplayMessages.UNKNOWN_ERROR);
      }
    }
  };

  useEffect(() => {
    const descriptionExists = fieldValues["customfield_10001"]; // Assuming custom field
    const acceptanceCriteriaExists = fieldValues["customfield_10002"];

    if (descriptionExists) {
      setDescriptionResponse(descriptionExists);
    } else {
      if (userChoice === USER_CHOICE.USER_STORY) {
        generateResponse("description");
      }
    }

    if (acceptanceCriteriaExists) {
      setAcceptanceCriteriaResponse(
        extractFormattedTextFromHTML(acceptanceCriteriaExists)
      );
    } else {
      if (userChoice === USER_CHOICE.ACCEPTANCE_CRITERIA) {
        generateResponse("acceptance_criteria");
      }
    }
  }, [userChoice]);

  useEffect(() => {
    setEditableText({
      description: descriptionResponse,
      acceptanceCriteria: acceptanceCriteriaResponse,
    });
  }, [descriptionResponse, acceptanceCriteriaResponse]);

  const reGenerateResponse = async (feedbackPresent?: string) => {
    setLoading(true);
    toast.success(DisplayMessages.REGENERATION_STARTED);

    const requestBody = {
      user_story_id: workItem.id,
      user_story_title: ticketTitle,
      user_story_description: ticketDescription,
      ...(feedbackPresent ? { user_preference: feedbackPresent } : {}),
    };

    const timeoutId = setTimeout(() => {
      toast.info(DisplayMessages.TAKING_LONGER, { autoClose: 2000 });
    }, 10000);

    try {
      const response = (await invoke("regenerate", requestBody)) as {
        generated_response: string;
      };
      if (userChoice === USER_CHOICE.USER_STORY) {
        setDescriptionResponse(response.generated_response);
      } else if (userChoice === USER_CHOICE.ACCEPTANCE_CRITERIA) {
        setAcceptanceCriteriaResponse(response.generated_response);
      }
      toast.success(DisplayMessages.REGENERATION_SUCCESSFUL);
      clearTimeout(timeoutId);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      clearTimeout(timeoutId);
      setLoading(false);
      toast.error(DisplayMessages.SOMETHING_WRONG);
    }
  };

  const generateResponse = async (responseType?: string) => {
    setLoading(true);
    const requestBody = {
      user_story_id: workItem.id,
      user_story_title: ticketTitle,
      user_story_description: ticketDescription,
    };

    const timeoutId = setTimeout(() => {
      toast.info(DisplayMessages.TAKING_LONGER, { autoClose: 2000 });
    }, 10000);

    try {
      const response = (await invoke("generate", requestBody)) as {
        generated_response: string;
      };
      if (responseType === "description") {
        setDescriptionResponse(response.generated_response);
      } else if (responseType === "acceptance_criteria") {
        setAcceptanceCriteriaResponse(response.generated_response);
      }
      clearTimeout(timeoutId);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      clearTimeout(timeoutId);
      setLoading(false);
      toast.error(DisplayMessages.SOMETHING_WRONG);
    }
  };

  const acceptResponse = async () => {
    setLoading(true);
    const requestBody = {
      user_story_id: workItem.id,
      user_story_title: ticketTitle,
      work_item_type: workItemType,
      ticket_owner: owner,
      is_manual_intervention: isManualIntervened,
      is_liked: isLiked,
      user_feedback: feedback,
    };
    const updatedBody = {
      ...requestBody,
      [value ? "acceptance_criteria" : "user_story_description"]: value
        ? editableText.acceptanceCriteria
        : editableText.description,
    };
    try {
      await invoke("feedback", updatedBody);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const BootstrapTooltip = styled(
    ({ className, ...props }: ComponentProps<typeof Tooltip>) => (
      <Tooltip {...props} arrow classes={{ popper: className }} />
    )
  )(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.common.black,
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.black,
    },
  }));

  function TabPanel(
    props: Readonly<{
      children: React.ReactNode;
      value: number;
      index: number;
      [x: string]: any;
    }>
  ) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index: number) {
    return {
      id: `full-width-tab-${index}`,
      "aria-controls": `full-width-tabpanel-${index}`,
    };
  }

  return (
    <>
      <InfoSnackbar />
      <div className="section">
        <Box className="section__left" sx={{ bgcolor: "background.paper" }}>
          {!showRegenerate ? (
            <>
              <AppBar position="static">
                <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="secondary"
                  textColor="inherit"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                >
                  <Tab label="Generate Description" {...a11yProps(0)} />
                  <Tab label="Generate Acceptance Criteria" {...a11yProps(1)} />
                </Tabs>
              </AppBar>
              {loading && <LinearProgress />}
              <TabPanel
                className="tabPanel"
                value={value}
                index={0}
                dir={theme.direction}
              >
                <EditableWrapper>
                  <TextField
                    disabled={loading}
                    id="filled-multiline-static"
                    label="Description*"
                    multiline
                    rows={12}
                    variant="filled"
                    defaultValue={editableText.description}
                    onBlur={(e) => {
                      setIsManualIntervened(true);
                      setEditableText((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));
                    }}
                  />
                </EditableWrapper>
              </TabPanel>
              <TabPanel value={value} index={1} dir={theme.direction}>
                <EditableWrapper>
                  <TextField
                    disabled={loading}
                    id="filled-multiline-static-AC"
                    label="Acceptance Criteria*"
                    multiline
                    rows={12}
                    variant="filled"
                    defaultValue={editableText.acceptanceCriteria}
                    onBlur={(e) =>
                      setEditableText((prev) => ({
                        ...prev,
                        acceptanceCriteria: e.target.value,
                      }))
                    }
                  />
                </EditableWrapper>
              </TabPanel>
              <div className="action-buttons">
                <Stack direction="row" spacing={2}>
                  <Button
                    className="action-buttons--bg"
                    variant="contained"
                    onClick={() => {
                      setUserChoice("");
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    disabled={loading}
                    variant="contained"
                    onClick={() => {
                      handleAccept(
                        userChoice === USER_CHOICE.USER_STORY
                          ? "customfield_10001"
                          : "customfield_10002",
                        userChoice === USER_CHOICE.USER_STORY
                          ? editableText.description
                          : editableText.acceptanceCriteria,
                        userChoice === USER_CHOICE.USER_STORY
                          ? "userStory"
                          : "acceptanceCriteria"
                      );
                    }}
                  >
                    Accept
                  </Button>
                </Stack>
              </div>
            </>
          ) : (
            <FeedbackDetails
              isRegenerated={isRegenerated}
              title={value}
              handleAccept={handleAcceptFeedback}
              handleReject={handleRejectFeedback}
            />
          )}
        </Box>
        <div className="section__right">
          {!showRegenerate && (
            <>
              <BootstrapTooltip title="Regenerate" placement="right">
                <span>
                  <IconButton
                    onClick={() => handleOpen("", "")}
                    disabled={loading}
                  >
                    <CachedIcon className="section__right__bg-regenerate icon" />
                  </IconButton>
                </span>
              </BootstrapTooltip>
              <RegenerateDialog
                title={title}
                subTitle={subTitle}
                open={open}
                handleNo={handleClose}
                handleYes={handleRegenerate}
                handleClose={handleCloseModal}
              />
              <BootstrapTooltip title="Dislike" placement="right">
                <span>
                  <IconButton
                    onClick={() =>
                      handleOpen(
                        "What went wrong?",
                        "Could you give more detail about it?"
                      )
                    }
                    disabled={loading}
                  >
                    <ThumbDownAltIcon className="section__right__bg-dislike icon" />
                  </IconButton>
                </span>
              </BootstrapTooltip>
              <BootstrapTooltip title="Like" placement="right">
                <span>
                  <IconButton
                    disabled={loading}
                    onClick={() =>
                      handleOpen(
                        "Submit feedback!!",
                        "What did you like? Could you please elaborate the feedback?",
                        true
                      )
                    }
                  >
                    <ThumbUpAltIcon className="section__right__bg-like icon" />
                  </IconButton>
                </span>
              </BootstrapTooltip>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ParentComponent;
