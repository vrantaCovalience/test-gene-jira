import { CommonServiceIds } from "azure-devops-extension-api/Common/CommonServices";
import * as SDK from "azure-devops-extension-sdk";

let locationService;

/**
 * Get location service instance
 */
export async function getLocationService() {
  if (!locationService) {
    locationService = await SDK.getService(CommonServiceIds.LocationService);
  }

  return locationService;
}

/**
 * Get resource area location
 * @param {string} resourceAreaId - Resource area ID
 * @returns {Promise<string>} - Resource area location
 */
export async function getResourceAreaLocation(resourceAreaId) {
  const service = await getLocationService();
  return service.getResourceAreaLocation(resourceAreaId);
}

/**
 * Get service location
 * @param {string} [serviceInstanceType] - Service instance type
 * @param {TeamFoundationHostType} [hostType] - Host type
 * @returns {Promise<string>} - Service location
 */
export async function getServiceLocation(serviceInstanceType, hostType) {
  const service = await getLocationService();
  return service.getServiceLocation(serviceInstanceType, hostType);
}

/**
 * Get route URL
 * @param {string} routeId - Route ID
 * @param {Object} [routeValues] - Route values
 * @param {string} [hostPath] - Host path
 * @returns {Promise<string>} - Route URL
 */
export async function routeUrl(routeId, routeValues, hostPath) {
  const service = await getLocationService();
  return service.routeUrl(routeId, routeValues, hostPath);
}
