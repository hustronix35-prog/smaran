# smaran

smaran turns your own notes into short recall sessions and schedules them around a deadline. You add material, set a date and a daily time limit, then answer from memory. Missed ideas can be taught from the source passage. Routine scheduling stays on your machine and does not call a model.

The product name in the app is **smaran**. The folder is `sarvam` because the tutor uses the [Sarvam](https://www.sarvam.ai/) chat API. `PRD.md` is the product specification. This file describes the prototype that is actually in the repo.

## Run it

You need Node.js 18 or newer.

1. Create `.env` in the repo root (it is gitignored):

   ```
   SARVAM_API_KEY=your_key
   ```

   Recall, planning, and progress work without a key. The teach screen needs one. The Vite dev server reads this file. Restart it after you change the key.

2. Install and start the app:

   ```bash
   cd web
   npm install
   npm run dev
   ```

3. Open [http://localhost:5180](http://localhost:5180). The port is fixed. If something else is using 5180, the server exits instead of picking another port.

On Today, choose **Try sample notes** if you want a working set before you upload anything. The sample is a short biology passage on membranes and photosynthesis, with a deadline 12 days out and a 20 minute daily limit (only if you have not set a goal yet).

`npm run build` writes a static bundle to `web/dist`. `npm run preview` serves that bundle. The teach endpoint exists only inside `npm run dev`. A production build has no `/api/teach` handler.

## A first session

1. Add material at `/upload`, or load the sample from Today.
2. Set a target date and a daily limit (5 to 120 minutes) at `/goal`.
3. Read the plan at `/plan`. If the questions do not fit the time you have, the plan says how many minutes you are short. It does not drop material.
4. Start recall at `/recall`. Type an answer, then mark it correct, partial, incorrect, or skipped.
5. If you miss an idea, open **Teach this** to talk through that unit, then return to its questions.

## Screens

| Path | What it is |
| --- | --- |
| `/` | Today: due questions, a missed-session note, and weak units |
| `/upload` | Add a text PDF, `.txt`, `.md`, or pasted text |
| `/goal` | Target date and daily study limit |
| `/plan` | Whether the workload fits the deadline (`sm-v1`) |
| `/recall` | One question at a time. `?mode=placement` is a 3-question warm-up of unseen items. `?unit=<id>` reviews one unit |
| `/teach/:unitId` | Source-grounded tutor for one missed idea |
| `/progress` | Mastery, weak units, and upcoming reviews |
| `/library` | Sources and units. Deleting a source removes its questions and answers |
| `/settings` | Name, in-app quiet hours, and a full workspace delete |

## How learning works

Uploaded text is split in the browser. Paragraphs shorter than 40 characters are skipped. At most 24 sections become units, and a PDF contributes at most the first 30 pages. Each unit gets one fill-the-gap question built from a long word in its key sentence. If no usable word is found, the question is flagged `needs_review` instead of being treated as a clean fact. The sample notes use hand-written questions.

Each question is about one minute. Today's queue is capped by the daily minute limit (15 if you have not set a goal). A second submit of the same question within 4 seconds is ignored.

Scheduling policy `sm-v1` (`web/src/lib/scheduler.js`):

| Rating | Next review |
| --- | --- |
| correct, first time | 1 day, ease +0.1 (ease stays between 1.3 and 2.8) |
| correct, second time | 3 days |
| correct, later | previous interval × ease |
| partial or skipped | 1 day |
| incorrect | 4 hours, reps reset, ease −0.2 |

A placement answer is always due again in 24 hours. A unit counts as mastered only after every one of its questions has been marked correct at least twice. One correct answer is not mastery. Missed days stay due. They are not marked finished.

The tutor sends the unit passage, the key idea, recent wrong answers, and the last few chat turns to `sarvam-105b-conversations`. The passage is treated as source text, not as instructions. Replies are capped around 90 words and must end with a check question plus `GRASPED: yes` or `no`. The browser only asks Sarvam from the teach screen.

## Data

Everything lives in `localStorage` under the key `smaran.v1` in the browser you are using. There is no account and no server database. Clearing site data, or **Delete workspace** in Settings, removes sources, questions, answers, and the plan. There is no backup.

File limits on upload: 2 MB, `.txt`, `.md`, or a PDF with selectable text. Images and scanned pages are rejected. Paste the text instead.

## Layout

```
chat.py                 one-shot Sarvam hello, separate from the app
PRD.md                  product specification
web/                    Vite + React app
web/src/pages/          screens
web/src/lib/store.js    workspace, extraction into units, progress
web/src/lib/extract.js  PDF and text reading
web/src/lib/scheduler.js  sm-v1 intervals and answer matching
web/src/lib/tutor.js    client for /api/teach
web/vite.config.js      dev server and the teach proxy
```

## Check the API key

`chat.py` is a small script that asks Sarvam to say hello. It is not part of the learning loop.

```bash
pip install sarvamai
python chat.py
```

It reads `SARVAM_API_KEY` from `.env` and prints one sentence. If the key is missing, it exits with that error.

## What this prototype does not do

Accounts, a shared backend, push or email reminders, OCR, and native apps are specified in `PRD.md` and are not in this build. Reminders are an in-app card on Today, off during quiet hours (default 23:00–07:00). Opening the card does not count as study.
