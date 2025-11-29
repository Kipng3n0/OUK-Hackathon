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
    let user_nodes = root --> (?User);
    if not user_nodes {
        report "no_user";
    }
    let user = user_nodes[0];

    let extracted = extract_skills_from_resume(self.resume_text);
    for skill_name in extracted {
        let existing = root --> (?Skill(name == skill_name));
        let skill_node;
        if existing {
            skill_node = existing[0];
        } else {
            let created_list = root ++> Skill(
                name=skill_name,
                category="Imported",
                difficulty=5,
                market_demand=0.5
            );
            skill_node = created_list[0];
        }
        user +>: HasSkill :+> skill_node;
    }

    let history = extracted;
    let summary = create_progress_summary(history);
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
    let user_nodes = root --> (?User);
    let names = [];
    if user_nodes {
        let u = user_nodes[0];
        let skills = u --> (?HasSkill) --> (?Skill);
        for s in skills {
            names.append(s.name);
        }
    }
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
    let skills = root --> (?Skill);
    report skills;
}

walker career_readiness_agent {
    has target_career_title: str;
    can score with root entry;
}

impl career_readiness_agent.score {
    let user_nodes = root --> (?User);
    let career_nodes = root --> (?Career(title == self.target_career_title));
    if not user_nodes or not career_nodes {
        report 0.0;
    }
    let user = user_nodes[0];
    let career = career_nodes[0];

    let required_skills = (?Skill) <== (?Requires) <== career;
    let user_skills = user --> (?HasSkill) --> (?Skill);

    let total_weight = 0;
    let acquired_weight = 0;

    for rs in required_skills {
        let req_edges = rs +> (?Requires) +> career;
        if not req_edges {
            continue;
        }
        let req_edge = req_edges[0];
        let weight = req_edge.criticality;
        total_weight += weight;

        let has_it = false;
        for us in user_skills {
            if us.name == rs.name {
                has_it = true;
                break;
            }
        }
        if has_it {
            acquired_weight += weight;
        }
    }

    if total_weight == 0 {
        report 0.0;
    }
    let score = (acquired_weight as float) / (total_weight as float);
    let user = user_nodes[0];
    user.readiness_score = score;
    report score;
}

walker learning_path_agent {
    has target_career_title: str;
    can plan with root entry;
}

impl learning_path_agent.plan {
    let user_nodes = root --> (?User);
    let career_nodes = root --> (?Career(title == self.target_career_title));
    if not user_nodes or not career_nodes {
        report [];
    }
    let user = user_nodes[0];
    let career = career_nodes[0];

    let required_skills = (?Skill) <== (?Requires) <== career;
    let user_skills = user --> (?HasSkill) --> (?Skill);

    let user_skill_names = [];
    for us in user_skills {
        user_skill_names.append(us.name);
    }

    let gaps = [];
    for rs in required_skills {
        if rs.name not in user_skill_names {
            gaps.append(rs);
        }
    }

    let ordered = [];
    let visited = set();

    def dfs(skill_node: Skill) {
        if skill_node.name in visited {
            return;
        }
        visited.add(skill_node.name);
        let prereq_skills = (?Skill) <== (?PrerequisiteFor) <== skill_node;
        for ps in prereq_skills {
            dfs(ps);
        }
        ordered.append(skill_node.name);
    }

    for g in gaps {
        dfs(g);
    }

    report ordered;
}

walker market_intelligence_agent {
    can update with root entry;
}

impl market_intelligence_agent.update {
    let descriptions = [
        "We are hiring an AI Engineer with strong Python and TensorFlow skills.",
        "Looking for a Data Engineer with SQL and Python.",
        "Machine learning engineer role requiring Python, TensorFlow and SQL."
    ];

    for desc in descriptions {
        let skills = extract_skills_from_job(desc);
        for s_name in skills {
            let existing = root --> (?Skill(name == s_name));
            if existing {
                let s = existing[0];
                s.market_demand += 0.05;
            }
        }
    }

    let all_skills = root --> (?Skill);
    let max_val = 0.0;
    for s in all_skills {
        if s.market_demand > max_val {
            max_val = s.market_demand;
        }
    }
    if max_val > 0.0 {
        for s in all_skills {
            s.market_demand = s.market_demand / max_val;
        }
    }

    report "updated";
}

walker mentor_match_agent {
    can match with root entry;
}

impl mentor_match_agent.match {
    let user_nodes = root --> (?User);
    if not user_nodes {
        report [];
    }
    let user = user_nodes[0];

    let learning_skills = user --> (?Learning) --> (?LearningModule) --> (?Teaches) --> (?Skill);
    let learning_names = [];
    for s in learning_skills {
        learning_names.append(s.name);
    }

    let mentors = root --> (?Mentor);
    let results = [];

    for m in mentors {
        let expert_skills = m +> (?ExpertIn) +> (?Skill);
        let overlap = 0;
        for es in expert_skills {
            if es.name in learning_names {
                overlap += 1;
            }
        }
        let score = (overlap * 0.7) + (m.availability as float) * 0.01 + (m.rating * 0.3);
        results.append({
            "mentor_name": m.name,
            "score": score,
            "overlap": overlap
        });
    }

    report results;
}

with entry {
    root spawn seed_demo_data();
}
