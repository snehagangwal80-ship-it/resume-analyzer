// Retrieve analysis data from sessionStorage
const analysisData = JSON.parse(sessionStorage.getItem("analysisData"));

if (!analysisData) {
  window.location.href = "dashboard.html";
}

const analysis = analysisData.analysis;

// Update Overall Score with animated circle
function updateOverallScore() {
  const score = analysis.overallScore;
  const overallScoreEl = document.getElementById("overall-score");
  const circle = document.getElementById("overall-circle");

  overallScoreEl.textContent = score;

  // Calculate circle stroke-dashoffset (circumference ≈ 351.858 for r=56)
  const circumference = 351.858;
  const offset = circumference - (score / 100) * circumference;

  setTimeout(() => {
    circle.style.strokeDashoffset = offset;
  }, 100);

  // Change circle color based on score
  if (score >= 80) {
    circle.style.stroke = "#10b981"; // Green
  } else if (score >= 60) {
    circle.style.stroke = "#f59e0b"; // Yellow
  } else {
    circle.style.stroke = "#ef4444"; // Red
  }
}

// Update all scores
function updateScores() {
  // ATS Score
  document.getElementById("ats-score").textContent = analysis.atsScore;
  document.getElementById("ats-bar").style.width = analysis.atsScore + "%";

  // Keyword Score
  document.getElementById("keyword-score").textContent = analysis.keywordScore;
  document.getElementById("keyword-bar").style.width =
    analysis.keywordScore + "%";

  // Readability Score (formatted to 2 decimal places)
  const readabilityFormatted = parseFloat(analysis.readabilityScore).toFixed(2);
  document.getElementById("readability-score").textContent =
    readabilityFormatted;
  document.getElementById("readability-bar").style.width =
    analysis.readabilityScore + "%";
  document.getElementById("readability-level").textContent =
    analysis.metrics.readabilityLevel;

  updateOverallScore();
}

// Update contact info
function updateContactInfo() {
  const emailIcon = document.getElementById("email-icon");
  const emailText = document.getElementById("email-text");
  const phoneIcon = document.getElementById("phone-icon");
  const phoneText = document.getElementById("phone-text");

  if (analysis.contact.hasEmail) {
    emailIcon.classList.add("fa-check");
    emailIcon.classList.remove("fa-times");
    emailText.textContent = `${analysis.contact.email}`;
  } else {
    emailIcon.classList.add("fa-times");
    emailIcon.classList.remove("fa-check");
    emailIcon.classList.add("text-red-600");
    emailText.textContent = "Email not found";
  }

  if (analysis.contact.hasPhone) {
    phoneIcon.classList.add("fa-check");
    phoneIcon.classList.remove("fa-times");
    phoneText.textContent = `${analysis.contact.phone}`;
  } else {
    phoneIcon.classList.add("fa-times");
    phoneIcon.classList.remove("fa-check");
    phoneIcon.classList.add("text-red-600");
    phoneText.textContent = "Phone not found";
  }
}

// Update sections
function updateSections() {
  const sectionsList = document.getElementById("sections-list");
  sectionsList.innerHTML = "";

  const sectionIcons = {
    contact: "fa-user",
    education: "fa-graduation-cap",
    experience: "fa-briefcase",
    skills: "fa-tools",
    projects: "fa-project-diagram",
    certifications: "fa-certificate",
  };

  for (const [section, found] of Object.entries(analysis.sections)) {
    const icon = sectionIcons[section] || "fa-check";
    const statusClass = found ? "text-green-600" : "text-red-600";
    const statusText = found ? "Present" : "Missing";

    sectionsList.innerHTML += `
      <div class="flex items-center">
        <i class="fas ${icon} ${statusClass} mr-3"></i>
        <span class="text-gray-700 capitalize">${section}: <strong>${statusText}</strong></span>
      </div>
    `;
  }
}

// Update keywords
function updateKeywords() {
  const techKeywords = document.getElementById("tech-keywords");
  const softKeywords = document.getElementById("soft-keywords");

  // Technical keywords
  if (analysis.keywords.technical.length > 0) {
    techKeywords.innerHTML = analysis.keywords.technical
      .map(
        (keyword) =>
          `<span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">${keyword}</span>`,
      )
      .join("");
  }

  // Soft keywords
  if (analysis.keywords.soft.length > 0) {
    softKeywords.innerHTML = analysis.keywords.soft
      .map(
        (keyword) =>
          `<span class="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">${keyword}</span>`,
      )
      .join("");
  }
}

// Update suggestions
function updateSuggestions() {
  const suggestionsList = document.getElementById("suggestions-list");
  suggestionsList.innerHTML = "";

  analysis.suggestions.forEach((suggestion, index) => {
    const icons = ["fa-star", "fa-lightbulb", "fa-check", "fa-arrow-up"];
    const icon = icons[index % icons.length];
    const colors = ["yellow", "blue", "green", "purple"];
    const color = colors[index % colors.length];

    suggestionsList.innerHTML += `
      <div class="flex items-start bg-${color}-50 p-3 rounded-lg">
        <i class="fas ${icon} text-${color}-600 mr-3 mt-1"></i>
        <p class="text-gray-700">${suggestion}</p>
      </div>
    `;
  });
}

// Update metrics
function updateMetrics() {
  document.getElementById("word-count").textContent = analysis.wordCount;
  document.getElementById("section-count").textContent =
    analysis.metrics.sectionCount;
  document.getElementById("total-keywords").textContent =
    analysis.metrics.totalKeywords;
}

// Download as PDF (simple text version)
document.getElementById("download-btn").addEventListener("click", () => {
  const content = `
RESUME ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

OVERALL SCORE: ${analysis.overallScore}/100

SCORES BREAKDOWN:
- ATS Compliance: ${analysis.atsScore}/100
- Keyword Match: ${analysis.keywordScore}/100
- Readability: ${analysis.readabilityScore}/100

CONTACT INFORMATION:
- Email: ${analysis.contact.email || "Not found"}
- Phone: ${analysis.contact.phone || "Not found"}

SECTIONS FOUND:
${Object.entries(analysis.sections)
  .map(([section, found]) => `- ${section}: ${found ? "Present" : "Missing"}`)
  .join("\n")}

TECHNICAL SKILLS FOUND:
${analysis.keywords.technical.join(", ") || "None"}

SOFT SKILLS FOUND:
${analysis.keywords.soft.join(", ") || "None"}

RECOMMENDATIONS:
${analysis.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

METRICS:
- Word Count: ${analysis.wordCount}
- Sections Detected: ${analysis.metrics.sectionCount}
- Total Keywords: ${analysis.metrics.totalKeywords}
- Readability Level: ${analysis.metrics.readabilityLevel}
  `;

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume-analysis.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// New analysis button
document.getElementById("new-analysis-btn").addEventListener("click", () => {
  sessionStorage.removeItem("analysisData");
  window.location.href = "dashboard.html";
});

// Back button
document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

// Initialize all updates
updateScores();
updateContactInfo();
updateSections();
updateKeywords();
updateSuggestions();
updateMetrics();
