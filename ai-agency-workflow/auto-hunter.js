import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import github from './github-client.js';
import * as llm from './llm-client.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const COVER_DIR = path.join(ROOT, 'cover-letters');

export async function runAutoHunter(query, limit = 5) {
  if (!fs.existsSync(COVER_DIR)) {
    fs.mkdirSync(COVER_DIR, { recursive: true });
  }

  console.log('🤖 AI Agency: Auto Job Hunter Agent Started');
  
  // 1. Get user profile
  console.log('📊 Fetching user profile...');
  let userProfile = "";
  try {
    const user = await github.getAuthenticatedUser();
    userProfile = `User: ${user.login}\nBio: ${user.bio || 'Developer'}\nRepos: ${user.public_repos}`;
    console.log(`   Found profile for ${user.login}`);
  } catch (err) {
    console.log('   Warning: Could not fetch profile (missing/invalid token). Using generic profile.');
    userProfile = 'Developer looking for remote AI/Software Engineering roles.';
  }

  // 2. Search for jobs/issues
  const searchQuery = query || 'is:issue is:open label:"good first issue" AI';
  console.log(`🔍 Searching opportunities: "${searchQuery}"...`);
  
  let issues;
  try {
    const result = await github.searchIssues(searchQuery, limit);
    issues = result.items || [];
    console.log(`   Found ${issues.length} potential opportunities.`);
  } catch (err) {
    console.error('   Error searching issues:', err.message);
    return;
  }

  if (issues.length === 0) return;

  // 3. Evaluate and generate cover letters
  console.log('\n🧠 Analyzing opportunities and generating application materials...');
  
  for (const issue of issues) {
    console.log(`\nEvaluating: ${issue.title} (${issue.html_url})`);
    
    // Evaluate fit using AI
    const evalPrompt = [
      { role: 'system', content: 'You are an AI recruitment assistant. Evaluate if the candidate profile matches the job/issue description.' },
      { role: 'user', content: `Candidate Profile:\n${userProfile}\n\nJob/Issue Title: ${issue.title}\nDescription snippet: ${issue.body?.substring(0, 500) || 'No description'}\n\nDoes this look like a good fit? Answer with exactly YES or NO, followed by a brief 1-sentence reason.` }
    ];
    
    const evaluation = await llm.createChatCompletion(evalPrompt);
    console.log(`   Fit Analysis: ${evaluation}`);
    
    if (evaluation && evaluation.trim().toUpperCase().startsWith('YES')) {
      console.log('   ✅ Strong match found! Generating cover letter/proposal...');
      
      const coverPrompt = [
        { role: 'system', content: 'You are an expert technical writer crafting a personalized cover letter or proposal for a GitHub issue/job.' },
        { role: 'user', content: `Write a concise, professional cover letter for this opportunity.\n\nCandidate Profile: ${userProfile}\n\nOpportunity Title: ${issue.title}\nDetails: ${issue.body?.substring(0, 1000) || 'No details'}\n\nKeep it under 3 paragraphs. Focus on how the candidate can help.` }
      ];
      
      const coverLetter = await llm.createChatCompletion(coverPrompt);
      
      const safeFileName = issue.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
      const filePath = path.join(COVER_DIR, `proposal_${safeFileName}_${issue.number}.md`);
      
      const content = `# Proposal for: ${issue.title}\nURL: ${issue.html_url}\n\n${coverLetter}`;
      fs.writeFileSync(filePath, content, 'utf8');
      
      console.log(`   📄 Saved proposal to: ${filePath}`);
    } else {
      console.log('   ❌ Skipped (Not a strong match)');
    }
  }
  
  console.log('\n🎉 Auto Job Hunter finished its run.');
}
