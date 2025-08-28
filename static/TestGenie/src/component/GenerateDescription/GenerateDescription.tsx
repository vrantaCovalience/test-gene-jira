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
import { WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking";
import * as SDK from "azure-devops-extension-sdk";
import PropTypes from "prop-types";
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
  const theme = useTheme(); // Theme hook for MUI, can be used for direction
  const {
    workItem,
    userChoice,
    setUserChoice,
    ticketDescription,
    ticketTitle,
    owner,
    workItemType,
    fieldValues,
    token,
  } = props;
  // Define state for tab value
  const [value, setValue] = useState(
    userChoice === USER_CHOICE.USER_STORY ? 0 : 1
  ); // Controls the active tab

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
    setValue(newValue); // Update the selected tab when clicked
  };
  const [feedback, setFeedback] = useState<string>("");
  const [open, setOpen] = useState(false); // Control for RegenerateDialog open/close
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [isRegenerated, setIsRegenerated] = useState<boolean>(false);

  const handleOpen = (title: string, subTitle: string, isLiked?: boolean) => {
    setTitle(title);
    setSubTitle(subTitle);
    setOpen(true); // Open the dialog
    setIsLiked(isLiked ?? false);
  };

  const handleClose = (isRegenerate?: boolean) => {
    setOpen(false); // Close the dialog
    if (isRegenerate) {
      //don't send feedback
      reGenerateResponse();
    }
  };

  const handleCloseModal = () => {
    setOpen(false); // Close the dialog
  };

  const handleRegenerate = (isRegenerate?: boolean) => {
    setIsRegenerated(isRegenerate ?? false);
    setShowRegenerate(!showRegenerate);
    setOpen(false); // Close the dialog
  };

  const handleAcceptFeedback = (feedback: string, isRegenerated: boolean) => {
    setFeedback(feedback);
    //when user clicks on send feedback
    setShowRegenerate(false);
    if (isRegenerated) {
      // send feedback
      reGenerateResponse(feedback);
      //  call api dont show toast here
      // update description as well
    } else {
      toast.success(DisplayMessages.SUBMITTED_MESSAGE);
    }
  };

  const handleRejectFeedback = () => {
    //when user clicks on dismiss feedback
    setShowRegenerate(false);
  };

  const handleAccept = async (
    fieldName: string,
    updatedValue: string,
    type: string
  ) => {
    try {
      await acceptResponse();
      const workItemFormService: any = await SDK.getService(
        WorkItemTrackingServiceIds.WorkItemFormService
      );

      await workItemFormService.setFieldValue(
        fieldName,
        type === "userStory"
          ? formatWithBoldUserStory(updatedValue)
          : formatWithBoldAcceptanceCriteria(updatedValue)
      );
      // Save the changes
      await workItemFormService.save();
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
    const descriptionExists = fieldValues["Custom.AIGeneratedDescription"];
    const acceptanceCriteriaExists =
      fieldValues["Microsoft.VSTS.Common.AcceptanceCriteria"];

    // If description exists, set it in the state
    if (descriptionExists) {
      setDescriptionResponse(descriptionExists);
    } else {
      // If description is missing and user choice is for USER_STORY, fetch it
      if (userChoice === USER_CHOICE.USER_STORY) {
        generateResponse("description");
      }
    }

    // If acceptance criteria exists, set it in the state
    if (acceptanceCriteriaExists) {
      setAcceptanceCriteriaResponse(
        extractFormattedTextFromHTML(acceptanceCriteriaExists)
      );
    } else {
      // If acceptance criteria is missing and user choice is for ACCEPTANCE_CRITERIA, fetch it
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

    // Set timeout to notify user if the request is taking too long
    const timeoutId = setTimeout(() => {
      toast.info(DisplayMessages.TAKING_LONGER, { autoClose: 2000 });
    }, 10000); // 10 seconds

    try {
      const url: string = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL + "regenerate"
        : "";

      let response;
      let responseType;

      // Determine which response to regenerate based on user choice
      if (userChoice === USER_CHOICE.USER_STORY) {
        responseType = "description";
      } else if (userChoice === USER_CHOICE.ACCEPTANCE_CRITERIA) {
        responseType = "acceptance_criteria";
      }

      if (responseType) {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            project_unique_key: token,
          },
          body: JSON.stringify({
            ...requestBody,
            response_type: responseType,
            generated_response:
              responseType === "description"
                ? descriptionResponse
                : acceptanceCriteriaResponse,
          }),
        });

        const responseData = await response.json();

        // Check if the response is successful
        if (response.ok) {
          if (responseType === "description") {
            setDescriptionResponse(responseData.generated_response);
          } else if (responseType === "acceptance_criteria") {
            setAcceptanceCriteriaResponse(responseData.generated_response);
          }
          toast.success(DisplayMessages.REGENERATION_SUCCESSFUL);
        } else {
          toast.error(DisplayMessages.SOMETHING_WRONG);
        }
      }
      clearTimeout(timeoutId); // Clear the timeout if the request completes in time
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      clearTimeout(timeoutId); // Clear the timeout in case of error
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

    // Set timeout to notify user if the request is taking too long
    const timeoutId = setTimeout(() => {
      toast.info(DisplayMessages.TAKING_LONGER, { autoClose: 2000 });
    }, 10000); // 10 seconds

    try {
      const url: string = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL + "generate"
        : "";

      let descriptionResponse, acceptanceCriteriaResponse;

      // Conditionally fetch based on responseType
      if (!responseType || responseType === "description") {
        descriptionResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            project_unique_key: token,
          },
          body: JSON.stringify({
            ...requestBody,
            response_type: "description",
          }),
        });
      }

      if (!responseType || responseType === "acceptance_criteria") {
        acceptanceCriteriaResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            project_unique_key: token,
          },
          body: JSON.stringify({
            ...requestBody,
            response_type: "acceptance_criteria",
          }),
        });
      }

      // Await responses and update state accordingly
      const descriptionData = descriptionResponse
        ? await descriptionResponse.json()
        : null;
      const acceptanceCriteriaData = acceptanceCriteriaResponse
        ? await acceptanceCriteriaResponse.json()
        : null;

      if (descriptionResponse?.ok) {
        setDescriptionResponse(descriptionData.generated_response);
      }

      if (acceptanceCriteriaResponse?.ok) {
        setAcceptanceCriteriaResponse(
          acceptanceCriteriaData.generated_response
        );
      }

      clearTimeout(timeoutId); // Clear the timeout if the request completes in time
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      clearTimeout(timeoutId); // Clear the timeout in case of error
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
    let updatedBody = {
      ...requestBody,
      [value ? "acceptance_criteria" : "user_story_description"]: value
        ? editableText.acceptanceCriteria
        : editableText.description,
    };
    try {
      const url: string = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL + "feedback"
        : "";
      const acceptResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          project_unique_key: token,
        },
        body: JSON.stringify(updatedBody),
      });
      const acceptResponseFormatted = await acceptResponse.json();
      console.log(acceptResponseFormatted);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const BootstrapTooltip = styled(
    ({ className, ...props }: React.ComponentProps<typeof Tooltip>) => (
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
                  value={value} // Control the selected tab
                  onChange={handleChange} // Update the selected tab when clicked
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
                      // setUserChoice("");
                      handleAccept(
                        userChoice === USER_CHOICE.USER_STORY
                          ? "Custom.AIGeneratedDescription"
                          : "Microsoft.VSTS.Common.AcceptanceCriteria",
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
                tabNumber={value}
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
