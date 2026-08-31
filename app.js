const form = document.getElementById("assessmentForm");
const result = document.getElementById("result");
const decisionTitle = document.getElementById("decisionTitle");
const decisionSummary = document.getElementById("decisionSummary");
const reasons = document.getElementById("reasons");
const actionsList = document.getElementById("actionsList");
const resetBtn = document.getElementById("resetBtn");
const copyBtn = document.getElementById("copyBtn");

let latestSummary = "";

function addItem(list, text) {
  const li = document.createElement("li");
  li.textContent = text;
  list.appendChild(li);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const useCase = document.getElementById("useCase").value.trim();
  const dataClass = document.getElementById("dataClass").value;
  const platform = document.getElementById("platform").value;
  const impact = document.getElementById("impact").value;

  const controls = {
    humanReview: document.getElementById("humanReview").checked,
    dataMin: document.getElementById("dataMin").checked,
    approvedPolicy: document.getElementById("approvedPolicy").checked,
    outputCheck: document.getElementById("outputCheck").checked
  };

  reasons.innerHTML = "";
  actionsList.innerHTML = "";

  const controlCount = Object.values(controls).filter(Boolean).length;

  let decision = "Proceed";
  let summary = "The use case appears suitable to proceed with normal oversight.";
  let cssClass = "status-proceed";

  if (dataClass === "restricted" && platform !== "approved") {
    decision = "Do Not Proceed";
    summary = "Restricted or regulated information should not be sent to an unmanaged or unassessed AI platform.";
    cssClass = "status-stop";
    addItem(reasons, "The use case involves restricted / regulated information.");
    addItem(reasons, "The selected platform is not confirmed as enterprise-approved.");
    addItem(actionsList, "Use an approved platform or obtain a formal exception / risk assessment.");
    addItem(actionsList, "Confirm privacy, security, legal and data-handling requirements.");
  } else if (platform === "unknown") {
    decision = "Further Assessment Required";
    summary = "The platform needs to be assessed before the use case can be approved.";
    cssClass = "status-assess";
    addItem(reasons, "The platform has not yet been assessed.");
    addItem(actionsList, "Assess platform security, privacy, data use, retention and contractual terms.");
    addItem(actionsList, "Confirm whether organisational data is permitted on the platform.");
  } else if (dataClass === "confidential" && platform === "public") {
    decision = "Do Not Proceed";
    summary = "Confidential information should not be entered into a public or unmanaged AI service.";
    cssClass = "status-stop";
    addItem(reasons, "The use case involves confidential information.");
    addItem(reasons, "The selected platform is public / unmanaged.");
    addItem(actionsList, "Move the use case to an approved enterprise platform.");
    addItem(actionsList, "Minimise or de-identify data before reassessment.");
  } else if (impact === "high" || controlCount < 3) {
    decision = "Proceed with Controls";
    summary = "The use case may be viable, but stronger controls or oversight are recommended before use.";
    cssClass = "status-controls";

    if (impact === "high") {
      addItem(reasons, "Incorrect output could create significant business, legal, financial, customer or safety impact.");
      addItem(actionsList, "Require explicit human approval before relying on AI output.");
      addItem(actionsList, "Define escalation and verification requirements.");
    }

    if (!controls.humanReview) {
      addItem(reasons, "Human review is not currently confirmed.");
      addItem(actionsList, "Add a human-review step before output is used.");
    }
    if (!controls.dataMin) {
      addItem(reasons, "Data minimisation / de-identification is not confirmed.");
      addItem(actionsList, "Reduce the amount or sensitivity of data supplied where possible.");
    }
    if (!controls.approvedPolicy) {
      addItem(reasons, "Alignment with organisational AI policy is not confirmed.");
      addItem(actionsList, "Check the use case against the organisation's acceptable-use / AI policy.");
    }
    if (!controls.outputCheck) {
      addItem(reasons, "Independent verification of important outputs is not confirmed.");
      addItem(actionsList, "Verify material claims, calculations or recommendations before use.");
    }
  } else {
    addItem(reasons, "The selected platform is approved / vetted.");
    addItem(reasons, "The data classification is compatible with the selected platform.");
    addItem(reasons, "The proposed controls provide reasonable oversight.");
    addItem(actionsList, "Document the decision and control owner.");
    addItem(actionsList, "Review the use case if the data, platform, impact or workflow materially changes.");
  }

  decisionTitle.textContent = decision;
  decisionTitle.className = cssClass;
  decisionSummary.textContent = summary;

  latestSummary =
`AI Use-Case Decision Helper

Use case: ${useCase}
Data classification: ${dataClass}
Platform: ${platform}
Impact: ${impact}
Controls selected: ${controlCount}/4

Decision: ${decision}
Summary: ${summary}

This is a practical decision aid, not legal, privacy, security or compliance advice.`;

  result.classList.remove("hidden");
  result.scrollIntoView({ behavior: "smooth", block: "start" });
});

resetBtn.addEventListener("click", () => {
  form.reset();
  result.classList.add("hidden");
  latestSummary = "";
});

copyBtn.addEventListener("click", async () => {
  if (!latestSummary) return;
  try {
    await navigator.clipboard.writeText(latestSummary);
    copyBtn.textContent = "Copied";
    setTimeout(() => {
      copyBtn.textContent = "Copy assessment summary";
    }, 1500);
  } catch {
    alert("Copy failed. Select and copy the result manually.");
  }
});
