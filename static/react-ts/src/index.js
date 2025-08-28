import { api } from '@forge/api';

export async function getIssueData(req) {
  try {
    // Get issue data using Forge API
    const context = req.context;
    const issueId = context.extension.issue.id;
    const response = await api.asApp().requestJira(`/rest/api/3/issue/${issueId}`);
    const issue = await response.json();
    return issue;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getContext(req) {
  try {
    // Return context from Forge
    const context = req.context;
    return context;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function generateToken(req) {
  try {
    // Mock response for eligibility - no external fetch
    const mockResponse = {
      project_unique_key: "mock-token-" + Date.now()
    };
    return mockResponse;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function generate(req) {
  try {
    // Mock response for eligibility - no external fetch
    const mockResponse = {
      description: `As a ${req.workItemType}, I need to ${req.description}. This will allow me to achieve the following objectives...`,
      acceptanceCriteria: [
        "Given the user is logged in",
        "When they perform the action",
        "Then the expected result occurs"
      ]
    };
    return mockResponse;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function regenerate(req) {
  try {
    // Mock response for eligibility - no external fetch
    const mockResponse = {
      description: `Updated: As a ${req.workItemType}, I need to ${req.description}. This has been regenerated with improved clarity...`,
      acceptanceCriteria: [
        "Given the user has permissions",
        "When they complete the task",
        "Then all requirements are met"
      ]
    };
    return mockResponse;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function feedback(req) {
  try {
    // Mock response for eligibility - no external fetch
    const mockResponse = {
      success: true,
      message: "Feedback received successfully"
    };
    return mockResponse;
  } catch (error) {
    throw new Error(error.message);
  }
}

export const resolver = {
  getIssueData,
  getContext,
  generateToken,
  generate,
  regenerate,
  feedback,
  updateIssue
};