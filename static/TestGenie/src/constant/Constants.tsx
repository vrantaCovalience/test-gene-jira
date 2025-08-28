const CoreFieldRefNames = {
  AreaId: "System.AreaId",
  AreaPath: "System.AreaPath",
  AssignedTo: "System.AssignedTo",
  AttachedFileCount: "System.AttachedFileCount",
  AuthorizedAs: "System.AuthorizedAs",
  BoardColumn: "System.BoardColumn",
  BoardColumnDone: "System.BoardColumnDone",
  BoardLane: "System.BoardLane",
  ChangedBy: "System.ChangedBy",
  ChangedDate: "System.ChangedDate",
  CreatedBy: "System.CreatedBy",
  CreatedDate: "System.CreatedDate",
  Description: "System.Description",
  ExternalLinkCount: "System.ExternalLinkCount",
  History: "System.History",
  HyperLinkCount: "System.HyperLinkCount",
  Id: "System.Id",
  IterationId: "System.IterationId",
  IterationPath: "System.IterationPath",
  LinkType: "System.Links.LinkType",
  NodeName: "System.NodeName",
  Reason: "System.Reason",
  RelatedLinkCount: "System.RelatedLinkCount",
  Rev: "System.Rev",
  RevisedDate: "System.RevisedDate",
  State: "System.State",
  AuthorizedDate: "System.AuthorizedDate",
  TeamProject: "System.TeamProject",
  Tags: "System.Tags",
  Title: "System.Title",
  WorkItemType: "System.WorkItemType",
  Watermark: "System.Watermark",
  IsDeleted: "System.IsDeleted",
};

export default CoreFieldRefNames;

export const workItemFields = {
  originalEstimate: "Microsoft.VSTS.Scheduling.OriginalEstimate",
  completedWork: "Microsoft.VSTS.Scheduling.CompletedWork",
  remainingWork: "Microsoft.VSTS.Scheduling.RemainingWork",
  workItemStartDate: "Microsoft.VSTS.Scheduling.StartDate",
  workItemFinishDate: "Microsoft.VSTS.Scheduling.FinishDate",
  workItemState: "System.State",
  workItemDiscussion: "System.History",
  createdDate: "System.CreatedDate",
  workItemTitle: "System.Title",
  workItemType: "System.WorkItemType",
  workItemSupportTier: "Custom.SupportTier",
  workItemAssignedTo: "System.AssignedTo",
  workItemAreaPath: "System.AreaPath",
  workItemIterationPath: "System.IterationPath",
  workItemTags: "System.Tags",
};

export const USER_CHOICE = {
  USER_STORY: "user_story",
  ACCEPTANCE_CRITERIA: "acceptance_criteria",
};

export const LOADING = "Loading....";

export const DisplayMessages = {
  SUBMITTED_MESSAGE: "Feedback submitted successfully!!",
  REGENERATION_STARTED: "Regeneration started.",
  REGENERATION_SUCCESSFUL: "Regenerated successfully!!",
  EMPTY_DESCRIPTION: "Description is empty!",
  SOMETHING_WRONG: "Something went wrong!",
  UNKNOWN_ERROR: "Some unknown error occurred.",
  WORK_ITEM_UPDATED: "Work item updated successfully!",
  TAKING_LONGER: "This is taking longer than expected. Please wait...",
};
