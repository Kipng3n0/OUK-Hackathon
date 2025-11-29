# SkillForge AI – Jaseci Hackathon Project

## Overview

SkillForge AI is an intelligent career development platform built with the Jac programming language and the Jaseci stack. It models users, skills, careers, learning modules, and mentors as an Object‑Spatial (OSP) graph and uses LLMs (via byLLM) plus a set of collaborating agents to:

- **Seed and manage** a career/skill graph (skills, careers, learning modules, mentors) inside the OSP graph.
- **Analyze user skills** from resume‑like text and update the graph with detected skills.
- **Generate learning content** such as coding challenges for a given skill and level.
- **Evaluate code submissions** and return structured feedback from an AI agent.
- **Compute a career readiness score** for a target role based on graph traversals.
- **Plan a learning path** (ordered skills) using prerequisites in the OSP graph.
- **Update market demand** scores for skills from job‑style text snippets.
- **Match mentors to learners** based on overlapping skills and availability.
- **Expose walkers** as HTTP endpoints (via `jac serve`) and provide a small Streamlit dashboard as the client UI.

This repository is structured to satisfy the core hackathon requirements end‑to‑end: Jac + OSP, byLLM, multi‑agent design, and a client (Streamlit) calling walkers over HTTP.

## Repository Structure

- `backend/skillforge.jac`  – Core Jac backend
  - Node and edge archetypes for `User`, `Skill`, `Career`, `LearningModule`, `Mentor` and relationships.
  - byLLM configuration and typed functions for content generation & analysis.
  - Multi‑agent walkers (Skill Analyzer, Content Curator, Progress Mentor, Evaluation, Career Readiness, Learning Path, Market Intelligence, Mentor Match).
  - A `seed_demo_data` walker to build a small demo graph.
  - A `get_skill_graph` walker to inspect skills from the root.
- `frontend/app.py`         – Streamlit dashboard that calls Jac walkers via HTTP.
- `requirements.txt`        – Python dependencies (Jac, byLLM, Streamlit, requests).

You can extend this base into a fuller SkillForge AI system (e.g., richer analytics, additional agents, more careers/skills) as needed.

## Setup

1. **Install Python dependencies** (inside your virtualenv if you use one):

   ```bash
   pip install -r requirements.txt
   ```

2. **Configure byLLM API key**

   The backend uses `byllm.lib.Model` as in the official Jac byLLM quickstart. You must set an API key for the chosen provider (e.g., Gemini or OpenAI) before calling any byLLM‑powered functions:

   ```bash
   export GEMINI_API_KEY="your-api-key-here"   # if using the default gemini model
   # or
   export OPENAI_API_KEY="your-api-key-here"   # if you change the model to an OpenAI one
   ```

## Running the Demo Backend

### 1. Seed the Demo Graph

From the project root:

```bash
jac run backend/skillforge.jac
```

The `with entry` block at the bottom of `skillforge.jac` spawns the `seed_demo_data` walker on `root`, which:

- Creates a demo `User` node.
- Creates a few `Skill` nodes (`Python`, `TensorFlow`, `SQL`).
- Creates an `AI Engineer` `Career` node.
- Creates `LearningModule` nodes and connects them to skills.
- Connects the user to some skills, modules, and a target career using **typed edges**.

### 2. Start an API Server

To expose walkers as HTTP endpoints for use from Jac Client, Postman, or curl:

```bash
jac serve backend/skillforge.jac
```

By default, Jaseci will start an API server on `http://localhost:8000`. Walkers that have abilities marked `with root entry` are reachable as endpoints.

### 3. Run the Streamlit Frontend

In a new terminal (still inside the project root), start the dashboard:

```bash
streamlit run frontend/app.py
```

By default, it expects the Jac server at `http://localhost:8000`. To point to a different URL, set:

```bash
export JAC_SERVER_URL="http://localhost:8000"
```

Then open the URL that Streamlit prints (typically `http://localhost:8501`).

## Core Backend Design

### Graph Schema (OSP)

**Nodes**

- `User`
  - `name: str`
  - `learning_style: str`
  - `target_career: str`
  - `readiness_score: float`
- `Skill`
  - `name: str`
  - `category: str`
  - `difficulty: int`
  - `market_demand: float`
- `Career`
  - `title: str`
  - `salary_range: str`
  - `growth_projection: int`
- `LearningModule`
  - `title: str`
  - `level: str`
  - `description: str`
  - `estimated_hours: int`
- `Mentor`
  - `name: str`
  - `availability: int`
  - `rating: float`

**Edges** (named edge archetypes)

- `HasSkill` (`User` → `Skill`)
  - `proficiency: int`
- `Requires` (`Skill` → `Career`)
  - `criticality: int`
- `PrerequisiteFor` (`Skill` → `Skill`)
  - `importance: int`
- `Teaches` (`LearningModule` → `Skill`)
  - `effectiveness: float`
- `Learning` (`User` → `LearningModule`)
  - `progress: int`
- `InterestedIn` (`User` → `Career`)
  - `preference: int`
- `ExpertIn` (`Mentor` → `Skill`)
  - `expertise_level: int`

### byLLM Integration

In `backend/skillforge.jac`:

- `glob llm = Model(model_name="gemini/gemini-2.0-flash");`
- Typed byLLM functions (no manual prompt engineering needed in Jac):
  - `def extract_skills_from_resume(text: str) -> list by llm();`
  - `def generate_coding_challenge(skill: str, level: str) -> dict by llm();`
  - `def evaluate_code_submission(code: str, requirements: dict) -> dict by llm();`
  - `def create_progress_summary(history: list) -> str by llm();`
  - `def extract_skills_from_job(job_description: str) -> list by llm();`
  - `def generate_motivation_message(struggle_areas: list) -> str by llm();`

You can later refine prompts and model choices according to hackathon needs (e.g., use `agentic_ai` patterns from official docs).

### Multi-Agent Walkers

Each agent is represented as a dedicated walker whose abilities can be invoked from API clients (or other walkers):

- **Skill Analyzer Agent** – `walker skill_analyzer_agent`
  - Ability `analyze` uses `extract_skills_from_resume` to detect skills from text and updates the `HasSkill` edges in the graph, then calls `create_progress_summary` for a human‑readable summary.
- **Content Curator Agent** – `walker content_curator_agent`
  - Ability `generate` calls `generate_coding_challenge(skill_name, level)` and reports a challenge payload.
- **Progress Mentor Agent** – `walker progress_mentor_agent`
  - Ability `summarize` looks at the user’s current skills and calls `create_progress_summary` to return mentor‑style feedback.
- **Evaluation Agent** – `walker evaluation_agent`
  - Ability `evaluate` calls `evaluate_code_submission` with the user’s code and target skill/level, returning structured feedback.
- **Career Readiness Agent** – `walker career_readiness_agent`
  - Ability `score` computes a readiness score for a target career by traversing `Requires` edges and comparing against the user’s `HasSkill` edges.
- **Learning Path Agent** – `walker learning_path_agent`
  - Ability `plan` returns an ordered list of missing skills using `PrerequisiteFor` edges as a prerequisite graph.
- **Market Intelligence Agent** – `walker market_intelligence_agent`
  - Ability `update` parses mock job descriptions with `extract_skills_from_job` and updates `market_demand` on `Skill` nodes, then normalizes them.
- **Mentor Match Agent** – `walker mentor_match_agent`
  - Ability `match` scores mentors based on overlapping skills (`ExpertIn` edges), availability, and rating.

### Utility Walkers

- `walker seed_demo_data`
  - Ability `run` (with `root entry`) creates a small connected OSP graph with a demo user, skills (Python, TensorFlow, SQL), a sample career (AI Engineer), learning modules, and mentors.
- `walker get_skill_graph`
  - Ability `for_user` (with `root entry`) reports the list of `Skill` nodes reachable from `root` for visualization or inspection.

## Example API Usage (curl)

After running `jac serve backend/skillforge.jac`, you can call walkers via HTTP. The exact JSON shape can depend on your Jaseci version, but a typical pattern is:

> Note: Adjust URL paths according to the `jac serve` output if needed.

### Trigger Content Curator Agent

```bash
curl -X POST \
  http://localhost:8000/walker/content_curator_agent.generate \
  -H "Content-Type: application/json" \
  -d '{"skill_name": "Python", "level": "beginner"}'
```

### Get Skill Graph Snapshot

```bash
curl -X POST \
  http://localhost:8000/walker/get_skill_graph.for_user \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Ask the Progress Mentor for a Summary

```bash
curl -X POST \
  http://localhost:8000/walker/progress_mentor_agent.summarize \
  -H "Content-Type: application/json" \
  -d '{}'
```

(For a polished submission, you can tune these endpoints and JSON bodies according to your `jac serve` introspection or Postman tests.)

## Mapping to Hackathon Requirements

- **Jac + OSP graph**: Custom `User`, `Skill`, `Career`, `LearningModule`, and `Mentor` nodes and named edges `HasSkill`, `Requires`, `PrerequisiteFor`, `Teaches`, `Learning`, `InterestedIn`, `ExpertIn`.
- **Non‑trivial OSP usage**:
  - `career_readiness_agent.score` traverses `Requires` and `HasSkill` edges to compute a weighted readiness score.
  - `learning_path_agent.plan` walks the `PrerequisiteFor` graph to build an ordered skill sequence.
  - `mentor_match_agent.match` uses `ExpertIn` edges and learning links to rank mentors.
- **byLLM integration**: Global `Model` instance plus multiple byLLM functions for both generative and analytical uses (resume skill extraction, challenge generation, code evaluation, progress summaries, job skill extraction, motivation messages).
- **Multi‑agent design**: Eight clearly defined agents (Skill Analyzer, Content Curator, Progress Mentor, Evaluation, Career Readiness, Learning Path, Market Intelligence, Mentor Match) with documented responsibilities.
- **Frontend / client**:
  - Streamlit dashboard (`frontend/app.py`) calling Jac walkers via HTTP (`call_walker` helper).
  - Pages: Dashboard (career readiness + learning path), Skill Graph snapshot, Coding Challenge (generate + evaluate), Mentor Match.
- **Data & evaluation**:
  - `seed_demo_data` creates a realistic mini‑graph (demo user, skills, modules, career, mentors) for demo and testing.
  - Career readiness score and learning path length can be used as simple evaluation metrics.

You can further enhance this base by adding more careers/skills, richer prompts, and advanced graph algorithms, but the current scaffold already demonstrates the full SkillForge AI concept in a hackathon‑friendly, runnable form.
