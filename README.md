# Prism - Alternate Timeline Explorer

Ever wonder what would have happened if you'd said yes instead of no? Taken the other job? Sent that text? This app lets you write about something that happened to you and then shows you **5 alternate versions of reality** where things went differently. Some are only slightly different. Some go completely off the rails.

Inspired by the "Prism" device in Ted Chiang's short story *"Anxiety Is the Dizziness of Freedom"*.

---

## What You Need Before You Start

1. **Node.js** — this is what runs the app on your computer. Download it here: https://nodejs.org (click the big green button that says "LTS" and install it like any normal program).

2. **An API key** from either:
   - **OpenAI** (the ChatGPT people) — sign up at https://platform.openai.com, go to API Keys, and create one. It'll look like `sk-...`
   - **Anthropic** (the Claude people) — sign up at https://console.anthropic.com, go to API Keys, and create one. It'll look like `sk-ant-...`

   These cost a tiny amount per use (a few pence per diary entry). You'll need to add credit to your account.

---

## How to Get It Running (Step by Step)

### Step 1: Download the project

Click the green **"Code"** button at the top of this page, then click **"Download ZIP"**. Unzip it somewhere you'll remember (like your Desktop).

Or if you have Git installed, open a terminal and type:
```
git clone https://github.com/cw4444/Claude-Prism-MWI.git
```

### Step 2: Open a terminal in the project folder

- **Windows**: Open the unzipped folder, click in the address bar at the top of the File Explorer window, type `cmd`, and press Enter.
- **Mac**: Open the unzipped folder in Finder, then go to the menu bar and click **Services > New Terminal at Folder**. (Or open Terminal and type `cd ` then drag the folder into the Terminal window and press Enter.)

### Step 3: Install the app

In your terminal, type this and press Enter:
```
npm install
```

It'll download a bunch of stuff. Wait for it to finish (takes about 30 seconds). You only need to do this once.

### Step 4: Start the app

In the same terminal, type:
```
npm run dev
```

You'll see something like:
```
VITE ready in 400ms

  ➜  Local: http://localhost:5173/
```

### Step 5: Open it in your browser

Open your web browser (Chrome, Firefox, Edge, whatever) and go to:

**http://localhost:5173**

You should see the Prism app with a dark background and a text box.

### Step 6: Paste your API key

At the top of the page you'll see a settings bar. Choose your provider (Anthropic or OpenAI), then paste your API key into the key field. It'll remember it for next time.

### Step 7: Write and activate

Write something in the text box. It works best with diary-style entries about real things that happened to you — a conversation, a decision, a moment where things could have gone differently. Then hit **"Activate Prism"** and wait about 10-15 seconds.

---

## What You'll See

Five alternate timeline versions of your diary entry, each one showing:
- **Where reality branched** — the moment things diverged
- **The diary entry from that other timeline** — written in your voice, as if you lived it
- **A mood** — the emotional tone of that alternate reality
- **A divergence score** — how far that timeline drifted from what actually happened

The first timeline will be almost the same as yours. The last one might be unrecognisable.

---

## Shutting It Down

To stop the app, go back to your terminal and press **Ctrl+C**.

To start it again later, just repeat Steps 2, 4, and 5. You don't need to install again.

---

## Troubleshooting

**"npm is not recognised"** — You need to install Node.js (see "What You Need" above). After installing, close and reopen your terminal.

**The page is blank** — Make sure you went to `http://localhost:5173` (not localhost:3000). Check your terminal is still running `npm run dev`.

**"API error"** — Double-check your API key is correct and that you have credit on your OpenAI/Anthropic account.

---

Built with React + Vite. Have fun ruining your Saturday with the multiverse.
