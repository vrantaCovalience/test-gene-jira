import { WorkItem } from "azure-devops-extension-api/WorkItemTracking/WorkItemTracking";
import { WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking/WorkItemTrackingServices";
import * as SDK from "azure-devops-extension-sdk";
let workItemFormNavigationService;

/**
 * Get Work Item Form Navigation Service instance
 * @returns {Promise<Object>} - Work item form navigation service
 */
export async function getWorkItemFormNavigationService() {
  if (!workItemFormNavigationService) {
    workItemFormNavigationService = await SDK.getService(
      WorkItemTrackingServiceIds.WorkItemFormNavigationService
    );
  }

  return workItemFormNavigationService;
}

/**
 * Open Work Item by ID
 * @param {number} workItemId - Work item ID
 * @param {MouseEvent} [e] - Mouse event
 * @returns {Promise<WorkItem>} - Opened work item
 */
export async function openWorkItem(workItemId, e) {
  const newTab = e ? e.ctrlKey : false;
  const service = await getWorkItemFormNavigationService();
  return service.openWorkItem(workItemId, newTab);
}

/**
 * Open New Work Item
 * @param {string} workItemTypeName - Work item type name
 * @param {Object} [initialValues] - Initial values for the new work item
 * @returns {Promise<WorkItem>} - Created work item
 */
export async function openNewWorkItem(workItemTypeName, initialValues) {
  const service = await getWorkItemFormNavigationService();
  return service.openNewWorkItem(workItemTypeName, initialValues);
}
