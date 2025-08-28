export const extractTextFromHTML = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export const extractFormattedTextFromHTML = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (!doc.body) return "";

  const traverseAndExtract = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tag = element.tagName.toLowerCase();
      let text = "";

      // Add newline for specific block elements
      if (["div", "p", "br"].includes(tag)) text += "\n";

      // Recursively traverse child nodes
      for (const child of Array.from(node.childNodes)) {
        text += traverseAndExtract(child);
      }

      return text;
    }

    return "";
  };

  // Extract and trim excess whitespace
  return traverseAndExtract(doc.body)
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
};

export const formatDescription = (rowText: string) => {
  // Regex to find paragraphs starting with "**Story Name:**"
  const regex = /\*\*Story Name:\*\* ([^]*?)(?=\*\*Story Name:|\$)/g;

  // Replace each match with formatted HTML
  return rowText.replace(regex, "<b>Story Name:&nbsp;</b><br><p>$1</p>");
};

// Function to format text with bold parts
export function formatWithBoldUserStory(text: string) {
  // Split the text by "\n" to get individual lines
  let lines = text.split("\n");

  // Iterate through each line and format accordingly
  for (let i = 0; i < lines.length; i++) {
    // Find the position of ":" in the line
    let colonIndex = lines[i].indexOf(":");

    if (colonIndex !== -1) {
      // Extract the part before ":" and the part after ":"
      let beforeColon = lines[i].substring(0, colonIndex + 1); // Include ":"
      let afterColon = lines[i].substring(colonIndex + 1).trim(); // Trim any leading/trailing spaces

      // Bold the part after ":" (if it exists)
      if (afterColon) {
        lines[i] = `<br><b>${beforeColon}</b> ${afterColon}`;
      }
    }
  }

  // Join the lines back into a single string
  let formattedText = lines.join("\n");
  return formattedText;
}

// Function to format acceptance criteria text with bold parts and numbered list
export function formatWithBoldAcceptanceCriteria(text: string) {
  // Split the text by "\n" to get individual lines
  let lines = text.split("\n");

  // Initialize a counter for numbering criteria
  let criterionNumber = 1;

  // Iterate through each line and format accordingly
  for (let i = 0; i < lines.length; i++) {
    // Check if the line starts with a number followed by a dot and a space (indicating an acceptance criterion)
    if (/^\d+\.\s/.test(lines[i])) {
      // Split the line into parts before and after the first ":"
      let parts = lines[i].split(":");

      if (parts.length === 2) {
        // Format the criterion number with bold and append to the beginning of the line
        lines[i] = `<b>${criterionNumber}.</b> ${parts[1].trim()}`;

        // Increment the criterion number for the next criterion
        criterionNumber++;
      }
    }
  }

  // Join the lines back into a single string
  let formattedText = lines.join("<br>");
  return formattedText;
}

export function reverseBoldAcceptanceCriteria(formattedText: string) {
  // Replace all <br> tags with newline characters
  let lines = formattedText.split("<br>");

  // Initialize a counter for numbering criteria
  let criterionNumber = 1;

  // Iterate through each line and reverse the formatting
  for (let i = 0; i < lines.length; i++) {
    // Check if the line contains a bolded criterion number
    if (new RegExp(`<b>${criterionNumber}\\.</b>`).test(lines[i])) {
      // Remove the <b> tags and restore the criterion number with a dot
      lines[i] = lines[i].replace(
        `<b>${criterionNumber}.</b>`,
        `${criterionNumber}. `
      );

      // Restore the ":" before the description (since it was removed in the initial format)
      lines[i] = `Criterion ${criterionNumber}: ${lines[i].trim()}`;

      // Increment the criterion number for the next criterion
      criterionNumber++;
    }
  }

  // Join the lines back into a single string with newlines
  let originalText = lines.join("\n");
  return originalText;
}
