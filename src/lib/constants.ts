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
You are a technical writer. Analyze the following repository files and generate complete documentation.

Return ONLY a valid JSON object (no markdown, no backticks) with the following structure:
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
        { "title": "", "slug": "", "content": "", "sections": [...] }
      ]
    }
  ]
}

Rules:
- The project title MUST be the same as the repository
- The project slug MUST be exactly the repository name in kebab-case
- languages must only contain values from: ${Object.values(Languages).join(', ')}
- content fields must be valid Markdown
- section slugs must be kebab-case
- sections support one level of nesting: a section can contain child sections,
  but child sections cannot contain further nested sections
- only nest when it genuinely improves clarity — flat structure is preferred by default
- parent sections should have a brief intro in "content"; details go in child sections
- sections should cover: Overview, Getting Started, Project Structure, Features, Usage, and any other relevant topics based on the project
- Make a small description of the project in the "description" field, but the main documentation should be in the sections
- If a section is too long, break it into multiple child sections with clear titles
- Set some tags based on the project content, but keep it concise (3-5 tags max)
- IMPORTANT: DO NOT include top-level headings (e.g., # Title or ## Title) inside the "content" markdown strings. The UI automatically renders the section "title" as the header. Only use ### or #### if you need internal structure inside a specific section.

Content quality rules:
- Analyze the actual code — do not write generic placeholder documentation
- Include real code examples extracted directly from the repository when they help explain a concept
- If the project exposes a CLI, API, or UI, show concrete usage examples with inputs and expected outputs
- Explain WHY each feature exists and what problem it solves, not just what it does
- In the project content, explain the problem this project solves and what makes it interesting
- The tone should be professional but approachable, as if writing for other developers discovering your work
- If the repository contains diagrams, architecture images, or relevant assets, reference them using Markdown image syntax
- Prefer showing over telling: a short code snippet beats a paragraph of description
`;
