import React, { useEffect, useState } from "react";
import { WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking";
import * as SDK from "azure-devops-extension-sdk";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import InfoSnackbar from "./utilities/InfoSnackbar.tsx";
import { FieldValues, WorkItem } from "./types/index.tsx";
import GenerateDescription from "./component/GenerateDescription/GenerateDescription.tsx";
import "./App.css";
import "./assets/styles/global.scss";
import { DisplayMessages, USER_CHOICE } from "./constant/Constants.tsx";
import { extractTextFromHTML } from "./utilities/helper.tsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CoreRestClient } from "azure-devops-extension-api/Core";
import {
  CommonServiceIds,
  // IExtensionDataManager,
  // IExtensionDataService,
  IProjectPageService,
  getClient,
} from "azure-devops-extension-api";
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
        await SDK.init();

        // Wait until SDK is ready
        SDK.ready().then(async () => {
          try {
            setLoading(true);
            // Get the ProjectPageService
            const projectService = await SDK.getService<IProjectPageService>(
              CommonServiceIds.ProjectPageService
            );

            // Retrieve project information
            const project = await projectService.getProject();
            // Retrieve the IExtensionDataService and get an IExtensionDataManager instance
            const settingsService: any = await SDK.getService(
              CommonServiceIds.ExtensionDataService
            );
            const accessToken = await SDK.getAccessToken();
            const dataManager = await settingsService.getExtensionDataManager(
              SDK.getExtensionContext().id,
              accessToken
            );

            // Fetch saved projects using dataManager
            const savedSelection: string[] =
              (await dataManager.getValue("selectedProjects")) || [];
            if (project) {
              const isAllowed = savedSelection.includes(project.id);
              setIsProjectAllowed(isAllowed);

              if (!isAllowed) {
                toast.error(
                  "This project is not authorized to access this extension."
                );
              } else {
                //if there is permission to access the project
                const teamContext = SDK.getTeamContext();
                const teamId = teamContext.id;
                const teamName = teamContext.name;

                // Get the WorkRestClient
                const workClient = getClient(CoreRestClient);
                let teamDescription;
                // Fetch the team details
                try {
                  const team = await workClient.getTeam(project.id, teamId);
                  teamDescription = team.description;
                } catch (error) {
                  console.error("Error fetching team description:", error);
                }
                // Get the host context
                const hostContext = SDK.getHost();
                const orgName = hostContext.name;
                setLoading(false);
                generateToken(
                  project.id,
                  teamId,
                  teamName,
                  orgName,
                  teamDescription
                );
              }
            } else {
              setLoading(false);
              console.error("No project found");
            }
          } catch (error) {
            setLoading(false);
            console.error("Error fetching project info:", error);
          }
        });
      } catch (error) {
        console.error("Error initializing SDK:", error);
      }

      SDK.register("workItemAiDashboard", {
        onLoaded: async (args: any) => {
          console.log(args);
        },
        onSaved: async (args: any) => {
          updateFields();
          console.log(args);
        },
        onRefreshed: async () => {
          console.log("refreshed");
        },
      });

      const workItemFormService: any = await SDK.getService(
        WorkItemTrackingServiceIds.WorkItemFormService
      );

      const updateFields = async () => {
        const workItemId = await workItemFormService.getId();
        const fields = await workItemFormService.getFields();
        setWorkItem({ id: workItemId, fields });

        const fetchedFieldValues = await workItemFormService.getFieldValues(
          fields.map((field: { referenceName: string }) => field.referenceName)
        );
        setFieldValues(fetchedFieldValues);
        setTitle(fetchedFieldValues["System.Title"] || "");
        if (fetchedFieldValues["System.Description"]) {
          setDescription(
            extractTextFromHTML(fetchedFieldValues["System.Description"])
          );
        } else {
          setUserChoice("");
          toast.error(DisplayMessages.EMPTY_DESCRIPTION);
        }
        setTicketOwner(
          extractTextFromHTML(fetchedFieldValues["System.AssignedTo"])
        );
        setWorkItemType(fetchedFieldValues["System.WorkItemType"]);

        if (fetchedFieldValues["Custom.AIGeneratedDescription"]) {
          setUserChoice(USER_CHOICE.USER_STORY);
        } else if (
          fetchedFieldValues["Microsoft.VSTS.Common.AcceptanceCriteria"]
        ) {
          setUserChoice(USER_CHOICE.ACCEPTANCE_CRITERIA);
        }
      };

      await updateFields();
    };

    initializeApp();
  }, []);

  const generateToken = async (
    projectId: string,
    teamId: string,
    teamName: string,
    orgName: string,
    teamDescription?: string
  ) => {
    // Show the ADO loader
    setLoading(true);
    const requestBody = {
      parent_project_id: projectId, //project id
      project_id: teamId, //team id
      project_name: teamName, //team name
      project_description: teamDescription, //team description
      organization: orgName,
    };
    try {
      const url: string = process.env.REACT_APP_API_URL
        ? process.env.REACT_APP_API_URL + "init"
        : "";
      const init = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const token = await init.json();
      setLoading(false);
      setToken(token.project_unique_key);
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
          Please contact ADO admin for further assistance.
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
