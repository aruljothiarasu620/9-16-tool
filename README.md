# 🚀 InstaFlow — Instagram Automation Builder

> **Live Demo:** [https://makecom-azure.vercel.app](https://makecom-azure.vercel.app)
> **GitHub Repository:** [https://github.com/aruljothiarasu620/9-16-tool](https://github.com/aruljothiarasu620/9-16-tool)

---

## What Was Built

A full-featured Instagram Automation Builder inspired by Make.com, built with **Next.js 14/15**, **React Flow**, and **Zustand**.

---

## Pages & Features

### 1. 🏠 Dashboard
- Stats cards: Total scenarios, Active, Successful runs, Failed runs
- Scenario cards with status badges, last run time, module count
- Toggle to enable/disable each scenario
- Recent Run History panel with color-coded log entries
- Create New Scenario modal with name input
- Delete confirmation modal

---

### 2. 🔧 Scenario Builder
- **Drag-and-drop** React Flow canvas with grid background
- Left sidebar with categorized modules:
  - **Triggers**: Schedule, Webhook
  - **Actions**: Carousel Post, Single Post, Reel, Caption+Tags, Tag Location
  - **Logic**: If/Else
- Custom animated **connection lines** between nodes
- Click any node → **right panel** config form opens
- Top bar: editable scenario name, Run ▶, Save, Logs buttons
- **Live execution** with step-by-step log panel
- MiniMap + zoom controls

---

### 3. 📸 Instagram Connect
- **Facebook OAuth 2.0** login flow (real Graph API)
- **Manual token** entry fallback
- Permissions required: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`
- Shows connected account with profile pic, username, follower count
- Permission status badges
- Disconnect button
- "What You Can Automate" feature grid

---

### 4. ⚙️ Settings
- Facebook App ID + App Secret fields (required for OAuth)
- Step-by-step setup instructions
- Connected accounts management (add/remove)
- Notification preferences toggle (on success / on failure)
- Email notification field
- Usage statistics panel

---

## Module Configuration Fields

| Module | Config Fields |
|--------|--------------|
| **Schedule** | Interval (hourly/daily/weekly), Time picker, Day of week, Timezone |
| **Webhook** | Auto-generated URL, HTTP method, Secret key |
| **Carousel Post** | Up to 10 image URLs, Caption, Hashtags, Schedule time |
| **Single Post** | Image URL, Caption, Hashtags |
| **Reel** | Video URL, Cover image, Caption, Share to feed toggle |
| **Caption + Tags** | Caption, Hashtags, Mentions (@username) |
| **Tag Location** | Location name, Latitude, Longitude |
| **If / Else** | Condition variable, Operator, Value |

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 15** (App Router) | Framework |
| **React Flow** | Drag-and-drop canvas |
| **Zustand** (persisted) | Global state management |
| **Facebook SDK** | Instagram OAuth |
| **Vanilla CSS** | Dark theme design system |
| **Inter font** | Typography |

---

## Instagram API Setup

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create a new app → Add **Instagram** + **Facebook Login** products
3. Set OAuth redirect URI: `https://makecom-azure.vercel.app` (or `http://localhost:3000` for local testing)
4. Add permissions: `instagram_basic, instagram_content_publish, pages_read_engagement, pages_manage_posts`
5. Copy **App ID** → paste in **Settings → API Credentials**
6. Go to **Instagram Connect** → click **Continue with Facebook**

> **Tip:** Use the **Manual Token** option to connect immediately using an Instagram Graph API token from the Graph API Explorer.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with sidebar
│   ├── page.tsx            # Dashboard
│   ├── globals.css         # Full design system CSS
│   ├── builder/page.tsx    # Scenario builder (React Flow)
│   ├── instagram/page.tsx  # Instagram OAuth connect
│   └── settings/page.tsx   # API credentials & settings
├── components/
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── FlowNode.tsx        # Custom React Flow node
│   └── ModuleConfigPanel.tsx # Right-click config panel
└── lib/
    ├── store.ts            # Zustand persisted store
    └── utils.ts            # Module config + helpers
```
