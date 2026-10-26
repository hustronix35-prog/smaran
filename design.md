# smaran design

Visual source: `design system.png`. The product name in the interface is **smaran**. The tagline is **LEARN IT. KEEP IT.**

The interface should feel like a calm study tool. One next action is obvious. Copy is specific and short. Missed work is described as still due, never as a failure or a broken streak.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#101C25` | Text, primary buttons, recall surface |
| Recall lime | `#D7F078` | Mark, progress fill, check emphasis, text on ink |
| Warm paper | `#F7F6F0` | Page field behind cards |
| App background | `#F3F1EA` | Page background |
| Card | `#FFFCF7` | Cards and panels |
| Mist | `#A8B9C3` | Quiet supporting colour |
| Success | `#237A57` | Mastery ring, correct feedback |
| Warning | `#A86618` | Plan shortfall, slipped session |
| Danger | `#B94141` | Delete, invalid input, needs review |
| Info | `#3869A8` | Text links |
| Muted text | `#5B656C` | Secondary copy |
| Border | `#DCE1D8` | Cards, inputs, pills |
| Ink soft | `#1C313F` | Primary button hover |

Do not introduce a second palette. No decorative gradients, glass, or floating shapes. The only gradient is the mastery ring, which encodes a number.

Shadows stay light: `0 10px 28px rgba(16, 28, 37, 0.05)`.

## Type

Inter, with Noto Sans as the fallback so Indic text stays readable.

| Role | Size / weight |
| --- | --- |
| Display number | 40 / 600 |
| Page title | 32 / 600 |
| Section title | 20 / 600 |
| Body | 16 / 400 |
| Secondary | 14 / 400 |
| Label | 12 / 600, uppercase, tracked |

Titles use a slight negative letter-spacing. Body line length stays near 60 characters. Labels are uppercase; sentences are not.

## Space and shape

Spacing uses 4, 8, 12, 16, 24, 32. Controls are 12px radius and at least 44px tall. Cards are 16px. The recall panel and large panels are 24px. Pills and nav items are fully rounded.

## Mark and chrome

The mark is a lime rounded square with an ink arc. Beside it: **smaran**, then **LEARN IT. KEEP IT.** in small tracked type.

Desktop navigation sits in the top bar: Today, Material, Plan, Progress, Library, and a settings icon. Below 800px the top links hide and a bottom bar shows Today, Add, Learn, and Progress. During recall and teaching the bottom bar hides so the answer buttons are not covered.

Focus is a 2px ink outline. On the dark recall field, focus is lime.

## Components

**Primary button.** Ink fill, paper text. One primary action per view.

**Secondary and ghost.** White or transparent, ink text, border `#DCE1D8`.

**Lime button.** Lime fill, ink text. Used on the dark recall surface for Reveal and “I recalled it”.

**Destructive.** White fill, danger text, pale red border. Delete always asks for a second confirmation.

**Cards.** Warm card fill, 1px border, 16px radius. A warning card uses a pale amber ground. A dark card uses ink and paper text for the in-app reminder.

**Pills.** Due is lime. Scheduled is grey. Mastered is green. Needs review is red. Ready is blue.

**Inputs.** White, 12px radius, border `#DCE1D8`. Invalid fields use the danger border and a short error under the field.

**Progress.** A thin lime bar, or a success ring with the percent in the centre. The caption says one correct answer is not mastery.

## Screens

**Today.** Greeting, deadline as a large day count, mastery, and the next review with a Learn button. If something was missed, a banner says the work is still due. Weak topics are listed with **Teach me this**. The reminder card can be dismissed for the visit. Dismissing it does not count as study.

**Add material.** Segmented control: PDF, Text, Image. PDF and text accept a drop zone or a paste area. Image explains that scans are not supported. Limits (2 MB, text-based PDF, TXT, MD) are visible before upload.

**Deadline.** One date and a daily-minute slider labelled with the approximate question count. The action is **Create plan**.

**Plan.** States the workload and whether it fits. A shortfall offers more time, a later date, or a smaller library. It does not drop material on its own.

**Recall.** One dark panel. Eyebrow `One question · 01`. The question, a prompt to answer before revealing, then the source after reveal. Rating is **I recalled it**, **Partly**, or **Not yet**. A miss offers **Teach me this**.

**Teach.** Paper thread. Tutor bubbles sit left; the learner’s reply sits right on ink. The check question is its own lime-tinted card. Hint and Simpler are secondary. When the idea lands, the screen says to practise it and does not claim mastery.

**Progress.** Ring, weak units, topic list, and a calendar of upcoming reviews.

**Library.** Each source lists units. A unit opens onto its passage, page, and questions.

**Settings.** Name, quiet hours, and delete workspace. Deletion copy says there is no backup.

## Writing

Use the learner’s material in the interface. Do not use placeholder copy. Do not use emoji as icons. Icons are simple line icons at 18px.

Avoid shame, streaks, and scores that claim a unit is permanently learned. “Not yet” is the incorrect rating. “A session slipped” is the missed-day line.
