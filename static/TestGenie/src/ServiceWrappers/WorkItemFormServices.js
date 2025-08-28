import { getClient } from "azure-devops-extension-api/Common/Client";
import { CoreRestClient } from "azure-devops-extension-api/Core";
import { WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking/WorkItemTrackingServices";
import * as SDK from "azure-devops-extension-sdk";
import { equals } from "azure-devops-ui/Core/Util/String";
import { CoreFieldRefNames } from "Common/Constants";
import { first } from "Common/Utilities/Array";

let workItemFormService;
let workItemProjectId;
let workItemProjectName;
let workItemTypeName;

/**
 * Get Work Item Form Service instance
 */
export async function getWorkItemFormService() {
  if (!workItemFormService) {
    workItemFormService = await SDK.getService(
      WorkItemTrackingServiceIds.WorkItemFormService
    );
  }

  return workItemFormService;
}

/**
 * Get Work Item Type Name
 * @returns {Promise<string>} - Work item type name
 */
export async function getWorkItemTypeName() {
  if (!workItemTypeName) {
    const service = await getWorkItemFormService();
    workItemTypeName = await service.getFieldValue(
      CoreFieldRefNames.WorkItemType,
      true
    );
  }
  return workItemTypeName;
}

/**
 * Get Work Item Project Name
 * @returns {Promise<string>} - Work item project name
 */
export async function getWorkItemProjectName() {
  if (!workItemProjectName) {
    const service = await getWorkItemFormService();
    workItemProjectName = await service.getFieldValue(
      CoreFieldRefNames.TeamProject,
      true
    );
  }
  return workItemProjectName;
}

/**
 * Get Work Item Project Id
 * @returns {Promise<string>} - Work item project ID
 */
export async function getWorkItemProjectId() {
  if (!workItemProjectId) {
    const projectName = await getWorkItemProjectName();
    const client = await getClient(CoreRestClient);
    const project = await client.getProject(projectName);
    workItemProjectId = project.id;
  }
  return workItemProjectId;
}

/**
 * Get Work Item Field
 * @param {string} fieldName - Field name
 * @returns {Promise<Object>} - Work item field
 */
export async function getWorkItemField(fieldName) {
  const service = await getWorkItemFormService();
  const fields = await service.getFields();
  const field = first(fields, (f) => {
    return (
      equals(f.name, fieldName, true) ||
      equals(f.referenceName, fieldName, true)
    );
  });

  if (field) {
    return field;
  } else {
    throw new Error(
      `Field '${fieldName}' does not exist in this work item type`
    );
  }
}
