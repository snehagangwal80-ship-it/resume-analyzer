const API_URL = "http://localhost:5000/api";

// DOM Elements
const userDisplay = document.getElementById("user-display");
const userGreeting = document.getElementById("user-greeting");
const logoutBtn = document.getElementById("logout-btn");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const browseBtn = document.getElementById("browse-btn");
const filePreview = document.getElementById("file-preview");
const fileName = document.getElementById("file-name");
const fileSize = document.getElementById("file-size");
const removeFileBtn = document.getElementById("remove-file-btn");
const resumeText = document.getElementById("resume-text");
const analyzeBtn = document.getElementById("analyze-btn");
const clearBtn = document.getElementById("clear-btn");

let selectedFile = null;

// Check authentication
function checkAuth() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!token || !username) {
    window.location.href = "index.html";
    return;
  }

  // Display user info
  userDisplay.textContent = `👤 ${username}`;
  userGreeting.textContent = `Welcome back, ${username}!`;
}

// Browse button click
browseBtn.addEventListener("click", () => {
  fileInput.click();
});

// File input change
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0]);
  }
});

// Handle file selection
function handleFileSelect(file) {
  selectedFile = file;

  // Validate file type
  if (!file.type.includes("pdf") && !file.type.includes("document")) {
    alert("Please select a PDF or DOCX file");
    selectedFile = null;
    return;
  }

  // Show preview
  filePreview.classList.remove("hidden");
  fileName.textContent = file.name;
  fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

  // Enable analyze button
  analyzeBtn.disabled = false;

  // Clear text area
  resumeText.value = "";
}

// Remove file
removeFileBtn.addEventListener("click", () => {
  selectedFile = null;
  filePreview.classList.add("hidden");
  fileInput.value = "";
  analyzeBtn.disabled = resumeText.value.trim() === "";
});

// Drag and drop
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("border-indigo-500", "bg-indigo-50");
});

dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("border-indigo-500", "bg-indigo-50");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("border-indigo-500", "bg-indigo-50");

  if (e.dataTransfer.files.length > 0) {
    handleFileSelect(e.dataTransfer.files[0]);
  }
});

// Resume text input
resumeText.addEventListener("input", () => {
  analyzeBtn.disabled = !selectedFile && resumeText.value.trim() === "";
});

// Analyze button
analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile && !resumeText.value.trim()) {
    alert("Please upload a file or paste resume text");
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin mr-2"></i>Analyzing...';

  try {
    const token = localStorage.getItem("token");

    if (selectedFile) {
      // Handle file upload
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem("analysisData", JSON.stringify(result));
        window.location.href = "results.html";
      } else {
        alert("Analysis failed. Please try again.");
      }
    } else {
      // Handle text input
      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText: resumeText.value }),
      });

      if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem("analysisData", JSON.stringify(result));
        window.location.href = "results.html";
      } else {
        alert("Analysis failed. Please try again.");
      }
    }
  } catch (error) {
    alert("Error analyzing resume: " + error.message);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Analyze Resume';
  }
});

// Clear button
clearBtn.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  filePreview.classList.add("hidden");
  resumeText.value = "";
  analyzeBtn.disabled = true;
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "index.html";
});

// Check auth on page load
checkAuth();
