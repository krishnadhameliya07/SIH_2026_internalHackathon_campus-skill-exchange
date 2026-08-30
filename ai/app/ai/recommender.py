"""
Campus Skill Exchange - AI Recommendation Engine

Hybrid and explainable recommendation system combining:

1. TF-IDF semantic similarity
2. Normalized skill matching
3. Interest matching
4. Complementary skill matching
5. Skill-gap detection
6. Teaching / learning opportunities
7. Bidirectional skill-exchange scoring
8. Explainable recommendations

The output keeps compatibility with the existing project by providing:

    student_id
    student_name
    match_score
    match_details
    why_match
"""

from __future__ import annotations

from typing import Any, Dict, List, Set, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# =========================================================
# SKILL NORMALIZATION
# =========================================================

SKILL_ALIASES = {
    "ml": "machine learning",
    "machine learning": "machine learning",
    "machine-learning": "machine learning",
    "machinelearning": "machine learning",

    "ai": "artificial intelligence",
    "artificial intelligence": "artificial intelligence",
    "artificial-intelligence": "artificial intelligence",

    "dl": "deep learning",
    "deep learning": "deep learning",
    "deep-learning": "deep learning",

    "py": "python",
    "python programming": "python",

    "js": "javascript",
    "javascript programming": "javascript",

    "reactjs": "react",
    "react.js": "react",

    "nodejs": "node",
    "node.js": "node",

    "data analytics": "data analysis",
    "data-analysis": "data analysis",

    "nlp": "natural language processing",
    "natural-language-processing": "natural language processing",

    "cv": "computer vision",
    "computer-vision": "computer vision",

    "sql database": "sql",
    "sql db": "sql",

    "ui/ux": "ui design",
    "ui ux": "ui design",
    "ux design": "user experience",
}


def normalize_skill(skill: Any) -> str:
    """
    Convert a skill into a normalized representation.
    """

    if skill is None:
        return ""

    value = str(skill).strip().lower()

    value = value.replace("_", " ")
    value = value.replace("-", " ")

    value = " ".join(value.split())

    return SKILL_ALIASES.get(value, value)


def normalize_items(items: Any) -> Set[str]:
    """
    Convert skills/interests from different formats into a set.
    """

    if items is None:
        return set()

    if isinstance(items, str):
        items = [items]

    if not isinstance(items, (list, tuple, set)):
        return set()

    result = set()

    for item in items:
        normalized = normalize_skill(item)

        if normalized:
            result.add(normalized)

    return result


# =========================================================
# PROFILE EXTRACTION
# =========================================================

def get_student_skills(student: Dict[str, Any]) -> Set[str]:
    """
    Extract skills while supporting multiple possible field names.
    """

    skills = student.get("skills")

    if skills is None:
        skills = student.get("skill", [])

    return normalize_items(skills)


def get_student_interests(student: Dict[str, Any]) -> Set[str]:
    """
    Extract interests while supporting multiple possible field names.
    """

    interests = student.get("interests")

    if interests is None:
        interests = student.get("interest", [])

    return normalize_items(interests)


def get_student_name(student: Dict[str, Any]) -> str:
    """
    Safely determine the student's display name.
    """

    return (
        student.get("name")
        or student.get("username")
        or student.get("full_name")
        or student.get("student_name")
        or "Unknown Student"
    )


# =========================================================
# TEXT REPRESENTATION
# =========================================================

def get_student_text(student: Dict[str, Any]) -> str:
    """
    Convert skills and interests into text for TF-IDF.
    """

    skills = get_student_skills(student)
    interests = get_student_interests(student)

    return " ".join(
        sorted(skills | interests)
    )


# =========================================================
# TF-IDF SIMILARITY
# =========================================================

def calculate_tfidf_similarity(
    source_text: str,
    candidate_text: str
) -> float:
    """
    Calculate cosine similarity between two profiles.
    """

    if not source_text.strip():
        return 0.0

    if not candidate_text.strip():
        return 0.0

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2)
    )

    try:
        matrix = vectorizer.fit_transform(
            [source_text, candidate_text]
        )

        score = cosine_similarity(
            matrix[0:1],
            matrix[1:2]
        )[0][0]

        return float(score)

    except ValueError:
        return 0.0


# =========================================================
# OVERLAP
# =========================================================

def calculate_overlap(
    source_items: Set[str],
    candidate_items: Set[str]
) -> Tuple[Set[str], float]:
    """
    Calculate direct overlap.

    Score is based on how much of the source profile
    is represented in the candidate profile.
    """

    shared = source_items.intersection(
        candidate_items
    )

    if not source_items:
        return shared, 0.0

    score = len(shared) / len(source_items)

    return shared, min(float(score), 1.0)


# =========================================================
# COMPLEMENTARY SKILLS
# =========================================================

COMPLEMENTARY_SKILLS = {
    "python": {
        "machine learning",
        "data analysis",
        "deep learning",
        "django",
        "flask",
        "data science",
        "statistics",
    },

    "machine learning": {
        "python",
        "deep learning",
        "data analysis",
        "statistics",
        "data science",
        "tensorflow",
        "pytorch",
    },

    "deep learning": {
        "python",
        "machine learning",
        "tensorflow",
        "pytorch",
        "computer vision",
        "natural language processing",
    },

    "data analysis": {
        "python",
        "machine learning",
        "data science",
        "statistics",
        "sql",
    },

    "data science": {
        "python",
        "machine learning",
        "data analysis",
        "statistics",
        "sql",
    },

    "web development": {
        "javascript",
        "react",
        "node",
        "django",
        "python",
        "html",
        "css",
    },

    "javascript": {
        "react",
        "node",
        "web development",
        "html",
        "css",
    },

    "react": {
        "javascript",
        "node",
        "web development",
        "ui design",
    },

    "graphic design": {
        "ui design",
        "figma",
        "photoshop",
        "user experience",
    },

    "ui design": {
        "graphic design",
        "figma",
        "user experience",
        "photoshop",
    },

    "user experience": {
        "ui design",
        "graphic design",
        "figma",
    },
}


def calculate_complementary_score(
    source_skills: Set[str],
    candidate_skills: Set[str]
) -> Tuple[Set[str], float]:
    """
    Find complementary skills possessed by the candidate.
    """

    complementary_matches = set()

    for source_skill in source_skills:

        related_skills = COMPLEMENTARY_SKILLS.get(
            source_skill,
            set()
        )

        complementary_matches.update(
            related_skills.intersection(
                candidate_skills
            )
        )

    if not source_skills:
        return complementary_matches, 0.0

    score = (
        len(complementary_matches)
        / len(source_skills)
    )

    return (
        complementary_matches,
        min(float(score), 1.0)
    )


# =========================================================
# SKILL EXCHANGE / SKILL GAP
# =========================================================

def calculate_skill_exchange(
    student_skills: Set[str],
    candidate_skills: Set[str]
) -> Dict[str, Any]:
    """
    Determine what each student can potentially teach
    and what each student can potentially learn.

    Example:

    Student:
        Python, Machine Learning

    Candidate:
        Python, Deep Learning

    Result:

        Shared:
            Python

        Candidate can teach:
            Deep Learning

        Student can teach:
            Machine Learning
    """

    shared_skills = (
        student_skills.intersection(
            candidate_skills
        )
    )

    student_unique = (
        student_skills - shared_skills
    )

    candidate_unique = (
        candidate_skills - shared_skills
    )

    # Candidate can potentially teach skills
    # that the student does not have.
    candidate_can_teach = set(
        candidate_unique
    )

    # Student can potentially teach skills
    # that the candidate does not have.
    student_can_teach = set(
        student_unique
    )

    # Bidirectional exchange is stronger when
    # both sides have something unique to offer.
    exchange_score = 0.0

    if student_skills or candidate_skills:

        student_teaching_ratio = 0.0

        candidate_teaching_ratio = 0.0

        if candidate_skills:
            student_teaching_ratio = (
                len(student_can_teach)
                / len(candidate_skills)
            )

        if student_skills:
            candidate_teaching_ratio = (
                len(candidate_can_teach)
                / len(student_skills)
            )

        exchange_score = (
            0.5 * min(student_teaching_ratio, 1.0)
            + 0.5 * min(candidate_teaching_ratio, 1.0)
        )

    return {
        "shared_skills": sorted(shared_skills),

        "student_can_teach": sorted(
            student_can_teach
        ),

        "candidate_can_teach": sorted(
            candidate_can_teach
        ),

        "exchange_score": round(
            float(exchange_score),
            4
        ),
    }


# =========================================================
# MATCH SCORE
# =========================================================

def calculate_match_score(
    student: Dict[str, Any],
    candidate: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate the complete hybrid recommendation score.

    Current weighting:

        35% semantic similarity
        25% direct skill overlap
        15% interest overlap
        10% complementary skills
        15% skill exchange potential
    """

    student_skills = get_student_skills(
        student
    )

    candidate_skills = get_student_skills(
        candidate
    )

    student_interests = get_student_interests(
        student
    )

    candidate_interests = get_student_interests(
        candidate
    )

    # -----------------------------------------------------
    # Direct skill overlap
    # -----------------------------------------------------

    shared_skills, skill_score = calculate_overlap(
        student_skills,
        candidate_skills
    )

    # -----------------------------------------------------
    # Interest overlap
    # -----------------------------------------------------

    shared_interests, interest_score = calculate_overlap(
        student_interests,
        candidate_interests
    )

    # -----------------------------------------------------
    # Complementary skills
    # -----------------------------------------------------

    complementary_matches, complementary_score = (
        calculate_complementary_score(
            student_skills,
            candidate_skills
        )
    )

    # -----------------------------------------------------
    # Skill exchange
    # -----------------------------------------------------

    exchange = calculate_skill_exchange(
        student_skills,
        candidate_skills
    )

    exchange_score = exchange[
        "exchange_score"
    ]

    # -----------------------------------------------------
    # TF-IDF
    # -----------------------------------------------------

    student_text = get_student_text(
        student
    )

    candidate_text = get_student_text(
        candidate
    )

    semantic_score = calculate_tfidf_similarity(
        student_text,
        candidate_text
    )

    # -----------------------------------------------------
    # Final hybrid score
    # -----------------------------------------------------

    final_score = (
        0.35 * semantic_score
        + 0.25 * skill_score
        + 0.15 * interest_score
        + 0.10 * complementary_score
        + 0.15 * exchange_score
    )

    return {
        "score": round(
            float(final_score),
            4
        ),

        "semantic_score": round(
            float(semantic_score),
            4
        ),

        "skill_score": round(
            float(skill_score),
            4
        ),

        "interest_score": round(
            float(interest_score),
            4
        ),

        "complementary_score": round(
            float(complementary_score),
            4
        ),

        "exchange_score": round(
            float(exchange_score),
            4
        ),

        "shared_skills": sorted(
            shared_skills
        ),

        "shared_interests": sorted(
            shared_interests
        ),

        "complementary_skills": sorted(
            complementary_matches
        ),

        "student_can_teach": exchange[
            "student_can_teach"
        ],

        "candidate_can_teach": exchange[
            "candidate_can_teach"
        ],
    }


# =========================================================
# EXPLANATION
# =========================================================

def explain_student_match(
    student: Dict[str, Any],
    candidate: Dict[str, Any],
    result: Dict[str, Any] | None = None
) -> Dict[str, Any]:
    """
    Return structured explanation data.

    This keeps the explanation machine-readable so that
    the backend/frontend can decide how to display it.
    """

    if result is None:
        result = calculate_match_score(
            student,
            candidate
        )

    return {
        "shared_skills": result.get(
            "shared_skills",
            []
        ),

        "shared_interests": result.get(
            "shared_interests",
            []
        ),

        "complementary_skills": result.get(
            "complementary_skills",
            []
        ),

        "student_can_teach": result.get(
            "student_can_teach",
            []
        ),

        "candidate_can_teach": result.get(
            "candidate_can_teach",
            []
        ),

        "exchange_score": result.get(
            "exchange_score",
            0.0
        ),
    }


def build_explanation_text(
    explanation: Dict[str, Any]
) -> str:
    """
    Convert structured explanation into readable text.
    """

    reasons = []

    shared_skills = explanation.get(
        "shared_skills",
        []
    )

    shared_interests = explanation.get(
        "shared_interests",
        []
    )

    complementary = explanation.get(
        "complementary_skills",
        []
    )

    student_can_teach = explanation.get(
        "student_can_teach",
        []
    )

    candidate_can_teach = explanation.get(
        "candidate_can_teach",
        []
    )

    if shared_skills:
        reasons.append(
            "Shared skills: "
            + ", ".join(shared_skills)
        )

    if shared_interests:
        reasons.append(
            "Shared interests: "
            + ", ".join(shared_interests)
        )

    if complementary:
        reasons.append(
            "Complementary skills: "
            + ", ".join(complementary)
        )

    if candidate_can_teach:
        reasons.append(
            "They can potentially teach you: "
            + ", ".join(candidate_can_teach)
        )

    if student_can_teach:
        reasons.append(
            "You can potentially teach them: "
            + ", ".join(student_can_teach)
        )

    if not reasons:
        reasons.append(
            "The recommendation is based mainly "
            "on overall profile similarity."
        )

    return " | ".join(reasons)


# =========================================================
# RECOMMENDATION ENGINE
# =========================================================

class SkillRecommendationEngine:
    """
    Hybrid AI recommendation engine.
    """

    def __init__(self) -> None:
        self.name = (
            "Hybrid Skill Exchange Recommendation Engine"
        )

    # -----------------------------------------------------
    # STUDENT RECOMMENDATIONS
    # -----------------------------------------------------

    def recommend_students(
        self,
        student: Dict[str, Any],
        students: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Return top matching students.
        """

        recommendations = []

        student_id = student.get(
            "id"
        )

        for candidate in students:

            candidate_id = candidate.get(
                "id"
            )

            # Do not recommend the same student.
            if (
                student_id is not None
                and candidate_id == student_id
            ):
                continue

            result = calculate_match_score(
                student,
                candidate
            )

            recommendation = dict(
                candidate
            )

            # -------------------------------------------------
            # Compatibility fields
            # -------------------------------------------------

            if "student_id" not in recommendation:
                recommendation[
                    "student_id"
                ] = candidate_id

            if "student_name" not in recommendation:
                recommendation[
                    "student_name"
                ] = get_student_name(
                    candidate
                )

            recommendation[
                "match_score"
            ] = result["score"]

            # -------------------------------------------------
            # Detailed AI information
            # -------------------------------------------------

            recommendation[
                "match_details"
            ] = {
                "semantic_score":
                    result[
                        "semantic_score"
                    ],

                "skill_score":
                    result[
                        "skill_score"
                    ],

                "interest_score":
                    result[
                        "interest_score"
                    ],

                "complementary_score":
                    result[
                        "complementary_score"
                    ],

                "exchange_score":
                    result[
                        "exchange_score"
                    ],

                "shared_skills":
                    result[
                        "shared_skills"
                    ],

                "shared_interests":
                    result[
                        "shared_interests"
                    ],

                "complementary_skills":
                    result[
                        "complementary_skills"
                    ],

                "student_can_teach":
                    result[
                        "student_can_teach"
                    ],

                "candidate_can_teach":
                    result[
                        "candidate_can_teach"
                    ],
            }

            # -------------------------------------------------
            # Explainable AI
            # -------------------------------------------------

            explanation = explain_student_match(
                student,
                candidate,
                result
            )

            recommendation[
                "explanation"
            ] = explanation

            recommendation[
                "why_match"
            ] = build_explanation_text(
                explanation
            )

            recommendations.append(
                recommendation
            )

        # Highest score first.
        recommendations.sort(
            key=lambda item: item[
                "match_score"
            ],
            reverse=True
        )

        return recommendations[:top_k]

    # -----------------------------------------------------
    # SERVICE RECOMMENDATIONS
    # -----------------------------------------------------

    def recommend_services(
        self,
        student: Dict[str, Any],
        services: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Recommend services using the same hybrid
        similarity approach.

        This method is kept here for compatibility
        with the existing test/application code.
        """

        recommendations = []

        student_skills = get_student_skills(
            student
        )

        student_interests = get_student_interests(
            student
        )

        student_text = get_student_text(
            student
        )

        for service in services:

            service_skills = normalize_items(
                service.get(
                    "skills",
                    service.get(
                        "skill",
                        service.get(
                            "tags",
                            []
                        )
                    )
                )
            )

            category = normalize_skill(
                service.get(
                    "category",
                    ""
                )
            )

            service_interests = normalize_items(
                service.get(
                    "interests",
                    []
                )
            )

            # Include category in the text because
            # it is often important for service matching.
            service_text_parts = list(
                service_skills
                | service_interests
            )

            if category:
                service_text_parts.append(
                    category
                )

            service_text = " ".join(
                sorted(set(service_text_parts))
            )

            semantic_score = (
                calculate_tfidf_similarity(
                    student_text,
                    service_text
                )
            )

            shared_skills = (
                student_skills.intersection(
                    service_skills
                )
            )

            shared_interests = (
                student_interests.intersection(
                    service_interests
                )
            )

            category_match = (
                1.0
                if category
                and (
                    category in student_skills
                    or category in student_interests
                )
                else 0.0
            )

            skill_score = (
                len(shared_skills)
                / len(student_skills)
                if student_skills
                else 0.0
            )

            interest_score = (
                len(shared_interests)
                / len(student_interests)
                if student_interests
                else 0.0
            )

            final_score = (
                0.50 * semantic_score
                + 0.25 * skill_score
                + 0.15 * interest_score
                + 0.10 * category_match
            )

            recommendation = dict(
                service
            )

            recommendation[
                "match_score"
            ] = round(
                float(final_score),
                4
            )

            recommendation[
                "match_details"
            ] = {
                "semantic_score":
                    round(
                        float(
                            semantic_score
                        ),
                        4
                    ),

                "skill_score":
                    round(
                        float(
                            skill_score
                        ),
                        4
                    ),

                "interest_score":
                    round(
                        float(
                            interest_score
                        ),
                        4
                    ),

                "category_match":
                    category_match,

                "shared_skills":
                    sorted(
                        shared_skills
                    ),

                "shared_interests":
                    sorted(
                        shared_interests
                    ),
            }

            reasons = []

            if shared_skills:
                reasons.append(
                    "Related skills: "
                    + ", ".join(
                        sorted(shared_skills)
                    )
                )

            if shared_interests:
                reasons.append(
                    "Related interests: "
                    + ", ".join(
                        sorted(shared_interests)
                    )
                )

            if category_match:
                reasons.append(
                    "Service category matches "
                    "the student's profile."
                )

            if not reasons:
                reasons.append(
                    "Recommended based on overall "
                    "profile similarity."
                )

            recommendation[
                "why_match"
            ] = " | ".join(
                reasons
            )

            recommendations.append(
                recommendation
            )

        recommendations.sort(
            key=lambda item: item[
                "match_score"
            ],
            reverse=True
        )

        return recommendations[:top_k]


# =========================================================
# PUBLIC API
# =========================================================

recommendation_engine = (
    SkillRecommendationEngine()
)


def get_student_recommendations(
    student: Dict[str, Any],
    students: List[Dict[str, Any]],
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Public function used by the application.
    """

    return recommendation_engine.recommend_students(
        student=student,
        students=students,
        top_k=top_k
    )


def get_service_recommendations(
    student: Dict[str, Any],
    services: List[Dict[str, Any]],
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Public service recommendation API.
    """

    return recommendation_engine.recommend_services(
        student=student,
        services=services,
        top_k=top_k
    )