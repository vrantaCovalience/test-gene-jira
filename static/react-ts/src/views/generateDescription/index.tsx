/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import CachedIcon from "@mui/icons-material/Cached";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";

import "./GenerateDescription.scss";

import {
  AppBar,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  styled,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  tooltipClasses,
  Typography,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box/Box";
import { useState } from "react";
import { EditableWrapper, FeedbackDetails, Snackbar } from "../../component";
import RegenerateDialog from "../../component/regenerateDialogBox";
import { USER_CHOICE } from "../../constants";

export default function GenerateDescription(props: {
  userChoice: string;
  setUserChoice: React.Dispatch<
    React.SetStateAction<(typeof USER_CHOICE)[keyof typeof USER_CHOICE] | "">
  >;
}) {
  const { userChoice, setUserChoice } = props;
  const theme = useTheme(); // Theme hook for MUI, can be used for direction
  const [value, setValue] = useState(
    userChoice === USER_CHOICE.DESCRIPTION ? 0 : 1
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
      setUserChoice(USER_CHOICE.DESCRIPTION);
    }
    setValue(newValue); // Update the selected tab when clicked
  };
  const [feedback, setFeedback] = useState<string>("");
  const [open, setOpen] = useState(false); // Control for RegenerateDialog open/close
  const [showRegenerate, setShowRegenerate] = useState(false);
  const [isRegenerated, setIsRegenerated] = useState<boolean>(false);

  // major functions

  const handleClose = (isRegenerate?: boolean) => {
    setOpen(false); // Close the dialog
    if (isRegenerate) {
      //don't send feedback
      // reGenerateResponse();
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
      // reGenerateResponse(feedback);
      //  call api dont show toast here
      // update description as well
    } else {
      // toast.success(DisplayMessages.SUBMITTED_MESSAGE);
    }
  };

  const handleRejectFeedback = () => {
    //when user clicks on dismiss feedback
    setShowRegenerate(false);
  };

  // bootstrap and styling functions

  const BootstrapTooltip = styled(
    ({ className, ...props }: React.ComponentProps<typeof Tooltip>) => (
      <Tooltip {...props} arrow classes={{ popper: className }} />
    )
  )(({ theme }: any) => ({
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

  function a11yProps(index: number) {
    return {
      id: `full-width-tab-${index}`,
      "aria-controls": `full-width-tabpanel-${index}`,
    };
  }

  return (
    <>
      <Snackbar message="I will help you write clear, actionable description and detailed acceptance criteria." />
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
                  <Button disabled={loading} variant="contained">
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
                    // onClick={() => handleOpen("", "")}
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
                  <IconButton disabled={loading}>
                    <ThumbDownAltIcon className="section__right__bg-dislike icon" />
                  </IconButton>
                </span>
              </BootstrapTooltip>
              <BootstrapTooltip title="Like" placement="right">
                <span>
                  <IconButton disabled={loading}>
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
}
