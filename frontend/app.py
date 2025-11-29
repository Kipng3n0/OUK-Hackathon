import os
import requests
import streamlit as st

JAC_SERVER_URL = os.getenv("JAC_SERVER_URL", "http://localhost:8000")


def call_walker(path: str, payload: dict | None = None):
    url = f"{JAC_SERVER_URL}/walker/{path}"
    try:
        resp = requests.post(url, json=payload or {})
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        st.error(f"Error calling {path}: {e}")
        return None


def page_dashboard():
    st.title("SkillForge AI – Career Dashboard")

    target_career = st.text_input("Target career title", value="AI Engineer")

    if st.button("Compute career readiness"):
        data = call_walker("career_readiness_agent.score", {"target_career_title": target_career})
        st.write("Raw response:", data)

    if st.button("Plan learning path"):
        data = call_walker("learning_path_agent.plan", {"target_career_title": target_career})
        st.subheader("Recommended Skill Sequence")
        st.write(data)


def page_skill_graph():
    st.title("Skill Graph Snapshot")

    if st.button("Refresh skills"):
        data = call_walker("get_skill_graph.for_user", {})
        st.write("Raw skills from backend:")
        st.json(data)


def page_coding_challenge():
    st.title("Adaptive Coding Challenge")

    skill = st.text_input("Skill", value="Python")
    level = st.selectbox("Level", ["beginner", "intermediate", "advanced"], index=0)

    if st.button("Generate challenge"):
        challenge = call_walker("content_curator_agent.generate", {"skill_name": skill, "level": level})
        st.subheader("Challenge")
        st.json(challenge)

    code = st.text_area("Your solution code", height=200)

    if st.button("Evaluate submission") and code.strip():
        result = call_walker(
            "evaluation_agent.evaluate",
            {"code": code, "skill_name": skill, "level": level},
        )
        st.subheader("AI Feedback")
        st.json(result)


def page_mentor_match():
    st.title("Mentor Matching")

    if st.button("Find mentors"):
        matches = call_walker("mentor_match_agent.match", {})
        st.subheader("Recommended Mentors")
        st.json(matches)


def main():
    st.sidebar.title("SkillForge AI")
    page = st.sidebar.radio(
        "Navigate",
        [
            "Dashboard",
            "Skill Graph",
            "Coding Challenge",
            "Mentor Match",
        ],
    )

    st.sidebar.markdown("---")
    st.sidebar.write("Backend:", JAC_SERVER_URL)

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
