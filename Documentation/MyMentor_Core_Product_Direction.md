# My Mentor — Core Product Direction

## Product Vision

My Mentor is a calm daily recovery companion designed to help users take one healthy step at a time through guided reflection, emotional support, and structured mentorship.

The app should feel:
- emotionally safe
- calm
- supportive
- wise
- modern
- premium
- deeply personal

The app should NOT feel like:
- a corporate LMS
- a rehab admin dashboard
- a social media app
- a noisy startup product

Core emotional philosophy:

> “Help the user take one healthy step today.”

---

# Core Product Identity

My Mentor is NOT:
- simply an ebook reader
- an online course platform
- a social network
- a clinical system

It IS:
- a guided recovery companion
- a structured healing journey
- a mentor-supported emotional growth system
- a daily support environment

---

# First Visit Philosophy

The first visit must be:
- tiny
- calm
- non-overwhelming
- emotionally safe

Do NOT overload the user with:
- dashboards
- stats
- complex setup
- large menus
- too many features

---

# First Visit Flow

1. Welcome
2. Choose display style
3. Choose guidance style
4. How are you feeling today?
5. Optional: Start first session

---

# Anonymous / Private Nickname System

Anonymous does NOT mean invisible to the system.

It means:
- hidden from other users
- emotionally private
- minimal identity exposure

Recommended wording:

“How would you like to appear?”

Options:
- Use my real name
- Use a private nickname

Examples:
- QuietSteps
- Gentle Tide
- Morning Path
- Calm Horizon

The system still stores:
- auth account
- progress
- journals
- mood history
- lesson progress

Example profile table:

profiles
- id
- user_id
- display_name
- is_anonymous
- guidance_path
- avatar_url
- created_at

Frontend displays:
“Good evening, QuietSteps 🌱”

---

# Core User Experience

The app should feel like:
“A trusted mentor walking beside you every day.”

The app should NOT try to solve the user’s entire life immediately.

Instead:
- one session
- one reflection
- one healthy step
- one calm interaction at a time

---

# After Onboarding

After onboarding the user should land on:

# TODAY

Not “Dashboard”.

The Today screen is:
- calm
- minimal
- emotionally grounding

Example layout:

Good evening, QuietSteps 🌱

You’ve already taken a meaningful step today.

How are you feeling right now?

Today’s Gentle Step:
“Learning to pause before reacting.”

Estimated time: 3 minutes

[ Start Session ]

“You do not need to solve your whole life today.”

---

# Lesson Structure

Lessons should NOT be giant text walls.

Lessons are built from blocks:

- welcome message
- reading section
- mentor note
- video/audio
- Pause & Reflect card
- journal prompt
- mood check-in
- daily action
- complete button

---

# Core Product Structure

Journey → Chapter → Lesson → Content Blocks

Example:

Journey:
Uprooting Drug Abuse

Chapter:
Week 1 – Understanding the Battle

Lesson:
You Are Not Alone

Blocks:
- reading
- mentor note
- reflection question
- journal prompt
- daily action

---

# Dual Guidance Path System

The platform supports:
- Christian Guided Version
- Religious Guidance Version

The architecture must support:
- alternate lesson content
- alternate reflection prompts
- alternate mentor guidance
- alternate media

---

# Communication System Concept

The communication system is NOT an open public social network.

It is:
- structured support communication
- guided recovery interaction
- mentor-supported connection
- emotionally safe peer interaction

The system focuses on:
- encouragement
- accountability
- crisis interruption
- emotional support
- guided discussion

Goal:
“Someone is walking beside me during difficult moments.”

---

# Safe Communication Philosophy

Messages should be checked BEFORE being sent.

Concept:
Live Safety Filtering

Flow:
User types message
↓
System analyzes message
↓
Risk score calculated
↓
Unsafe messages blocked or rewritten
↓
Safe messages allowed

Purpose:
Protect vulnerable users from:
- discouragement
- manipulation
- triggering language
- threats
- harmful advice

---

# Roles

Phase 1 roles:

- User
- Mentor
- Moderator
- Admin

No ranking system in traditional competitive form.

Avoid:
- leaderboards
- comparison systems
- “top addict” style gamification

Instead:
- gentle progress identities
- encouragement milestones
- trust-based progression

---

# Community Philosophy

Do NOT create giant chaotic public chatrooms.

Preferred direction:
- small guided circles
- mentor-led discussions
- emotionally safe interaction
- structured support spaces

---

# Design Philosophy

The app should feel:
- elegant
- reflective
- warm
- safe
- premium
- quiet
- emotionally breathable

Like:
- a calm reading room
- a meditation app
- a trusted mentor space

---

# Color Palette

## Warm Sand
#F6F3ED

## Soft Sage
#7A9272

## Deep Forest
#32453B

## Mist Stone
#E8E5DF

## Warm Cream
#FBF9F5

## Muted Gold
#C7A86D

## Dust Rose
#A97B7B

Primary Text:
#1F2A24

Secondary Text:
#6E746F

---

# Technical Stack

Frontend:
- Next.js 14/15
- TypeScript
- Tailwind CSS
- Framer Motion

Backend:
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

Architecture:
- PWA first
- mobile-first responsive design
- app-wrapper ready later

Hosting:
- Vercel
- Supabase

Future AI:
- moderation
- safety filtering
- support systems

---

# Build Order

1. Landing page
2. Login/Register
3. Onboarding
4. Today screen
5. Journey overview
6. Lesson player
7. Journal
8. Progress
9. Resources
10. Admin CMS

---

# Final Core Principle

The app should never feel overwhelming.

It should feel like:

“A calm recovery lantern in a dark hallway.”
