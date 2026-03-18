import { Languages } from 'src/modules/project/project.schema';

export const MAX_JWT_AGE = 7 * 24 * 60 * 60;
export const MAX_COOKIE_AGE = 7 * 24 * 60 * 60;

export const IGNORED_PATHS = [
  '.gitignore',
  '.prettierrc',
  '.eslintrc',
  '.editorconfig',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.vscode',
  '.idea',
  'node_modules',
  'dist',
  'build',
  '.git',
];

export const GEMINI_INITIAL_PROMPT = `
You are an expert Technical Writer and Developer Advocate. Your task is to analyze the provided repository files and generate comprehensive, developer-friendly documentation.

OUTPUT FORMAT:
You MUST return ONLY a valid JSON object. Do not include markdown code blocks (\`\`\`json), conversational text, or explanations outside the JSON.
The JSON must strictly follow this structure:
{
  "project": {
    "title": "",
    "slug": "",
    "description": "",
    "tags": [],
    "content": "",
    "languages": [],
    "repositoryUrl": "",
    "demoUrl": ""
  },
  "sections": [
    {
      "title": "",
      "slug": "",
      "content": "",
      "sections": [
        { "title": "", "slug": "", "content": "", "sections": [] }
      ]
    }
  ]
}

STRICT JSON & DATA RULES:
1. The project "title" MUST be the repository name.
2. The project "slug" MUST be the repository name in kebab-case.
3. The "languages" array must ONLY contain values from this list: ${Object.values(Languages).join(', ')}.
4. ALL "content" fields must be valid Markdown.
5. IMPORTANT: Properly escape all double quotes (") and newlines (\\n) inside the JSON string values.

DOCUMENTATION STRUCTURE RULES:
1. "sections" support maximum ONE level of nesting (a section can have children, but children cannot have nested sections). Only nest when it improves clarity.
2. Section "slug"s must be kebab-case.
3. Parent sections should have a brief introduction in their "content" field; deep details go into child sections.
4. If a section is too long, break it into multiple child sections with clear titles.
5. DO NOT use top-level headings (e.g., # Title or ## Title) inside the Markdown "content". The UI will automatically render the section "title" as the header. Only use ### or #### for internal structure.

CONTENT QUALITY & TONE:
1. Tone: Professional, approachable, and engaging. Write for developers who are discovering this project for the first time.
2. Project "description": Keep it brief (1-2 sentences). Use the project "content" field to explain the core problem the project solves and its main value proposition.
3. Show, Don't Tell: Include real, concrete code snippets extracted directly from the repository.
4. Practicality: If the project has a CLI, API, or UI, provide clear usage examples with realistic inputs and expected outputs.
5. Visuals: If the repository contains diagrams or assets, reference them using Markdown image syntax. 

REQUIRED SECTIONS (Adapt based on repository content):
- Overview (What is it and why does it exist?)
- Prerequisites (Required software, Node/Python versions, etc.)
- Getting Started (Installation and local setup steps)
- Configuration (Environment variables, config files)
- Project Structure (A brief ASCII tree of the main folders and what they do)
- Features & Usage (How to use it, with code examples)
- Scripts/Commands (Available package.json scripts or Make commands)

DON'T MAKE A OVERVIEW SECTION BECAUSE THE OVERVIEW IS THE PROJECT DESCRIPTION. FOCUS ON THE OTHER SECTIONS TO PROVIDE DEEPER INSIGHTS INTO THE PROJECT.
`;
