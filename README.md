# Sadak-Sathi - Real-Time Highway & Road Status App

![App Logo](https://your-logo-url.com/logo.png)

Sadak-Sathi is a bilingual (Nepali-English) real-time road companion web and mobile application for Nepal. It provides live updates on highway and road conditions, nearby services, weather, AI-based travel suggestions, and more.

---

## Quick Links

[![Prod](https://img.shields.io/badge/Prod-Visit-blue?style=for-the-badge)](https://your-prod-domain.web.app)
[![Staging](https://img.shields.io/badge/Staging-Visit-orange?style=for-the-badge)](https://your-staging-domain.web.app)
[![Dev](https://img.shields.io/badge/Dev-Visit-green?style=for-the-badge)](https://your-dev-domain.web.app)

---

## Features

- Live updates for blocked, one-lane, or resumed roads and bridges  
- Voice & text search for roads and services  
- Interactive map with Google Maps integration  
- AI-powered travel assistant with real-time suggestions  
- Dark & white modes for comfortable viewing  
- Admin panel for authenticated updates  
- Multi-tab dashboard for filtering data by status and region  
- Printable reports for travelers  
- Contact info for responsible authorities  
- Offline access support  

---

## Project Setup

### 1. Clone repository

```bash
git clone https://github.com/<OWNER>/<REPO>.git
cd <REPO>
2. Install dependencies
bash
Copy code
npm ci
3. Configure Firebase
Create a Firebase project and enable Hosting

Add Service Account JSON to GitHub secrets: SERVICE_ACCOUNT_JSON

Optional: Add Firebase CI token as FIREBASE_TOKEN

4. Branches & Multi-Hosting
Branch	Hosting Target	URL
main	prod-hosting	https://your-prod-domain.web.app
staging	staging-hosting	https://your-staging-domain.web.app
develop	dev-hosting	https://your-dev-domain.web.app

Deployment Workflow
Automatically triggered on push to main, staging, or develop

Builds frontend (npm run build)

Deploys to Firebase Hosting based on branch

Deploy version generated as: vYYYYMMDDHHMMSS-<shortSHA>

Slack notifications with:

Deployment status ✅ / ❌

Branch, target, commit SHA

Deploy version

Live URL link

Rollback info if deployment fails

Automatic rollback to previous release if deploy fails

Slack Notifications & Rollback Info
All deployments send a Slack message to the configured webhook (SLACK_WEBHOOK_URL)

Success message includes: branch, target, deploy version, live URL

Failure message includes: rollback version, previous release deployed automatically

This ensures admins are always notified of the exact deployment status

Example message fields:

Field	Description
Branch	main / staging / develop
Target Hosting	prod-hosting / staging-hosting / dev-hosting
Commit SHA	Short Git SHA of the deployed commit
Version	Deploy version (timestamp + SHA)
Status	Success / Failure + rollback info
Live URL	Direct link to deployed environment

Deployment Status & Version Badges
Workflow Status



Last Deployed Version



Local Testing
Copy .env.example to .env and add your Google Maps API key if needed.

Run the development server:

bash
Copy code
npm start
Open your browser at http://localhost:3000

Contributing
Fork the repository

Create your feature branch: git checkout -b feature/my-feature

Commit your changes: git commit -m 'Add my feature'

Push to the branch: git push origin feature/my-feature

Open a Pull Request

License
This project is licensed under the MIT License. See LICENSE for details.

Contact
For any queries or assistance:
Email: banjays@gmail.com
Website: https://dor.gov.np

markdown
Copy code

### ✅ Notes:

1. Replace `<OWNER>` and `<REPO>` with your GitHub username/org and repo name.  
2. Replace Firebase URLs with your actual hosting URLs.  
3. Replace the logo URL with your app logo.  

---

This README now has:

- Clickable **Quick Links buttons** at the top  
- Deployment workflow description  
- Slack notifications & rollback info section  
- Workflow status badges + auto-updating version badges  

It’s **fully copy-paste ready** for your repository.  
