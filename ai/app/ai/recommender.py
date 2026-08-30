"""
Campus Skill Exchange
AI/ML Recommendation Engine

Weighted content-based recommendation system.

Matching factors:
    Skills      -> 50%
    Interests   -> 30%
    Bio         -> 20%

Uses TF-IDF + cosine similarity.
"""

from typing import List, Dict, Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class SkillRecommendationEngine:

    # ---------------------------------------------------------
    # INITIALIZATION
    # ---------------------------------------------------------

    def __init__(
        self,
        skill_weight: float = 0.50,
        interest_weight: float = 0.30,
        bio_weight: float = 0.20
    ):

        self.skill_weight = skill_weight
        self.interest_weight = interest_weight
        self.bio_weight = bio_weight

        # Make sure weights add up to 1
        total = (
            self.skill_weight
            + self.interest_weight
            + self.bio_weight
        )

        if abs(total - 1.0) > 0.001:
            raise ValueError(
                "Recommendation weights must add up to 1.0"
            )

    # ---------------------------------------------------------
    # DATA CLEANING
    # ---------------------------------------------------------

    def _clean_list(self, values: Any) -> List[str]:

        if values is None:
            return []

        if isinstance(values, str):
            return [values.strip().lower()]

        if isinstance(values, list):

            return [
                str(value).strip().lower()
                for value in values
                if value is not None
                and str(value).strip()
            ]

        return []

    # ---------------------------------------------------------
    # TEXT SIMILARITY
    # ---------------------------------------------------------

    def _text_similarity(
        self,
        text_a: str,
        text_b: str
    ) -> float:

        if not text_a or not text_b:
            return 0.0

        documents = [
            text_a.lower(),
            text_b.lower()
        ]

        vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2)
        )

        try:

            vectors = vectorizer.fit_transform(documents)

            similarity = cosine_similarity(
                vectors[0:1],
                vectors[1:2]
            )[0][0]

            return float(similarity)

        except Exception:

            return 0.0

    # ---------------------------------------------------------
    # LIST SIMILARITY
    # ---------------------------------------------------------

    def _list_similarity(
        self,
        list_a: List[str],
        list_b: List[str]
    ) -> float:

        if not list_a or not list_b:
            return 0.0

        # Convert to lowercase sets
        set_a = set(
            item.lower().strip()
            for item in list_a
        )

        set_b = set(
            item.lower().strip()
            for item in list_b
        )

        if not set_a or not set_b:
            return 0.0

        # Exact/common skill overlap
        intersection = set_a.intersection(set_b)
        union = set_a.union(set_b)

        if not union:
            return 0.0

        jaccard_score = (
            len(intersection) / len(union)
        )

        # Also calculate semantic similarity
        text_a = " ".join(set_a)
        text_b = " ".join(set_b)

        semantic_score = self._text_similarity(
            text_a,
            text_b
        )

        # Combine exact overlap + semantic similarity
        combined_score = (
            0.6 * jaccard_score
            + 0.4 * semantic_score
        )

        return min(1.0, combined_score)

    # ---------------------------------------------------------
    # STUDENT INFORMATION
    # ---------------------------------------------------------

    def _get_student_skills(
        self,
        student: Dict[str, Any]
    ) -> List[str]:

        return self._clean_list(
            student.get("skills", [])
        )

    def _get_student_interests(
        self,
        student: Dict[str, Any]
    ) -> List[str]:

        return self._clean_list(
            student.get("interests", [])
        )

    def _get_student_bio(
        self,
        student: Dict[str, Any]
    ) -> str:

        return str(
            student.get("bio", "") or ""
        ).strip().lower()

    # ---------------------------------------------------------
    # STUDENT → STUDENT SIMILARITY
    # ---------------------------------------------------------

    def calculate_student_similarity(
        self,
        student_a: Dict[str, Any],
        student_b: Dict[str, Any]
    ) -> float:

        skills_a = self._get_student_skills(student_a)
        skills_b = self._get_student_skills(student_b)

        interests_a = self._get_student_interests(student_a)
        interests_b = self._get_student_interests(student_b)

        bio_a = self._get_student_bio(student_a)
        bio_b = self._get_student_bio(student_b)

        # Calculate individual scores
        skill_score = self._list_similarity(
            skills_a,
            skills_b
        )

        interest_score = self._list_similarity(
            interests_a,
            interests_b
        )

        bio_score = self._text_similarity(
            bio_a,
            bio_b
        )

        # Weighted final score
        final_score = (
            self.skill_weight * skill_score
            + self.interest_weight * interest_score
            + self.bio_weight * bio_score
        )

        return round(
            min(1.0, final_score),
            4
        )

    # ---------------------------------------------------------
    # STUDENT RECOMMENDATIONS
    # ---------------------------------------------------------

    def recommend_students(
        self,
        student: Dict[str, Any],
        students: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:

        recommendations = []

        student_id = student.get("id")

        for other_student in students:

            # Do not recommend the same student
            if other_student.get("id") == student_id:
                continue

            score = self.calculate_student_similarity(
                student,
                other_student
            )

            result = {
                "student_id": other_student.get("id"),
                "student_name": other_student.get("name"),
                "email": other_student.get("email"),
                "skills": other_student.get(
                    "skills",
                    []
                ),
                "interests": other_student.get(
                    "interests",
                    []
                ),
                "match_score": score
            }

            recommendations.append(result)

        # Highest score first
        recommendations.sort(
            key=lambda item: item["match_score"],
            reverse=True
        )

        return recommendations[:top_k]

    # ---------------------------------------------------------
    # SERVICE INFORMATION
    # ---------------------------------------------------------

    def _get_service_skills(
        self,
        service: Dict[str, Any]
    ) -> List[str]:

        return self._clean_list(
            service.get("skills", [])
        )

    def _get_service_category(
        self,
        service: Dict[str, Any]
    ) -> str:

        return str(
            service.get("category", "") or ""
        ).strip().lower()

    def _get_service_description(
        self,
        service: Dict[str, Any]
    ) -> str:

        description = service.get(
            "description",
            ""
        )

        title = service.get(
            "title",
            ""
        )

        name = service.get(
            "name",
            ""
        )

        return " ".join([
            str(name or ""),
            str(title or ""),
            str(description or "")
        ]).strip().lower()

    # ---------------------------------------------------------
    # STUDENT → SERVICE SIMILARITY
    # ---------------------------------------------------------

    def calculate_service_similarity(
        self,
        student: Dict[str, Any],
        service: Dict[str, Any]
    ) -> float:

        student_skills = self._get_student_skills(
            student
        )

        student_interests = self._get_student_interests(
            student
        )

        service_skills = self._get_service_skills(
            service
        )

        service_category = self._get_service_category(
            service
        )

        service_description = (
            self._get_service_description(service)
        )

        # -----------------------------------------------------
        # SKILL SCORE
        # -----------------------------------------------------

        skill_score = self._list_similarity(
            student_skills,
            service_skills
        )

        # -----------------------------------------------------
        # INTEREST SCORE
        # -----------------------------------------------------

        interest_text = " ".join(
            student_interests
        )

        category_score = self._text_similarity(
            interest_text,
            service_category
        )

        description_score = self._text_similarity(
            interest_text,
            service_description
        )

        interest_score = (
            0.5 * category_score
            + 0.5 * description_score
        )

        # -----------------------------------------------------
        # OVERALL SCORE
        # -----------------------------------------------------

        final_score = (
            self.skill_weight * skill_score
            + self.interest_weight * interest_score
        )

        return round(
            min(1.0, final_score),
            4
        )

    # ---------------------------------------------------------
    # SERVICE RECOMMENDATIONS
    # ---------------------------------------------------------

    def recommend_services(
        self,
        student: Dict[str, Any],
        services: List[Dict[str, Any]],
        top_k: int = 5,
        minimum_score: float = 0.0
    ) -> List[Dict[str, Any]]:

        recommendations = []

        for service in services:

            score = self.calculate_service_similarity(
                student,
                service
            )

            if score < minimum_score:
                continue

            result = dict(service)

            result["match_score"] = score

            recommendations.append(
                result
            )

        # Highest score first
        recommendations.sort(
            key=lambda item: item["match_score"],
            reverse=True
        )

        return recommendations[:top_k]


# -------------------------------------------------------------
# GLOBAL ENGINE
# -------------------------------------------------------------

recommendation_engine = SkillRecommendationEngine()


# -------------------------------------------------------------
# BACKEND-FRIENDLY FUNCTIONS
# -------------------------------------------------------------

def get_service_recommendations(
    student: Dict[str, Any],
    services: List[Dict[str, Any]],
    top_k: int = 5
) -> List[Dict[str, Any]]:

    return recommendation_engine.recommend_services(
        student=student,
        services=services,
        top_k=top_k
    )


def get_student_recommendations(
    student: Dict[str, Any],
    students: List[Dict[str, Any]],
    top_k: int = 5
) -> List[Dict[str, Any]]:

    return recommendation_engine.recommend_students(
        student=student,
        students=students,
        top_k=top_k
    )
# -------------------------------------------------------------
# RECOMMENDATION EXPLANATION
# -------------------------------------------------------------

def explain_student_match(
    student_a: Dict[str, Any],
    student_b: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Explain why two students are considered a good match.

    The explanation is based on:
    - shared skills
    - shared interests
    - overall match score
    """

    skills_a = set(
        item.lower().strip()
        for item in self_clean_list(student_a.get("skills", []))
    )

    skills_b = set(
        item.lower().strip()
        for item in self_clean_list(student_b.get("skills", []))
    )

    interests_a = set(
        item.lower().strip()
        for item in self_clean_list(student_a.get("interests", []))
    )

    interests_b = set(
        item.lower().strip()
        for item in self_clean_list(student_b.get("interests", []))
    )

    shared_skills = sorted(
        skills_a.intersection(skills_b)
    )

    shared_interests = sorted(
        interests_a.intersection(interests_b)
    )

    score = recommendation_engine.calculate_student_similarity(
        student_a,
        student_b
    )

    reasons = []

    if shared_skills:
        reasons.append(
            "Both students have: "
            + ", ".join(shared_skills)
        )

    if shared_interests:
        reasons.append(
            "Both students are interested in: "
            + ", ".join(shared_interests)
        )

    if not reasons:
        reasons.append(
            "The profiles have limited direct overlap."
        )

    return {
        "match_score": score,
        "shared_skills": shared_skills,
        "shared_interests": shared_interests,
        "reasons": reasons
    }


def self_clean_list(values: Any) -> List[str]:
    """
    Helper function used by the explanation system.
    """

    if values is None:
        return []

    if isinstance(values, str):
        return [values]

    if isinstance(values, list):
        return [
            str(value)
            for value in values
            if value is not None
        ]

    return []