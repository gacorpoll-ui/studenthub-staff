#!/usr/bin/env node
import { fileURLToPath } from 'url';
import path from 'path';
import * as tasks from './tasks.js';

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      return printHelp();
    case 'preview':
      return tasks.preview();
    case 'profile':
      return tasks.profile();
    case 'search':
      return tasks.searchOpportunities(args.slice(1).join(' ') || undefined);
    case 'jobs':
      return tasks.searchJobs(args.slice(1).join(' ') || undefined);
    case 'suggest-readme':
      return tasks.suggestReadme();
    case 'portfolio':
      return tasks.buildPortfolio();
    case 'update-readme':
      return tasks.autoUpdateReadme();
    case 'cover-letter':
      if (args.length < 3) {
        throw new Error('Usage: node cli.js cover-letter <company> <role> [description]');
      }
      return tasks.generateCoverLetter(args[1], args[2], args.slice(3).join(' '));
    case 'create-issue':
      if (args.length < 4) {
        throw new Error('Usage: node cli.js create-issue <owner/repo> <title> <body>');
      }
      return tasks.createIssue(args[1], args[2], args.slice(3).join(' '));
    case 'auto-hunter':
      if (args.length < 2) {
        throw new Error('Usage: node cli.js auto-hunter <query> [limit]');
      }
      return tasks.runAutoHunter(args[1], args[2] || 5);
    case 'build-resume':
      return tasks.buildProfessionalResume();
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log(`AI Agency Workflow CLI

Usage:
  node cli.js preview
  node cli.js profile
  node cli.js search [query]
  node cli.js jobs [query]
  node cli.js suggest-readme
  node cli.js portfolio
  node cli.js update-readme
  node cli.js cover-letter <company> <role> [description]
  node cli.js create-issue <owner/repo> <title> <body>

Environment:
  GITHUB_TOKEN         - required for GitHub API actions
  OPENAI_API_KEY       - required for AI generation
  FREETHEAI_API_KEY    - supported as alternative AI key
  OPENAI_BASE_URL      - optional custom AI endpoint
  OPENAI_MODEL         - optional model override
`);
}
main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
