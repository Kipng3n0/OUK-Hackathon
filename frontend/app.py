import os
import requests
import streamlit as st

JAC_SERVER_URL = os.getenv("JAC_SERVER_URL", "http://localhost:8000")


def init_page():
    st.set_page_config(
        page_title="SkillForge AI",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    st.markdown(
        """
        <style>
        [data-testid="stSidebar"] { display: none; }
        [data-testid="collapsedControl"] { display: none; }
        .main .block-container {
            padding-top: 1.0rem;
            max-width: 1100px;
            margin: 0 auto;
        }
        .sf-header {
            padding: 0.75rem 1.5rem;
            border-radius: 0 0 12px 12px;
            background: linear-gradient(90deg, #0f172a, #1e293b);
            color: #f9fafb;
            margin-bottom: 1rem;
        }
        .sf-title {
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 0.1rem;
        }
        .sf-subtitle {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        .sf-section-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-top: 1.0rem;
        }
        .sf-muted {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def call_walker(path: str, payload: dict | None = None):
    url = f"{JAC_SERVER_URL}/walker/{path}"
    try:
        resp = requests.post(url, json=payload or {})
        resp.raise_for_status()
        data = resp.json()
        # Jac Cloud wraps walker output as {"status": ..., "reports": [...]}.
        if isinstance(data, dict) and "reports" in data:
            reports = data.get("reports") or []
            if reports:
                return reports[0]
            return None
        return data
    except Exception as e:
        st.error(f"Error calling {path}: {e}")
        return None


def page_dashboard():
    st.markdown(
        """
        <div class="sf-header">
            <div class="sf-title">SkillForge AI  Career Dashboard</div>
            <div class="sf-subtitle">
                Track your readiness, see your path, and focus on the highest-impact skills.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        """
        <p class="sf-muted">
        SkillForge AI analyzes your current stack, compares it with real job roles, and
        builds a graph-based learning journey from where you are now to your target career.
        </p>
        """,
        unsafe_allow_html=True,
    )

    career_options = ["AI Engineer", "Data Engineer", "Web Developer", "Custom"]
    choice = st.selectbox("Target career", career_options, index=0)
    if choice == "Custom":
        target_career = st.text_input("Custom career title", value="AI Engineer")
    else:
        target_career = choice

    # Automatically compute readiness and learning path for the selected career
    score = call_walker(
        "career_readiness_agent", {"target_career_title": target_career}
    )
    path = call_walker(
        "learning_path_agent", {"target_career_title": target_career}
    )

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Career readiness")
        if isinstance(score, (int, float)):
            pct = max(0.0, min(1.0, float(score)))
            st.metric(f"Readiness for {target_career}", f"{pct * 100:.1f}%")
            st.progress(pct)
        else:
            st.write("Readiness score not available yet.")

    with col2:
        st.subheader("Recommended learning path")
        if isinstance(path, list) and path:
            for i, step in enumerate(path, start=1):
                st.write(f"{i}. {step}")
        else:
            st.write("No learning path available yet for this career.")

    st.markdown("### How SkillForge helps you")
    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown("**Skill graph intelligence**")
        st.write(
            "Map your existing skills across AI/ML, data, and web stacks, "
            "spotting missing links instantly."
        )
    with c2:
        st.markdown("**Adaptive challenges**")
        st.write(
            "Generate coding challenges at the right difficulty and get "
            "feedback from evaluation agents."
        )
    with c3:
        st.markdown("**Mentors & insights**")
        st.write(
            "See which mentors best match your path and what skills the "
            "market is demanding right now."
        )


def page_skill_graph():
    st.title("Skill Graph Snapshot")

    if st.button("Refresh skills"):
        skills = call_walker("get_skill_graph", {})
        if isinstance(skills, list) and skills:
            st.subheader("Skills in your graph")
            st.dataframe(skills)
            # Optional simple visualization of market demand
            try:
                demand = {s["name"]: s.get("market_demand", 0) for s in skills if "name" in s}
                if demand:
                    st.subheader("Market demand")
                    st.bar_chart(demand)
            except Exception:
                pass
        else:
            st.write("No skills available.")


def page_coding_challenge():
    st.title("Adaptive Coding Challenge")

    skill_options = [
        "Python",
        "JavaScript",
        "TypeScript",
        "Go",
        "Rust",
        "SQL",
        "TensorFlow",
        "Custom",
    ]
    choice = st.selectbox("Skill / Language", skill_options, index=0)
    if choice == "Custom":
        skill = st.text_input("Custom skill or language", value="Python")
    else:
        skill = choice

    level = st.selectbox("Level", ["beginner", "intermediate", "advanced"], index=0)

    if st.button("Generate challenge"):
        challenge = call_walker("content_curator_agent", {"skill_name": skill, "level": level})
        if challenge is not None:
            st.subheader("Challenge")
            if isinstance(challenge, dict):
                prompt = (
                    challenge.get("prompt")
                    or challenge.get("description")
                    or challenge.get("text")
                )
                if isinstance(prompt, str):
                    st.write(prompt)
                else:
                    st.json(challenge)
            elif isinstance(challenge, str):
                st.write(challenge)
            else:
                st.json(challenge)

    code = st.text_area("Your solution code", height=200)

    if st.button("Evaluate submission") and code.strip():
        result = call_walker(
            "evaluation_agent",
            {"code": code, "skill_name": skill, "level": level},
        )
        if result is not None:
            st.subheader("AI Feedback")
            if isinstance(result, dict):
                feedback = result.get("feedback") or result.get("summary")
                if isinstance(feedback, str):
                    st.write(feedback)
                else:
                    st.json(result)
            elif isinstance(result, str):
                st.write(result)
            else:
                st.json(result)


def page_mentor_match():
    st.title("Mentor Matching")

    if st.button("Find mentors"):
        matches = call_walker("mentor_match_agent", {})
        if matches is not None:
            st.subheader("Recommended Mentors")
            if isinstance(matches, list) and matches:
                # Sort by score descending
                try:
                    matches_sorted = sorted(
                        matches,
                        key=lambda m: m.get("score", 0),
                        reverse=True,
                    )
                except Exception:
                    matches_sorted = matches

                best = matches_sorted[0]
                st.markdown(
                    f"**Top match:** {best.get('mentor_name', 'Unknown')} "
                    f"(score {best.get('score', 0):.2f})"
                )
                st.write("Full list:")
                st.dataframe(matches_sorted)
            else:
                st.write("No mentors found yet.")


def main():
    init_page()

    if "page" not in st.session_state:
        st.session_state["page"] = "Dashboard"

    pages = [
        "Dashboard",
        "Skill Graph",
        "Coding Challenge",
        "Mentor Match",
    ]

    cols = st.columns(len(pages))
    for idx, name in enumerate(pages):
        if cols[idx].button(name):
            st.session_state["page"] = name

    st.markdown("---")

    page = st.session_state["page"]
    if page == "Dashboard":
        page_dashboard()
    elif page == "Skill Graph":
        page_skill_graph()
    elif page == "Coding Challenge":
        page_coding_challenge()
    elif page == "Mentor Match":
        page_mentor_match()


if __name__ == "__main__":
    main()
