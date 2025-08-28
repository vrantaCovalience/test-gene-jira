import { WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking/WorkItemTrackingServices";
import * as SDK from "azure-devops-extension-sdk";

let workItemFormService;

async function getWorkItemFormService() {
  if (!workItemFormService) {
    workItemFormService = await SDK.getService(
      WorkItemTrackingServiceIds.WorkItemFormService
    );
  }
  return workItemFormService;
}

/**
 * Get all field values of a work item by its ID
 * @param {number} workItemId ID of the work item
 * @returns {Object} Object containing all field values
 */
export async function getWorkItemFields(workItemId) {
  const service = await getWorkItemFormService();
  const fields = await service.getFields();
  const fieldValues = {};

  for (const field of fields) {
    const value = await service.getFieldValue(workItemId, field.referenceName);
    fieldValues[field.referenceName] = value;
  }

  return fieldValues;
}

/**
 * Get a specific field value of a work item by its ID
 * @param {number} workItemId ID of the work item
 * @param {string} fieldName Reference name of the field
 * @returns {any} Value of the specified field
 */
export async function getWorkItemFieldValue(workItemId, fieldName) {
  const service = await getWorkItemFormService();
  return service.getFieldValue(workItemId, fieldName);
}
