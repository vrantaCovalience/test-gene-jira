import {
  CommonServiceIds,
  //   IProjectPageService,
} from "azure-devops-extension-api/Common/CommonServices";
import * as SDK from "azure-devops-extension-sdk";

import { isNullOrWhiteSpace } from "./String";

let currentProject: any;

export async function getCurrentProject() {
  if (!currentProject) {
    const projectService: any = await SDK.getService(
      CommonServiceIds.ProjectPageService
    );
    const project = await projectService.getProject();
    if (!project) {
      throw new Error("No project context found");
    }
    currentProject = project;
  }
  return currentProject;
}

export async function getCurrentProjectId() {
  const project = await getCurrentProject();
  return project.id;
}

export async function getCurrentProjectName() {
  const project = await getCurrentProject();
  return project.name;
}

export async function resolveProjectId(projectId: string) {
  if (isNullOrWhiteSpace(projectId)) {
    return getCurrentProjectId();
  }
  return projectId || "";
}

export async function resolveProjectName(projectName: string) {
  if (isNullOrWhiteSpace(projectName)) {
    return getCurrentProjectName();
  }
  return projectName || "";
}
