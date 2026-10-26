# AMBIENT LEARNING --- Software Product Requirements Document

**Product:** Ambient Learning\
**Version:** 1.0\
**Status:** Proposed MVP baseline --- validation and engineering
sign-off required\
**Product owner:** Spandan / team\
**Commercial status:** Not yet validated

## 0. Purpose and scope status

This document defines the proposed product behaviour, MVP scope, users,
learning rules, data model, technical approach, testing and release
criteria.

This is a product specification, not proof that features are implemented
or that learning outcomes are validated.

-   **P0:** required for the first usable MVP.
-   **Conditional:** decide before implementation.
-   **Future:** not part of the initial release unless explicitly added.

## 1. Product overview

Ambient Learning helps people remember material they need to learn by
turning their own learning resources into short, source-grounded recall
sessions scheduled around their available time and target date.

**Core loop:** Upload Material → Extract and Structure → Build Learning
Plan → Recall → Measure Performance → Schedule Review → Retain.

**Core promise:** "Give us what you need to learn and the date you need
it by. We'll help you remember it using the small pockets of time you
already have."

The product should support learning, not merely produce summaries. It
should make it easier to start, continue and review without requiring
long uninterrupted study sessions.

### Primary outcome

A learner should be able to answer: 1. What do I need to learn by my
target date? 2. What should I practise today, and how long will it take?
3. Can I recall the key ideas without looking at the source? 4. Which
ideas am I forgetting or repeatedly getting wrong? 5. Am I on track to
cover the material before the deadline? 6. Where did each question or
explanation come from?

## 2. User problem and product principles

Learners often confuse reading or recognising information with being
able to recall it later. They may have limited study time, difficulty
deciding what to review, and no reliable way to adapt their plan when
they forget material or miss a day.

Principles: - **Recall over rereading:** prioritise answering from
memory. - **Small sessions:** make useful progress possible in short
windows. - **Deadline-aware:** plan backward from a learner's target
date. - **Source-grounded:** generated content must trace back to the
supplied material. - **Adaptive but predictable:** use answer
performance to adjust reviews. - **Low guilt:** missed sessions trigger
replanning, not punishment. - **Attention-respecting:** daily limits,
quiet hours and adjustable reminders. - **Private by default:** users
control their uploads and can delete them. - **Evidence over vanity
metrics:** measure delayed recall, not just opens or streaks.

## 3. Goals, exclusions and success criteria

### 3.1 Goals

-   Turn uploaded learning material into structured learning units and
    questions.
-   Build a review plan using deadline, available time and content
    volume.
-   Deliver short active-recall sessions.
-   Schedule reviews using deterministic spaced-repetition rules.
-   Track performance and show weak or overdue concepts.
-   Keep questions and explanations linked to source passages.
-   Validate whether users return and retain information over time.

### 3.2 Excluded unless separately approved

-   Replacing a full learning management system or course platform.
-   A public course marketplace or social learning network.
-   Open-ended AI tutoring as the core experience.
-   Continuous LLM calls for routine daily scheduling.
-   Native mobile applications in the first release.
-   Complex gamification, leaderboards or punitive streaks.
-   Guaranteed learning outcomes or exam scores.
-   Automatic access to paid books or third-party course content.
-   Advanced team, school or enterprise administration.
-   Audio, WhatsApp/Telegram delivery and browser integrations until
    validated.

### 3.3 Pilot measures

Agree targets before testing. Measure: - Onboarding completion and time
to first question. - Percentage of learners completing the first
learning session. - Day-7 return rate. - Recall accuracy on delayed
tests. - Share of generated questions supported by source material. -
Session completion time and user-reported friction. - Notification
dismissal/ignore rate, if reminders are enabled.

## 4. User roles and permissions

  -----------------------------------------------------------------------
  Role                                Responsibilities and access
  ----------------------------------- -----------------------------------
  Learner                             Upload material, set goals, answer
                                      questions, review progress and
                                      manage reminders

  Administrator                       Manage service configuration and
                                      operational issues; access user
                                      content only when authorised and
                                      necessary

  Support / reviewer                  Access limited diagnostic
                                      information under explicit access
                                      controls
  -----------------------------------------------------------------------

Permission requirements: - Users can access only their own sources,
learning units, attempts and plans. - Uploaded files are private by
default. - Deletion must cover source files and associated generated
records according to the published retention policy. - Admin access to
learning content must be restricted and auditable. - Do not expose
secrets or private source text in logs.

## 5. Information architecture

### 5.1 Learner application

1.  Home / Today's Learning
2.  Add Material
3.  Set Goal and Deadline
4.  Processing Status
5.  Learning Plan
6.  Recall Session
7.  Unit Explanation and Source
8.  Progress and Weak Areas
9.  Reminder Preferences
10. Source Library / Delete Material
11. Settings / Account

### 5.2 Core screens

-   **Home:** due reviews, estimated time, plan status and one clear
    "Start learning" action.
-   **Add material:** upload supported file, show file limits and
    processing status.
-   **Goal setup:** deadline, daily time budget and optional priority.
-   **Recall session:** one question at a time, answer input,
    reveal/check action and source-grounded feedback.
-   **Progress:** mastery by unit, reviews completed, weak areas and
    delayed-recall results.
-   **Plan status:** show when the material is too large for the
    deadline and offer clear options to increase time, reduce scope or
    change deadline.

## 6. Functional requirements

### AL-01 --- Account and private workspace (P0)

-   Provide the agreed sign-in method and session handling.
-   Associate all material and learning activity with the authenticated
    user.
-   **Acceptance:** one user cannot read or modify another user's
    records by changing a URL or request ID.

### AL-02 --- Upload and extract material (P0)

-   Accept PDF files with selectable text in the first release.
-   Validate file type and size; show upload and processing states.
-   Extract text while retaining page or section references.
-   Detect empty, unreadable or unsupported files and explain the
    problem.
-   Scanned PDF OCR is conditional/future.
-   **Acceptance:** an upload is not marked ready until extraction
    succeeds and the learner can review the result.

### AL-03 --- Structure source into learning units (P0)

-   Divide extracted content into manageable units.
-   Store unit title, key idea, source passage, page/section reference,
    estimated effort and importance.
-   Avoid presenting generated content as a direct quotation unless it
    is one.
-   Allow users to inspect the source behind a unit.
-   **Acceptance:** every generated unit has a traceable source
    reference or is clearly flagged for review.

### AL-04 --- Generate questions and explanations (P0)

-   Generate a small set of recall questions per unit.
-   Support short-answer questions first; multiple choice may be added
    if useful.
-   Provide a concise answer, explanation and source reference.
-   Flag ambiguous, unsupported or low-confidence items for review
    rather than treating them as facts.
-   **Acceptance:** quality checks reject items without adequate source
    support.

### AL-05 --- Goal and deadline setup (P0)

-   Let the learner set a target date and daily time budget.
-   Estimate total learning workload from the generated units.
-   Show whether the plan appears feasible.
-   If infeasible, offer scope, time-budget or deadline changes rather
    than silently creating an impossible plan.

### AL-06 --- Placement / initial assessment (P0)

-   Offer a short initial quiz to estimate existing familiarity.
-   Use results to prioritise review; do not treat a short quiz as a
    definitive measure of mastery.
-   Allow the learner to skip it.

### AL-07 --- Daily recall session (P0)

-   Show due questions in a clear sequence.
-   Let the learner answer before revealing the expected answer.
-   Capture answer, correctness or rating, response time where
    appropriate, and timestamp.
-   Show the explanation and source after submission.
-   Prevent duplicate submissions from creating duplicate attempts.
-   **Acceptance:** a completed answer is saved before the interface
    reports success.

### AL-08 --- Review scheduler (P0)

-   Schedule reviews using performance, prior reviews, elapsed time,
    importance and deadline.
-   Keep scheduling deterministic and testable; routine scheduling must
    not require an LLM call.
-   Wrong or uncertain answers should trigger earlier review; strong
    recall can extend the interval within configured limits.
-   Replan when sessions are missed or time budgets change.
-   **Acceptance:** the same inputs and history produce the same
    schedule.

### AL-09 --- Progress and mastery (P0)

-   Show due, completed, weak and mastered units.
-   Distinguish activity from evidence of retention.
-   Include delayed recall checks where feasible.
-   Avoid implying that a unit is permanently learned based on one
    correct answer.

### AL-10 --- Reminders and delivery (Conditional)

-   If enabled, respect quiet hours, daily caps and user preferences.
-   Reduce or pause reminders after repeated dismissal/ignoring.
-   In-app delivery is the baseline. Push, email, messaging apps and
    audio are future decisions.
-   Viewing a reminder does not count as learning completion.

### AL-11 --- Source and account controls (P0)

-   Let users view and delete uploaded material.
-   Explain what deletion removes and any applicable backup-retention
    delay.
-   Provide account export/deletion procedures according to the agreed
    policy.

## 7. Learning rules and state models

### 7.1 Learning-unit states

Proposed states: Processing, Ready, Needs Review, Active, Due,
Temporarily Deferred, Mastered, Archived.

### 7.2 Review outcomes

Proposed outcomes: Correct, Partially Correct, Incorrect, Skipped, Needs
Help. Define the exact grading rules before implementation.

### 7.3 Scheduling policy

The scheduler should consider: - Last review time and outcome. - Number
of successful and failed recalls. - Current estimated mastery. -
Importance and prerequisite relationships, if supported. - Time
remaining before the deadline. - Learner's daily time budget and
backlog.

Use a simple, versioned policy for the MVP. Do not claim scientifically
optimal scheduling without evidence. Record the policy version so
changes can be evaluated.

### 7.4 Feasibility and missed sessions

-   Estimate required time from remaining units and expected reviews.
-   If the backlog exceeds the learner's available time, surface the
    shortfall.
-   Offer prioritisation or a revised deadline.
-   Do not silently drop content or mark missed work as completed.

## 8. Logical data model

  Entity               Purpose
  -------------------- -----------------------------------------------------------
  User / Session       Identity and authentication
  SourceMaterial       Uploaded file metadata, status and ownership
  SourcePassage        Extracted text and page/section provenance
  LearningUnit         Structured concept or chunk from source
  UnitRelation         Optional prerequisite or related-unit links
  Question             Prompt, expected answer, explanation and source reference
  LearningGoal         Target date, daily budget and priority
  LearningPlan         Plan version, feasibility and status
  ScheduledReview      Unit/question, due time and scheduling metadata
  AnswerAttempt        Learner response, result and timestamp
  UnitMastery          Current estimate and supporting history
  ReminderPreference   Quiet hours, caps and channel settings
  AuditEvent           Sensitive administrative or account actions

Data requirements: - Use stable IDs and timestamps stored
consistently. - Preserve source provenance through generation. -
Separate source material from generated learning content. - Avoid
storing unnecessary personal information. - Make scheduling history
explainable and reproducible.

## 9. Technical architecture proposal

Use a simple web application and modular backend for the first release.
Confirm the exact stack after checking the existing repository and
deployment constraints.

Proposed components: - **Frontend:** responsive web app. - **Backend
API:** authenticated endpoints for uploads, learning plans, questions,
attempts and progress. - **Database:** relational database for users,
units, questions, schedules and attempts. - **File storage:** private
object storage for uploads. - **Background jobs:** extraction, one-time
content generation and scheduled reminder processing. - **AI layer:**
provider adapter for source structuring and question generation. -
**Scheduler:** deterministic application logic independent of the AI
provider. - **Monitoring:** structured logs, error tracking and
job-failure visibility.

Architecture principles: 1. Start with a modular monolith; avoid
premature microservices. 2. Keep file processing and AI generation
asynchronous. 3. Do not report processing success until results are
persisted and validated. 4. Make retries safe and prevent duplicate
learning records. 5. Keep AI output schema-validated and
source-grounded. 6. Daily reviews, scoring and scheduling should run
without LLM calls. 7. Store provider/model and prompt-version metadata
for generated content.

## 10. AI and external-service requirements

-   Use AI for one-time transformation of uploaded material, not for
    every daily interaction.
-   Use a provider adapter so the model provider can be changed.
-   Validate generated output against a defined schema.
-   Retain source references and run grounding/quality checks.
-   Treat uploaded text as data, not as instructions to the application.
-   Do not send content to optional services without disclosing the
    processing.
-   OCR, speech-to-text, text-to-speech and external messaging are
    conditional/future features.
-   API pricing, limits, data-retention terms and production
    availability must be checked before launch.

## 11. Design and usability requirements

-   Keep the interface calm, focused and distraction-light.
-   Make the next useful action obvious.
-   Optimise recall sessions for mobile-sized screens even if the MVP is
    web-first.
-   Use readable typography, clear progress states and accessible
    controls.
-   Include loading, empty, error, retry and success states.
-   Avoid streak pressure, shame-based language and misleading mastery
    scores.
-   Let users pause, change their daily budget and disable reminders.

## 12. Security, privacy and content governance

-   Enforce user-level authorisation on every read and write.
-   Store uploaded files privately and use short-lived access links
    where appropriate.
-   Validate file type, size and processing limits.
-   Protect credentials and API keys outside source control.
-   Minimise sensitive data in logs.
-   Define deletion, backup retention and export policies.
-   Tell users when third-party AI services process their content.
-   Do not assume users have rights to upload or reproduce every book or
    course; provide clear user responsibility and content-handling
    rules.
-   Do not use uploaded material for model training unless explicitly
    permitted and disclosed.

## 13. Non-functional requirements

  -----------------------------------------------------------------------
  Area                                Proposed requirement
  ----------------------------------- -----------------------------------
  Reliability                         Failed processing is visible and
                                      safely retryable

  Performance                         Common screens should feel
                                      responsive; set measured targets
                                      before launch

  Data integrity                      No duplicate attempts or schedules
                                      caused by retries

  Privacy                             Users cannot access another user's
                                      content

  Explainability                      Questions link to source passages;
                                      schedules record their rationale

  Accessibility                       Keyboard-accessible core flow and
                                      readable contrast

  Maintainability                     Automated tests, migrations and
                                      documented deployment

  Cost                                Routine daily scheduling and review
                                      must not require LLM calls

  Recovery                            Backups and a tested restore
                                      process before production use
  -----------------------------------------------------------------------

These are proposed requirements, not tested guarantees.

## 14. Testing and quality assurance

Test: - Upload validation, extraction failures and retries. - Source
references on generated units and questions. - Rejection or flagging of
unsupported questions. - Deadline feasibility calculations. - Scheduler
determinism and edge cases. - Correct/partial/incorrect answer
transitions. - Missed-session replanning. - User isolation, deletion and
permissions. - Duplicate submission and job retry behaviour. -
Responsive layout and accessibility of the recall flow.

Minimum acceptance scenarios: 1. Upload a supported PDF and view
processing status. 2. Open a learning unit and navigate to its source
passage. 3. Generate a question with a valid source reference. 4. Flag a
question that cannot be grounded. 5. Set a deadline and daily time
budget. 6. Complete a recall attempt and confirm it is saved. 7. Verify
incorrect answers are scheduled for earlier review than strong answers
under the chosen policy. 8. Replay the same scheduler inputs and receive
the same schedule. 9. Miss a session and receive a revised plan without
false completion. 10. Confirm daily scheduling works with AI calls
disabled. 11. Confirm one user cannot access another user's material.
12. Delete source material and verify the documented deletion behaviour.

**Definition of done:** P0 flows work end-to-end, source grounding and
privacy checks pass, scheduler tests pass, errors are recoverable, and
no critical defects remain open.

## 15. Delivery sequence and rollout

  -----------------------------------------------------------------------
  Phase                   Work                    Exit evidence
  ----------------------- ----------------------- -----------------------
  0\. Foundations         Repo review, auth,      Secure shell and
                          database, file storage  repeatable setup
                          and deployment          

  1\. Content pipeline    Upload, extraction,     Validated content from
                          learning units,         sample files
                          questions and source    
                          links                   

  2\. Learning loop       Goal setup, placement   End-to-end learning
                          quiz, recall sessions   plan works
                          and deterministic       
                          scheduler               

  3\. Progress            Mastery view, delayed   Retention data captured
                          recall and              
                          missed-session          
                          replanning              

  4\. Pilot hardening     Privacy review, quality Pilot acceptance
                          tests, analytics and    criteria met
                          user feedback           
  -----------------------------------------------------------------------

Start with a small cohort and a narrow use case. Do not expand into more
delivery channels before validating that learners return and recall
improves.

## 16. Decisions required before build lock

  -----------------------------------------------------------------------
  ID                      Decision                Default until confirmed
  ----------------------- ----------------------- -----------------------
  D-01                    Initial audience?       Test multiple segments
                                                  before choosing

  D-02                    Supported file types?   Text-based PDF only

  D-03                    Maximum file size and   Set conservative limits
                          length?                 after testing

  D-04                    Answer grading?         Self-rating plus simple
                                                  objective checks where
                                                  reliable

  D-05                    Scheduler algorithm?    Simple deterministic,
                                                  versioned policy

  D-06                    Initial delivery        Web app
                          surface?                

  D-07                    Reminders?              In-app only; optional
                                                  reminders later

  D-08                    AI provider/model?      Choose after quality,
                                                  privacy and cost
                                                  evaluation

  D-09                    Retention/deletion      Define before public
                          policy?                 launch

  D-10                    Initial pricing?        Do not set until
                                                  retention and value are
                                                  tested

  D-11                    OCR/audio/messaging?    Future unless pilot
                                                  evidence supports them

  D-12                    Learning-outcome claim? No guarantee; measure
                                                  delayed recall
  -----------------------------------------------------------------------

## 17. Validation plan and success criteria

1.  Recruit a small group from several candidate audiences.
2.  Ask each participant to upload real material and set a real
    deadline.
3.  Observe onboarding, first-session completion and daily use.
4.  Measure week-one return and delayed recall, not just satisfaction.
5.  Interview users who stop using the product.
6.  Improve the weakest part of the loop before adding features or
    charging.

**Proposed north-star metric:** learning units recalled correctly after
a meaningful delay per active learner per week.

Supporting metrics: - Onboarding completion. - Time to first recall
question. - Week-one retention. - Delayed recall accuracy. -
Source-grounding pass rate. - Median session duration. - User-reported
distraction and reminder fatigue.

Set numerical thresholds after the first pilot; do not invent benchmarks
before baseline data exists.

## 18. Key risks

-   **Hallucinated content:** source links, validation and user
    reporting.
-   **Weak retention:** use delayed recall tests and adjust learning
    design.
-   **Too much workload:** feasibility estimates and scope/time
    adjustments.
-   **Low repeat usage:** short sessions and interviews with inactive
    users.
-   **Notification fatigue:** optional reminders, caps and quiet hours.
-   **High AI cost:** one-time generation, batching, caching and
    deterministic daily logic.
-   **Privacy/copyright concerns:** transparent processing, private
    storage, deletion and clear upload rules.
-   **False confidence:** communicate uncertainty and avoid guaranteeing
    mastery.

## 19. Release acceptance gate

The MVP is ready for a pilot only when: - The agreed audience and pilot
protocol are defined. - Users can upload supported material and inspect
generated units. - Questions have traceable source references and
unsupported content is flagged. - Goal, deadline and daily budget
influence the plan. - Recall attempts are saved and drive deterministic
rescheduling. - Missed sessions do not silently erase work or fabricate
completion. - Privacy, access controls and deletion behaviour are
tested. - Daily scheduling works without LLM calls. - Delayed-recall and
retention events are measurable. - Critical defects are resolved and
pilot feedback can be collected.

**Core promise:** help learners turn material they already need to learn
into manageable recall sessions, then use evidence from their answers to
decide what to review next.
