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
