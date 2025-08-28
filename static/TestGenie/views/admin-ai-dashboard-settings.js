document.addEventListener("DOMContentLoaded", async function () {
  const projectTableBody = document.getElementById("projectSelection");
  const saveSelectionBtn = document.getElementById("saveSelectionBtn");
  const successMessage = document.getElementById("successMessage");
  const loader = document.getElementById("loader");
  const content = document.getElementById("content");
  const noRecordsMessage = document.getElementById("noRecordsMessage"); // Add "No records found" message element.

  successMessage.classList.add("hidden");
  noRecordsMessage.classList.add("hidden");

  // Show loader and hide content initially
  loader.classList.remove("hidden");
  content.classList.add("hidden");

  async function loadProjects() {
    VSS.require(
      ["VSS/Service", "TFS/Core/RestClient"],
      async function (VSS_Service, TFS_Core_WebApi) {
        try {
          const coreClient = VSS_Service.getCollectionClient(
            TFS_Core_WebApi.CoreHttpClient
          );
          const projects = await coreClient.getProjects();
          console.log("Projects loaded:", projects);

          const settingsService = await VSS.getService(
            VSS.ServiceIds.ExtensionData
          );
          const savedSelection =
            (await settingsService.getValue("selectedProjects", {
              scopeType: "Default",
            })) || [];
          console.log("Saved selection:", savedSelection);

          if (projects.length === 0) {
            displayNoRecordsMessage(true);
          } else {
            projects.forEach((project) => {
              const row = document.createElement("tr");

              const projectNameCell = document.createElement("td");
              projectNameCell.textContent = project.name;
              row.appendChild(projectNameCell);

              const activityCell = document.createElement("td");
              activityCell.classList.add("table__head--textAlign");

              const toggleSwitch = document.createElement("label");
              toggleSwitch.classList.add("toggle-switch");

              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.value = String(project.id);
              checkbox.classList.add("activity-toggle");
              if (savedSelection.includes(String(project.id))) {
                checkbox.checked = true;
              }

              const slider = document.createElement("span");
              slider.classList.add("slider");

              toggleSwitch.appendChild(checkbox);
              toggleSwitch.appendChild(slider);
              activityCell.appendChild(toggleSwitch);
              row.appendChild(activityCell);

              projectTableBody.appendChild(row);
            });

            displayNoRecordsMessage(false);
          }

          loader.classList.add("hidden");
          content.classList.remove("hidden");
        } catch (error) {
          console.error("Error loading projects:", error);
        }
      }
    );
  }

  saveSelectionBtn.addEventListener("click", async function () {
    const selectedProjects = Array.from(
      document.querySelectorAll(".activity-toggle:checked")
    ).map((checkbox) => String(checkbox.value));

    try {
      const settingsService = await VSS.getService(
        VSS.ServiceIds.ExtensionData
      );
      await settingsService.setValue("selectedProjects", selectedProjects, {
        scopeType: "Default",
      });
      successMessage.classList.remove("hidden");
      setTimeout(() => successMessage.classList.add("hidden"), 3000);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error saving project selection:", error);
    }
  });

  function displayNoRecordsMessage(visible) {
    noRecordsMessage.classList.toggle("hidden", !visible);
  }

  window.filterProjects = function () {
    const searchInput = document
      .getElementById("projectSearch")
      .value.toLowerCase();
    const projectRows = document.querySelectorAll("#projectSelection tr");
    let anyVisible = false;

    projectRows.forEach((row) => {
      const projectName = row
        .querySelector("td:first-child")
        .textContent.toLowerCase();
      const isVisible = projectName.includes(searchInput);
      row.style.display = isVisible ? "" : "none";
      if (isVisible) anyVisible = true;
    });

    displayNoRecordsMessage(!anyVisible);
  };

  VSS.init({ explicitNotifyLoaded: true });
  await loadProjects();
  VSS.notifyLoadSucceeded();
});
