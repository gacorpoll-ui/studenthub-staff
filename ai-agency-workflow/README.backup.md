# AI Agency Workflow

A standalone AI agency workflow for GitHub profile automation, portfolio generation, and remote job discovery.

## What it does

This project provides a self-contained CLI that can:

- inspect GitHub profile details
- search GitHub issues and discussions for job opportunities
- generate a portfolio README draft
- update the local README with portfolio content
- create tailored cover letters for roles
- create GitHub issues programmatically

## Setup

1. Open `ai-agency-workflow`:

```bash
cd ai-agency-workflow
```

2. Install dependencies:

```bash
npm install
```

3. Set your environment variables:

```bash
setx GITHUB_TOKEN "your_github_token"
setx OPENAI_API_KEY "your_openai_key"
```

4. Use the CLI:

```bash
npm run preview
npm run profile
npm run search "hiring remote javascript"
npm run jobs "remote github jobs"
npm run portfolio
npm run update-readme
npm run cover-letter "Acme Corp" "AI Product Manager" "Lead product development for AI-powered tools"
```

## Notes

This project is separate from the main `studenthub-staff` app and is intended as an independent AI tooling workflow. It can be migrated to its own repository later if desired.
