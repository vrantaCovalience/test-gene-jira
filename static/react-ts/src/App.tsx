import { Button, Card, CardActions } from "@mui/material";
import { useState } from "react";

import { Snackbar } from "./component";
import { USER_CHOICE } from "./constants";
import GenerateDescription from "./views/generateDescription";

function App() {
  const [description] = useState<string>(""); // string type
  // I want value of useChoice to  be types only
  const [userChoice, setUserChoice] = useState<
    (typeof USER_CHOICE)[keyof typeof USER_CHOICE] | ""
  >("");

  switch (userChoice) {
    case USER_CHOICE.DESCRIPTION:
      return (
        <GenerateDescription
          userChoice={userChoice}
          setUserChoice={setUserChoice}
        />
      );
    case USER_CHOICE.ACCEPTANCE_CRITERIA:
      return (
        <GenerateDescription
          userChoice={userChoice}
          setUserChoice={setUserChoice}
        />
      );
    default:
      return (
        <div className="App">
          <Snackbar message="I will help you write clear, actionable description and detailed acceptance criteria." />

          <Card className="card">
            <div>
              <h3 className="card__title">TestGenie AI Powered Tool</h3>
            </div>
            <CardActions className="card__buttons">
              <span title={!description ? "Description is Empty" : ""}>
                <Button
                  size="large"
                  color="primary"
                  className="card__button card__button--margin-bottom"
                  onClick={() => setUserChoice(USER_CHOICE.DESCRIPTION)}
                >
                  Generate Description
                </Button>
              </span>
              <h6>OR</h6>
              <span title={!description ? "Description is Empty" : ""}>
                <Button
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
      );
  }
}

export default App;
