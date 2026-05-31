import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import github from './github-client.js';
import * as llm from './llm-client.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const README_PATH = path.join(ROOT, 'README.md');
const PORTFOLIO_PATH = path.join(ROOT, 'README.portfolio.md');
const BACKUP_README_PATH = path.join(ROOT, 'README.backup.md');
const COVER_DIR = path.join(ROOT, 'cover-letters');
const SUGGESTIONS_PATH = path.join(ROOT, 'readme-suggestions.md');

function loadAgency() {
  const file = path.join(ROOT, 'agents.json');
  if (!fs.existsSync(file)) {
    return { agencyName: 'AI Agency Workflow', description: 'Standalone AI agency workflow', teams: [] };
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function preview() {
  const agency = loadAgency();
  console.log(`\nAI Agency: ${agency.agencyName}\n`);
  console.log(`${agency.description}\n`);
  for (const team of agency.teams) {
    console.log(`Team: ${team.name}`);
    console.log(`Role: ${team.role}`);
    for (const agent of team.agents) {
      console.log(`  - ${agent.name}: ${agent.focus}`);
    }
    console.log('');
  }
}

export async function profile() {
  const user = await github.getAuthenticatedUser();
  console.log(`\nGitHub profile: ${user.login}`);
  console.log(`Name: ${user.name || 'n/a'}`);
  console.log(`Bio: ${user.bio || 'n/a'}`);
  console.log(`Public repos: ${user.public_repos}`);
  console.log(`Followers: ${user.followers}`);
  console.log(`Following: ${user.following}`);
  console.log(`URL: ${user.html_url}\n`);
}

export async function searchOpportunities(query) {
  const searchQuery = query || 'hiring in:body,in:title good first issue';
  console.log(`\nSearching GitHub issues for: ${searchQuery}`);
  const result = await github.searchIssues(searchQuery, 10);
  if (!result.items || result.items.length === 0) {
    console.log('No opportunities found.');
    return;
  }
  result.items.forEach((item) => {
    console.log(`\n- ${item.title}`);
    console.log(`  Repo: ${item.repository_url.replace('https://api.github.com/repos/', '')}`);
    console.log(`  URL: ${item.html_url}`);
    console.log(`  Created: ${item.created_at}`);
    console.log(`  Score: ${item.score}`);
  });
}

export async function searchJobs(query) {
  const rawQuery = query || 'remote hiring';
  console.log(`\nSearching GitHub discussions for remote roles: ${rawQuery}`);
  let result;
  try {
    result = await github.searchDiscussions(rawQuery, 10);
  } catch (err) {
    console.warn('Discussion search failed, falling back to issue search:', err.message);
    result = null;
  }

  const items = result?.items?.length ? result.items : [];
  if (items.length === 0) {
    console.log('No discussion results found; searching open issues and PRs instead.');
    const issueQuery = `${rawQuery} state:open`;
    const issueResult = await github.searchIssues(issueQuery, 10);
    if (!issueResult.items || issueResult.items.length === 0) {
      console.log('No job opportunities found.');
      return;
    }
    items.push(...issueResult.items);
  }

  items.slice(0, 10).forEach((item) => {
    console.log(`\n- ${item.title}`);
    console.log(`  Repo: ${item.repository_url ? item.repository_url.replace('https://api.github.com/repos/', '') : 'n/a'}`);
    console.log(`  URL: ${item.html_url}`);
    console.log(`  Type: ${item.pull_request ? 'Pull request/issue' : 'Discussion/issue'}`);
    if (item.body) {
      console.log(`  Snippet: ${item.body.slice(0, 160).replace(/\s+/g, ' ')}...`);
    }
  });
}

export async function suggestReadme() {
  const current = fs.existsSync(README_PATH) ? fs.readFileSync(README_PATH, 'utf8') : '';
  if (!current) {
    throw new Error('Local README.md not found.');
  }

  const prompt = [
    { role: 'system', content: 'You are an AI assistant that improves README files for a standalone AI agency workflow.' },
    { role: 'user', content: `Improve the following README to make it clearer, more usable, and better suited for a developer portfolio workflow. Preserve technical details and keep the structure concise.\n\n${current}` },
  ];

  const suggestion = await llm.createChatCompletion(prompt);
  if (!suggestion) {
    throw new Error('Failed to generate README suggestions.');
  }

  fs.writeFileSync(SUGGESTIONS_PATH, suggestion, 'utf8');
  console.log(`\nREADME improvement saved to ${SUGGESTIONS_PATH}`);
}

export async function buildPortfolio() {
  const current = fs.existsSync(README_PATH) ? fs.readFileSync(README_PATH, 'utf8') : '';
  const agency = loadAgency();
  const prompt = [
    { role: 'system', content: 'You are an AI assistant that writes a portfolio README for an AI workflow project.' },
    { role: 'user', content: `Create a polished GitHub portfolio README for this project. Include sections such as About, Mission, Skills, AI Workflow, and Contact.` },
    { role: 'user', content: `Current README content:\n\n${current}` },
    { role: 'user', content: `AI agency structure:\n\n${JSON.stringify(agency, null, 2)}` },
  ];

  const portfolio = await llm.createChatCompletion(prompt);
  if (!portfolio) {
    throw new Error('Failed to generate portfolio content.');
  }

  fs.writeFileSync(PORTFOLIO_PATH, portfolio, 'utf8');
  console.log(`\nPortfolio README generated at ${PORTFOLIO_PATH}`);
  return portfolio;
}

export async function autoUpdateReadme() {
  if (!fs.existsSync(README_PATH)) {
    throw new Error('Local README.md not found.');
  }

  if (!fs.existsSync(COVER_DIR)) {
    fs.mkdirSync(COVER_DIR, { recursive: true });
  }

  const portfolio = fs.existsSync(PORTFOLIO_PATH) ? fs.readFileSync(PORTFOLIO_PATH, 'utf8') : await buildPortfolio();
  if (!fs.existsSync(BACKUP_README_PATH)) {
    fs.copyFileSync(README_PATH, BACKUP_README_PATH);
    console.log(`Backup of current README saved to ${BACKUP_README_PATH}`);
  }

  fs.writeFileSync(README_PATH, portfolio, 'utf8');
  console.log('\nLocal README updated from generated portfolio content.');
}

export async function generateCoverLetter(company, role, description) {
  if (!company || !role) {
    throw new Error('Usage: generateCoverLetter(company, role, description)');
  }

  const current = fs.existsSync(README_PATH) ? fs.readFileSync(README_PATH, 'utf8') : '';
  const prompt = [
    { role: 'system', content: 'You are an AI assistant that writes professional cover letters for GitHub-related roles and startup projects.' },
    { role: 'user', content: `Write a tailored cover letter for ${role} at ${company}. Use the context of a GitHub startup founder who builds portfolio automation and AI workflows.` },
    { role: 'user', content: `Current README content:\n\n${current}` },
    { role: 'user', content: `Job details:\n\n${description || 'No additional job description provided.'}` },
  ];

  const letter = await llm.createChatCompletion(prompt);
  if (!letter) {
    throw new Error('Failed to generate cover letter.');
  }

  if (!fs.existsSync(COVER_DIR)) {
    fs.mkdirSync(COVER_DIR, { recursive: true });
  }

  const fileName = `${company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${role.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const filePath = path.join(COVER_DIR, fileName);
  fs.writeFileSync(filePath, letter, 'utf8');
  console.log(`\nCover letter saved to ${filePath}`);
}

export async function createIssue(ownerRepo, title, body) {
  const issue = await github.createIssue(ownerRepo, title, body);
  console.log(`Created issue: ${issue.html_url}`);
}

// Import auto-hunter functionality
import { runAutoHunter as runAutoHunterScript } from './auto-hunter.js';
export async function runAutoHunter(query, limit) {
  return runAutoHunterScript(query, limit);
}

// Import resume builder functionality
import { buildResume as buildResumeScript } from './resume-builder.js';
export async function buildProfessionalResume() {
  return buildResumeScript();
}
