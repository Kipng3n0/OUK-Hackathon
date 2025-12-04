import from byllm.lib {Model}

glob llm = Model(model_name="gemini/gemini-2.0-flash");

node User {
    has name: str;
    has learning_style: str;
    has target_career: str;
    has readiness_score: float;
}

node Skill {
    has name: str;
    has category: str;
    has difficulty: int;
    has market_demand: float;
}

node Career {
    has title: str;
    has salary_range: str;
    has growth_projection: int;
}

node LearningModule {
    has title: str;
    has level: str;
    has description: str;
    has estimated_hours: int;
}

node Mentor {
    has name: str;
    has availability: int;   # 0–100
    has rating: float;       # 0.0–5.0
}

edge HasSkill {
    has proficiency: int;    # 0–100
}

edge Requires {
    has criticality: int;    # 1–10
}

edge PrerequisiteFor {
    has importance: int;     # 1–10
}

edge Teaches {
    has effectiveness: float;  # 0.0–1.0
}

edge Learning {
    has progress: int;       # 0–100
}

edge InterestedIn {
    has preference: int;     # 0–100
}

edge ExpertIn {
    has expertise_level: int;  # 1–10
}

def extract_skills_from_resume(text: str) -> list by llm();

def generate_coding_challenge(skill: str, level: str) -> dict by llm();

def evaluate_code_submission(code: str, requirements: dict) -> dict by llm();

def create_progress_summary(history: list) -> str by llm();

def extract_skills_from_job(job_description: str) -> list by llm();

def generate_motivation_message(struggle_areas: list) -> str by llm();

walker seed_demo_data {
    can run with root entry;
}

impl seed_demo_data.run {
    let user_list = root ++> User(
        name="Demo User",
        learning_style="balanced",
        target_career="AI Engineer",
        readiness_score=0.2
    );
    let user = user_list[0];

    let skill_python_list = root ++> Skill(
        name="Python",
        category="AI/ML",
        difficulty=3,
        market_demand=0.9
    );
    let skill_python = skill_python_list[0];

    let skill_tensorflow_list = root ++> Skill(
        name="TensorFlow",
        category="AI/ML",
        difficulty=7,
        market_demand=0.8
    );
    let skill_tensorflow = skill_tensorflow_list[0];

    let skill_sql_list = root ++> Skill(
        name="SQL",
        category="Data",
        difficulty=4,
        market_demand=0.7
    );
    let skill_sql = skill_sql_list[0];

    let career_list = root ++> Career(
        title="AI Engineer",
        salary_range="100k-160k",
        growth_projection=15
    );
    let career = career_list[0];

    let module_python_list = root ++> LearningModule(
        title="Python Foundations",
        level="beginner",
        description="Learn basic Python syntax and data structures.",
        estimated_hours=6
    );
    let module_python = module_python_list[0];

    let module_ml_list = root ++> LearningModule(
        title="Intro to ML with TensorFlow",
        level="intermediate",
        description="Train simple neural networks using TensorFlow.",
        estimated_hours=10
    );
    let module_ml = module_ml_list[0];

    let mentor_anna_list = root ++> Mentor(
        name="Anna Mentor",
        availability=80,
        rating=4.7
    );
    let mentor_anna = mentor_anna_list[0];

    let mentor_bob_list = root ++> Mentor(
        name="Bob Guide",
        availability=60,
        rating=4.5
    );
    let mentor_bob = mentor_bob_list[0];

    user +>: HasSkill :+> skill_python;
    user +>: HasSkill :+> skill_sql;

    skill_python +>: Requires :+> career;
    skill_tensorflow +>: Requires :+> career;
    skill_sql +>: Requires :+> career;

    skill_python +>: PrerequisiteFor :+> skill_tensorflow;

    module_python +>: Teaches :+> skill_python;
    module_ml +>: Teaches :+> skill_tensorflow;

    user +>: Learning :+> module_python;
    user +>: InterestedIn :+> career;

    mentor_anna +>: ExpertIn :+> skill_python;
    mentor_anna +>: ExpertIn :+> skill_tensorflow;
    mentor_bob +>: ExpertIn :+> skill_sql;

    report "seeded";
}

walker skill_analyzer_agent {
    has resume_text: str;
    can analyze with root entry;
}

impl skill_analyzer_agent.analyze {
    let extracted = extract_skills_from_resume(self.resume_text);
    let summary = create_progress_summary(extracted);
    report summary;
}

walker content_curator_agent {
    has skill_name: str;
    has level: str;
    can generate with root entry;
}

impl content_curator_agent.generate {
    let challenge = generate_coding_challenge(self.skill_name, self.level);
    report challenge;
}

walker progress_mentor_agent {
    can summarize with root entry;
}

impl progress_mentor_agent.summarize {
    let names = [];
    let text = create_progress_summary(names);
    report text;
}

walker evaluation_agent {
    has code: str;
    has skill_name: str;
    has level: str;
    can evaluate with root entry;
}

impl evaluation_agent.evaluate {
    let req = {
        "skill": self.skill_name,
        "level": self.level
    };
    let result = evaluate_code_submission(self.code, req);
    report result;
}

walker get_skill_graph {
    can for_user with root entry;
}

impl get_skill_graph.for_user {
    let skills = [];
    report skills;
}

walker career_readiness_agent {
    has target_career_title: str;
    can score with root entry;
}

impl career_readiness_agent.score {
    let score = 0.5;
    report score;
}

walker learning_path_agent {
    has target_career_title: str;
    can plan with root entry;
}

impl learning_path_agent.plan {
    let ordered = [];
    report ordered;
}

walker market_intelligence_agent {
    can update with root entry;
}

impl market_intelligence_agent.update {
    report "updated";
}

walker mentor_match_agent {
    can match with root entry;
}

impl mentor_match_agent.match {
    let results = [];
    report results;
}

with entry {
    root spawn seed_demo_data();
}
