const express = require("express");
const router = express.Router();
const { protect: auth } = require("../middleware/auth");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const pdf = file.mimetype === "application/pdf";
    const docx =
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (pdf || docx) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files allowed"));
    }
  },
});

// Extract text from PDF
async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

// Extract text from DOCX
async function extractTextFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// Calculate readability score (Flesch Reading Ease)
function calculateReadability(text) {
  const sentences = text.match(/[.!?]+/g) || [];
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const syllables = text.match(/[aeiouy]/gi) || [];

  const S = sentences.length || 1;
  const W = words.length || 1;
  const Y = syllables.length || 1;

  const score = 206.835 - 1.015 * (W / S) - 84.6 * (Y / W);
  return Math.max(0, Math.min(100, score));
}

// Detect resume sections
function detectSections(text) {
  const lowerText = text.toLowerCase();
  return {
    contact: /contact|phone|email|address/i.test(lowerText),
    education: /education|degree|university|college|school/i.test(lowerText),
    experience: /experience|employment|work|position|job|career/i.test(
      lowerText,
    ),
    skills: /skills|technical|proficiencies|abilities|expertise/i.test(
      lowerText,
    ),
    projects: /projects|portfolio|achievements|accomplishments/i.test(
      lowerText,
    ),
    certifications: /certification|certified|license|training/i.test(lowerText),
  };
}

// Extract keywords
function extractKeywords(text) {
  const lowerText = text.toLowerCase();

  const techKeywords = [
    "javascript",
    "python",
    "java",
    "c++",
    "c#",
    "typescript",
    "react",
    "angular",
    "vue",
    "nodejs",
    "express",
    "django",
    "flask",
    "spring boot",
    "mongodb",
    "postgresql",
    "mysql",
    "sql",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "git",
    "jenkins",
    "cicd",
    "rest api",
    "graphql",
    "microservices",
    "agile",
    "scrum",
    "html",
    "css",
    "sass",
    "webpack",
  ];

  const softSkills = [
    "leadership",
    "communication",
    "teamwork",
    "problem solving",
    "critical thinking",
    "creativity",
    "time management",
    "collaboration",
    "analytical",
    "attention to detail",
  ];

  const found = { technical: [], soft: [] };

  techKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      found.technical.push(keyword);
    }
  });

  softSkills.forEach((skill) => {
    if (lowerText.includes(skill)) {
      found.soft.push(skill);
    }
  });

  return found;
}

// Analyze resume
function analyzeResume(text) {
  const lowerText = text.toLowerCase();

  // Extract contact info
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );
  const phoneMatch = text.match(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  );

  // Detect sections
  const sections = detectSections(text);
  const sectionCount = Object.values(sections).filter((v) => v).length;

  // Extract keywords
  const keywords = extractKeywords(text);
  const totalKeywords = keywords.technical.length + keywords.soft.length;

  // Calculate readability
  const readabilityScore = calculateReadability(text);
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  // Calculate ATS score (30% weight)
  let atsScore = 50;
  if (sections.contact) atsScore += 10;
  if (sections.education) atsScore += 10;
  if (sections.experience) atsScore += 10;
  if (sections.skills) atsScore += 10;
  if (emailMatch && phoneMatch) atsScore += 10;
  atsScore = Math.min(atsScore, 100);

  // Calculate keyword score (40% weight)
  let keywordScore = 40;
  keywordScore += Math.min(keywords.technical.length * 3, 40);
  keywordScore += Math.min(keywords.soft.length * 2, 20);
  keywordScore = Math.min(keywordScore, 100);

  // Grammar & readability score (30% weight)
  const grammarScore = readabilityScore;

  // Overall score (weighted average)
  const overallScore = Math.round(
    atsScore * 0.3 + keywordScore * 0.4 + grammarScore * 0.3,
  );

  // Generate suggestions
  const suggestions = [];
  if (!emailMatch) suggestions.push("Add email address to contact section");
  if (!phoneMatch) suggestions.push("Add phone number to contact section");
  if (!sections.education) suggestions.push("Add education section");
  if (!sections.experience) suggestions.push("Add work experience section");
  if (!sections.skills) suggestions.push("Add skills section");
  if (keywords.technical.length < 5)
    suggestions.push(
      "Include more technical skills relevant to your target role",
    );
  if (keywords.soft.length < 3)
    suggestions.push("Highlight soft skills like leadership and communication");
  if (wordCount < 300)
    suggestions.push(
      `Expand resume with more details (currently ${wordCount} words)`,
    );
  if (readabilityScore < 60)
    suggestions.push("Improve readability by using shorter sentences");
  if (suggestions.length === 0)
    suggestions.push("Excellent resume! Well-structured and comprehensive");

  return {
    overallScore,
    atsScore,
    keywordScore,
    readabilityScore,
    wordCount,
    contact: {
      hasEmail: !!emailMatch,
      hasPhone: !!phoneMatch,
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null,
    },
    sections,
    keywords,
    suggestions: suggestions.slice(0, 8),
    metrics: {
      sectionCount,
      totalKeywords,
      readabilityLevel:
        readabilityScore > 70
          ? "Easy"
          : readabilityScore > 50
            ? "Average"
            : "Difficult",
    },
  };
}

// POST /api/analyze - Analyze resume
router.post("/", auth, upload.single("resume"), async (req, res) => {
  try {
    let resumeText = "";

    if (req.file) {
      if (req.file.mimetype === "application/pdf") {
        resumeText = await extractTextFromPDF(req.file.buffer);
      } else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        resumeText = await extractTextFromDocx(req.file.buffer);
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({ error: "No resume provided" });
    }

    if (!resumeText.trim()) {
      return res
        .status(400)
        .json({ error: "Could not extract text from file" });
    }

    const analysis = analyzeResume(resumeText);

    res.json({
      success: true,
      analysis: {
        ...analysis,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res
      .status(500)
      .json({ error: "Failed to analyze resume: " + error.message });
  }
});

module.exports = router;
