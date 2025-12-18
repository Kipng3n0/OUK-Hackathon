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

node Course {
    has title: str;
    has description: str;
    has duration_hours: int;
    has difficulty_level: str;
    has provider: str;
}

node Certification {
    has name: str;
    has issuer: str;
    has validity_years: int;
    has market_value: float;
}

node JobPosting {
    has title: str;
    has company: str;
    has salary_range: str;
    has location: str;
    has posted_date: str;
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

edge Teaches {
    has effectiveness: float;  # 0.0–1.0
}

edge CertifiesSkill {
    has weight: float;  # 0.0–1.0
}

edge RequiresSkill {
    has criticality: int;  # 1–10
}

edge LeadsTo {
    has progression: float;  # 0.0–1.0
}

def extract_skills_from_resume(text: str) -> list by llm();

def generate_coding_challenge(skill: str, level: str) -> dict by llm();

def evaluate_code_submission(code: str, requirements: dict) -> dict by llm();

def create_progress_summary(history: list) -> str by llm();

def extract_skills_from_job(job_description: str) -> list by llm();

def generate_motivation_message(struggle_areas: list) -> str by llm();

walker seed_demo_data {
    obj __specs__ {
        static has auth: bool = False;
    }
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
    obj __specs__ {
        static has auth: bool = False;
    }
    can run with root entry {
        let extracted = extract_skills_from_resume(self.resume_text);
        report extracted;
    }
}

walker content_curator_agent {
    has skill_name: str;
    has level: str;
    obj __specs__ {
        static has auth: bool = False;
    }
    can run with root entry {
        let challenge = generate_coding_challenge(self.skill_name, self.level);
        report challenge;
    }
}

walker progress_mentor_agent {
    obj __specs__ {
        static has auth: bool = False;
    }
    can run with root entry {
        let names = ["Python", "TensorFlow", "SQL"];
        let text = create_progress_summary(names);
        report text;
    }
}

walker evaluation_agent {
    has code: str;
    has skill_name: str;
    has level: str;
    obj __specs__ {
        static has auth: bool = False;
    }
    can run with root entry {
        let req = {
            "skill": self.skill_name,
            "level": self.level
        };
        let result = evaluate_code_submission(self.code, req);
        report result;
    }
}

walker get_skill_graph {
    obj __specs__ {
        static has auth: bool = False;
    }
    can enter with root entry {
        report [
            {"name": "Python", "category": "AI/ML", "difficulty": 3, "market_demand": 0.9},
            {"name": "TensorFlow", "category": "AI/ML", "difficulty": 7, "market_demand": 0.8},
            {"name": "SQL", "category": "Data", "difficulty": 4, "market_demand": 0.7},
            {"name": "JavaScript", "category": "Web", "difficulty": 4, "market_demand": 0.85},
            {"name": "TypeScript", "category": "Web", "difficulty": 5, "market_demand": 0.8},
            {"name": "Go", "category": "Backend", "difficulty": 6, "market_demand": 0.75},
            {"name": "Rust", "category": "Systems", "difficulty": 8, "market_demand": 0.7}
        ];
    }
}

walker career_readiness_agent {
    has target_career_title: str;
    obj __specs__ {
        static has auth: bool = False;
    }
    can run with root entry {
        let user_skills = ["Python", "SQL"];
        let required = [];

        if self.target_career_title == "AI Engineer" {
            required = ["Python", "TensorFlow", "SQL"];
        } elif self.target_career_title == "Data Engineer" {
            required = ["Python", "SQL"];
        } elif self.target_career_title == "Web Developer" {
            required = ["JavaScript", "TypeScript", "SQL"];
        } else {
            required = ["Python"];
        }

        let total = 0;
        let matched = 0;

        for r in required {
            total += 1;
            let has_it = false;
            for u in user_skills {
                if u == r {
                    has_it = true;
                    break;
                }
            }
            if has_it {
                matched += 1;
            }
        }

        if total == 0 {
            report 0.0;
        }

        let score = float(matched) / float(total);
        report score;
    }
}

walker learning_path_agent {
    has target_career_title: str;
    obj __specs__ {
        static has auth: bool = False;
    }
    can run with root entry {
        let ordered = [];

        if self.target_career_title == "AI Engineer" {
            ordered = [
                "Python Foundations",
                "Intro to ML with TensorFlow"
            ];
        } elif self.target_career_title == "Data Engineer" {
            ordered = [
                "Python Foundations",
                "SQL for Analytics"
            ];
        } elif self.target_career_title == "Web Developer" {
            ordered = [
                "Modern JavaScript",
                "Frontend Frameworks"
            ];
        } else {
            ordered = ["Python Foundations"];
        }

        report ordered;
    }
}

walker market_intelligence_agent {
    obj __specs__ {
        static has auth: bool = False;
    }
    can run with root entry {
        report "updated";
    }
}

walker mentor_match_agent {
    obj __specs__ {
        static has auth: bool = False;
    }
    can run with root entry;
}

impl mentor_match_agent.run {
    let mentors = [
        {
            "mentor_name": "Anna Mentor",
            "expertise": ["Python", "TensorFlow", "Machine Learning"],
            "score": 0.9,
            "overlap": 3,
            "rating": 4.8,
            "availability": 85,
            "email": "codeivan593@gmail.com"
        },
        {
            "mentor_name": "Bob Guide",
            "expertise": ["SQL", "Data Engineering", "Python"],
            "score": 0.85,
            "overlap": 2,
            "rating": 4.6,
            "availability": 70,
            "email": "ipavlo953@gmail.com"
        },
        {
            "mentor_name": "Carol Expert",
            "expertise": ["JavaScript", "React", "Web Development"],
            "score": 0.75,
            "overlap": 1,
            "rating": 4.9,
            "availability": 90,
            "email": "remotasks.karan01@gmail.com"
        },
        {
            "mentor_name": "David Coach",
            "expertise": ["Cloud Architecture", "AWS", "DevOps"],
            "score": 0.65,
            "overlap": 1,
            "rating": 4.7,
            "availability": 60,
            "email": "denniskipngeno60@gmail.com"
        }
    ];
    report mentors;
}

walker mentor_connection_request {
    has user_name: str;
    has user_email: str;
    has mentor_name: str;
    has mentor_email: str;
    has message: str;
    obj __specs__ {
        static has auth: bool = False;
    }
    can run with root entry {
        let connection_data = {
            "timestamp": "now",
            "user_name": self.user_name,
            "user_email": self.user_email,
            "mentor_name": self.mentor_name,
            "mentor_email": self.mentor_email,
            "message": self.message,
            "status": "pending",
            "notification_sent": True
        };
        
        report connection_data;
    }
}

with entry {
    root spawn seed_demo_data();
}
