export const extractTextFromHTML = (html: string): string => {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

export const formatWithBoldUserStory = (text: string): string => {
  return `<b>User Story:</b><br/>${text}`;
};

export const formatWithBoldAcceptanceCriteria = (text: string): string => {
  return `<b>Acceptance Criteria:</b><br/>${text}`;
};

export const extractFormattedTextFromHTML = (html: string): string => {
  return extractTextFromHTML(html);
};
