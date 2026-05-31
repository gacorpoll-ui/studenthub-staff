const fs = require('fs');
const path = require('path');
const github = require('./github-client');
const llm = require('./llm-client');

const AGENTS_PATH = path.join(__dirname, 'agents.json');
const README_PATH = path.join(__dirname, '..', 'README.md');
const SUGGESTIONS_PATH = path.join(__dirname, 'readme-suggestions.md');

function loadAgency() {
  if (!fs.existsSync(AGENTS_PATH)) {
    throw new Error('Missing ai-agency/agents.json');
  }
  return JSON.parse(fs.readFileSync(AGENTS_PATH, 'utf8'));
}

function preview() {
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

async function profile() {
  const user = await github.getAuthenticatedUser();
  console.log(`\nGitHub profile: ${user.login}`);
  console.log(`Name: ${user.name || 'n/a'}`);
  console.log(`Bio: ${user.bio || 'n/a'}`);
  console.log(`Public repos: ${user.public_repos}`);
  console.log(`Followers: ${user.followers}`);
  console.log(`Following: ${user.following}`);
  console.log(`URL: ${user.html_url}\n`);
}

async function searchOpportunities(query) {
  const searchQuery = query || 'hiring in:body,in:title good first issue';
  console.log(`\nSearching GitHub issues for: ${searchQuery}`);
  const result = await github.searchIssues(searchQuery, 10);
  if (!result.items || result.items.length === 0) {
    console.log('No opportunities found.');
    return;
  }
  for (const item of result.items) {
    console.log(`\n- ${item.title}`);
    console.log(`  Repo: ${item.repository_url.replace('https://api.github.com/repos/', '')}`);
    console.log(`  URL: ${item.html_url}`);
    console.log(`  Created: ${item.created_at}`);
    console.log(`  Score: ${item.score}`);
  }
}

async function suggestReadme() {
  const current = fs.existsSync(README_PATH) ? fs.readFileSync(README_PATH, 'utf8') : '';
  if (!current) {
    throw new Error('Root README.md not found.');
  }

  const prompt = [
    { role: 'system', content: 'You are an AI assistant that improves GitHub repository README files for a personal startup portfolio and AI agency.' },
    { role: 'user', content: `Improve the following README to make it clearer, more job-ready, and more attractive for GitHub visitors. Preserve technical details and keep the structure concise. Here is the current content:\n\n${current}` },
  ];

  const suggestion = await llm.createChatCompletion(prompt);
  if (!suggestion) {
    throw new Error('Failed to generate README suggestions.');
  }

  fs.writeFileSync(SUGGESTIONS_PATH, suggestion, 'utf8');
  console.log(`\nREADME improvement saved to ${SUGGESTIONS_PATH}`);
}

async function createIssue(ownerRepo, title, body) {
  const issue = await github.createIssue(ownerRepo, title, body);
  console.log(`Created issue: ${issue.html_url}`);
}

module.exports = {
  preview,
  profile,
  searchOpportunities,
  suggestReadme,
  createIssue,
};
