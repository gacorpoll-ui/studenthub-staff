import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import github from './github-client.js';
import * as llm from './llm-client.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const RESUME_DIR = path.join(ROOT, 'resumes');

export async function buildResume() {
  if (!fs.existsSync(RESUME_DIR)) {
    fs.mkdirSync(RESUME_DIR, { recursive: true });
  }

  console.log('🤖 AI Agency: Resume Builder Agent Started');
  
  // 1. Fetch User Data
  console.log('📊 Fetching user data and top repositories...');
  let user, repos;
  try {
    user = await github.getAuthenticatedUser();
    // Simulate getting repos (using a direct call if we had the function, or mock data for the prompt)
    console.log(`   Found profile: ${user.name || user.login}`);
  } catch (err) {
    console.error('   Error fetching GitHub profile:', err.message);
    return;
  }

  // 2. Generate Resume using AI
  console.log('🧠 Generating optimized markdown resume based on profile...');
  
  const prompt = [
    { role: 'system', content: 'You are an expert tech recruiter and resume writer.' },
    { role: 'user', content: `Please create a highly professional, ATS-friendly Markdown resume for this developer.\n\nName: ${user.name || user.login}\nGitHub: ${user.html_url}\nBio: ${user.bio || 'Software Developer'}\nPublic Repos: ${user.public_repos}\nFollowers: ${user.followers}\n\nInclude the following sections:\n1. Summary\n2. Key Skills (inferred from Bio)\n3. Professional Experience (leave placeholders if needed)\n4. Open Source Contributions (highlighting the GitHub stats)\n\nMake it look polished and ready to export to PDF.` }
  ];
  
  try {
    const resumeContent = await llm.createChatCompletion(prompt);
    
    if (resumeContent) {
      const dateStr = new Date().toISOString().split('T')[0];
      const filePath = path.join(RESUME_DIR, `Resume_${user.login}_${dateStr}.md`);
      
      fs.writeFileSync(filePath, resumeContent, 'utf8');
      console.log(`\n✅ Resume successfully generated and saved to: ${filePath}`);
    } else {
      console.log('❌ Failed to generate resume content.');
    }
  } catch (err) {
    console.error('   Error generating resume:', err.message);
  }
}
