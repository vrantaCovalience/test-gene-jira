import { invoke } from "@forge/bridge";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./assets/styles/global.scss";
import GenerateDescription from "./component/GenerateDescription/GenerateDescription.tsx";
import { DisplayMessages, USER_CHOICE } from "./constant/Constants.tsx";
import type { FieldValues, WorkItem } from "./types/index.tsx";
import { extractTextFromHTML } from "./utilities/helper.tsx";
import InfoSnackbar from "./utilities/InfoSnackbar.tsx";
import Loader from "./utilities/Loader.tsx";

const App = () => {
  // Apply the types to the useState hooks
  const [userChoice, setUserChoice] = useState<string>(""); // string type
  const [workItem, setWorkItem] = useState<WorkItem>({ id: "", fields: [] }); // WorkItem type
  const [fieldValues, setFieldValues] = useState<FieldValues>({}); // FieldValues type
  const [title, setTitle] = useState<string>(""); // string type
  const [description, setDescription] = useState<string>(""); // string type
  const [ticketOwner, setTicketOwner] = useState<string>(""); // string type
  const [workItemType, setWorkItemType] = useState<string>(""); // string type
  const [token, setToken] = useState<string>(""); // string type
  const [loading, setLoading] = useState(true);
  const [isProjectAllowed, setIsProjectAllowed] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await invoke("getIssueData").then(async () => {
          setLoading(true);
          // Get issue context from Forge bridge
          const context = (await invoke("getContext")) as unknown as {
            extension: {
              issue: {
                id: string;
                summary: string;
                description: string;
                assignee: { displayName: string };
                issuetype: { name: string };
                customfield_10001?: string;
                customfield_10002?: string;
              };
              project: { id: string; key: string; name: string };
            };
            siteUrl: string;
          };
          const issue = context.extension.issue;
          const project = context.extension.project;

          // Simulate project authorization (replace with actual logic)
          const savedSelection: string[] = ["TEST"]; // Example allowed projects
          if (project) {
            const isAllowed = savedSelection.includes(project.key);
            setIsProjectAllowed(isAllowed);

            if (!isAllowed) {
              toast.error(
                "This project is not authorized to access this extension."
              );
            } else {
              // If there is permission to access the project
              setLoading(false);
              generateToken(
                project.id,
                project.key,
                project.name,
                context.siteUrl
              );
            }
          } else {
            setLoading(false);
            console.error("No project found");
          }

          // Set work item data from issue
          setWorkItem({ id: issue.id, fields: [] });
          setFieldValues({
            summary: issue.summary,
            description: issue.description,
            assignee: issue.assignee,
            issuetype: issue.issuetype,
          });
          setTitle(issue.summary || "");
          if (issue.description) {
            setDescription(extractTextFromHTML(issue.description));
          } else {
            setUserChoice("");
            toast.error(DisplayMessages.EMPTY_DESCRIPTION);
          }
          setTicketOwner(issue.assignee?.displayName || "");
          setWorkItemType(issue.issuetype?.name || "");

          if (issue.customfield_10001) {
            // Assuming custom field for AI description
            setUserChoice(USER_CHOICE.USER_STORY);
          } else if (issue.customfield_10002) {
            // Assuming custom field for AC
            setUserChoice(USER_CHOICE.ACCEPTANCE_CRITERIA);
          }
        });
      } catch (error) {
        setLoading(false);
        console.error("Error initializing app:", error);
      }
    };

    initializeApp();
  }, []);

  const generateToken = async (
    projectId: string,
    projectKey: string,
    projectName: string,
    siteUrl: string
  ) => {
    // Show the loader
    setLoading(true);
    const requestBody = {
      parent_project_id: projectId, //project id
      project_id: projectKey, //project key
      project_name: projectName, //project name
      organization: siteUrl,
    };
    try {
      const response = (await invoke("generateToken", requestBody)) as {
        project_unique_key: string;
      };
      setLoading(false);
      setToken(response.project_unique_key);
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
    }
  };

  if (userChoice?.length && isProjectAllowed) {
    return (
      <div className="App container-fluid p-5">
        <div className="row">
          <div className="col">
            <ToastContainer />
            <GenerateDescription
              workItem={workItem}
              userChoice={userChoice}
              setUserChoice={setUserChoice}
              ticketTitle={title}
              ticketDescription={description}
              owner={ticketOwner}
              workItemType={workItemType}
              fieldValues={fieldValues}
              token={token}
            />
          </div>
        </div>
      </div>
    );
  }
  if (isProjectAllowed === false) {
    return (
      <div className="App container error-container">
        <div className="error-icon">&#9888;</div>{" "}
        {/* Unicode for warning icon */}
        <h3 className="error-title">Access Denied</h3>
        <p className="error-message">
          This project is not authorized to access this extension. <br />
          Please contact JIRA admin for further assistance.
        </p>
      </div>
    );
  }

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div className="App">
          <InfoSnackbar />
          <ToastContainer />
          <Card className="card">
            <div>
              <h3 className="card__title">TestGenie AI Powered Tool</h3>
            </div>
            <CardActions className="card__buttons">
              <span title={!description ? "Description is Empty" : ""}>
                <Button
                  disabled={!description}
                  size="large"
                  color="primary"
                  className="card__button card__button--margin-bottom"
                  onClick={() => setUserChoice(USER_CHOICE.USER_STORY)}
                >
                  Generate Description
                </Button>
              </span>
              <h6>OR</h6>
              <span title={!description ? "Description is Empty" : ""}>
                <Button
                  disabled={!description}
                  size="large"
                  color="primary"
                  className="card__button card__button--margin-top"
                  onClick={() => setUserChoice(USER_CHOICE.ACCEPTANCE_CRITERIA)}
                >
                  Generate Acceptance Criteria
                </Button>
              </span>
            </CardActions>
          </Card>
        </div>
      )}
    </div>
  );
};

export default App;
