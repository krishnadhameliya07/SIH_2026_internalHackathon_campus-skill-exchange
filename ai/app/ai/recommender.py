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

from typing import Any, Dict, List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class SkillRecommendationEngine:
    """
    Content-based recommendation engine.

    The engine supports:
    - Student-to-student recommendations
    - Student-to-service recommendations
    - Service-request-to-service matching

    It uses TF-IDF + cosine similarity for text comparison
    and Jaccard similarity + semantic similarity for lists
    such as skills and interests.
    """

    def __init__(
        self,
        skill_weight: float = 0.50,
        interest_weight: float = 0.30,
        bio_weight: float = 0.20,
    ):
        self.skill_weight = skill_weight
        self.interest_weight = interest_weight
        self.bio_weight = bio_weight

        total = (
            self.skill_weight
            + self.interest_weight
            + self.bio_weight
        )

        if abs(total - 1.0) > 0.001:
            raise ValueError(
                "Recommendation weights must add up to 1.0"
            )

    # =========================================================
    # DATA CLEANING
    # =========================================================

    def _clean_list(self, values: Any) -> List[str]:
        """
        Safely convert a list-like field into a normalized
        list of lowercase strings.
        """

        if values is None:
            return []

        if isinstance(values, str):
            cleaned = values.strip().lower()
            return [cleaned] if cleaned else []

        if isinstance(values, list):
            return [
                str(value).strip().lower()
                for value in values
                if value is not None
                and str(value).strip()
            ]

        return []

    # =========================================================
    # TEXT SIMILARITY
    # =========================================================

    def _text_similarity(
        self,
        text_a: str,
        text_b: str,
    ) -> float:
        """
        Calculate TF-IDF cosine similarity between two texts.

        Returns:
            Float between 0.0 and 1.0.
        """

        if not text_a or not text_b:
            return 0.0

        documents = [
            str(text_a).lower(),
            str(text_b).lower(),
        ]

        vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2),
        )

        try:
            vectors = vectorizer.fit_transform(documents)

            similarity = cosine_similarity(
                vectors[0:1],
                vectors[1:2],
            )[0][0]

            return float(similarity)

        except Exception:
            return 0.0

    # =========================================================
    # LIST SIMILARITY
    # =========================================================

    def _list_similarity(
        self,
        list_a: List[str],
        list_b: List[str],
    ) -> float:
        """
        Calculate similarity between two lists.

        Combines:
        - 60% exact Jaccard overlap
        - 40% TF-IDF semantic similarity
        """

        if not list_a or not list_b:
            return 0.0

        set_a = {
            item.lower().strip()
            for item in list_a
            if item
        }

        set_b = {
            item.lower().strip()
            for item in list_b
            if item
        }

        if not set_a or not set_b:
            return 0.0

        intersection = set_a.intersection(set_b)
        union = set_a.union(set_b)

        if not union:
            return 0.0

        jaccard_score = (
            len(intersection) / len(union)
        )

        text_a = " ".join(sorted(set_a))
        text_b = " ".join(sorted(set_b))

        semantic_score = self._text_similarity(
            text_a,
            text_b,
        )

        combined_score = (
            0.6 * jaccard_score
            + 0.4 * semantic_score
        )

        return min(1.0, combined_score)

    # =========================================================
    # STUDENT INFORMATION
    # =========================================================

    def _get_student_skills(
        self,
        student: Dict[str, Any],
    ) -> List[str]:
        return self._clean_list(
            student.get("skills", [])
        )

    def _get_student_interests(
        self,
        student: Dict[str, Any],
    ) -> List[str]:
        return self._clean_list(
            student.get("interests", [])
        )

    def _get_student_bio(
        self,
        student: Dict[str, Any],
    ) -> str:
        return str(
            student.get("bio", "") or ""
        ).strip().lower()

    # =========================================================
    # STUDENT → STUDENT SIMILARITY
    # =========================================================

    def calculate_student_similarity(
        self,
        student_a: Dict[str, Any],
        student_b: Dict[str, Any],
    ) -> float:
        """
        Calculate weighted similarity between two students.

        Skills      -> 50%
        Interests   -> 30%
        Bio         -> 20%
        """

        skills_a = self._get_student_skills(student_a)
        skills_b = self._get_student_skills(student_b)

        interests_a = self._get_student_interests(student_a)
        interests_b = self._get_student_interests(student_b)

        bio_a = self._get_student_bio(student_a)
        bio_b = self._get_student_bio(student_b)

        skill_score = self._list_similarity(
            skills_a,
            skills_b,
        )

        interest_score = self._list_similarity(
            interests_a,
            interests_b,
        )

        bio_score = self._text_similarity(
            bio_a,
            bio_b,
        )

        final_score = (
            self.skill_weight * skill_score
            + self.interest_weight * interest_score
            + self.bio_weight * bio_score
        )

        return round(
            min(1.0, final_score),
            4,
        )

    # =========================================================
    # STUDENT RECOMMENDATIONS
    # =========================================================

    def recommend_students(
        self,
        student: Dict[str, Any],
        students: List[Dict[str, Any]],
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Recommend students whose skills/interests are similar
        or relevant to the given student.
        """

        if not students:
            return []

        student_id = student.get("id")

        recommendations = []

        for other_student in students:
            if other_student.get("id") == student_id:
                continue

            score = self.calculate_student_similarity(
                student,
                other_student,
            )

            result = {
                "student_id": other_student.get("id"),
                "student_name": other_student.get("name"),
                "email": other_student.get("email"),
                "skills": other_student.get(
                    "skills",
                    [],
                ),
                "interests": other_student.get(
                    "interests",
                    [],
                ),
                "match_score": score,
            }

            recommendations.append(result)

        recommendations.sort(
            key=lambda item: item["match_score"],
            reverse=True,
        )

        return recommendations[:top_k]

    # =========================================================
    # SERVICE INFORMATION
    # =========================================================

    def _get_service_skills(
        self,
        service: Dict[str, Any],
    ) -> List[str]:
        return self._clean_list(
            service.get("skills", [])
        )

    def _get_service_category(
        self,
        service: Dict[str, Any],
    ) -> str:
        return str(
            service.get("category", "") or ""
        ).strip().lower()

    def _get_service_description(
        self,
        service: Dict[str, Any],
    ) -> str:
        description = str(
            service.get("description", "") or ""
        )

        title = str(
            service.get("title", "") or ""
        )

        name = str(
            service.get("name", "") or ""
        )

        return " ".join(
            [
                name,
                title,
                description,
            ]
        ).strip().lower()

    def service_to_text(
        self,
        service: Dict[str, Any],
    ) -> str:
        """
        Convert a service dictionary into a single text
        representation for similarity calculations.
        """

        name = str(
            service.get("name", "") or ""
        )

        title = str(
            service.get("title", "") or ""
        )

        description = str(
            service.get("description", "") or ""
        )

        category = str(
            service.get("category", "") or ""
        )

        skills = self._get_service_skills(
            service
        )

        return " ".join(
            part.strip()
            for part in [
                name,
                title,
                description,
                category,
                " ".join(skills),
            ]
            if part and part.strip()
        ).lower()

    # =========================================================
    # STUDENT → SERVICE SIMILARITY
    # =========================================================

    def calculate_service_similarity(
        self,
        student: Dict[str, Any],
        service: Dict[str, Any],
    ) -> float:
        """
        Calculate weighted similarity between a student
        and a service.
        """

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

        skill_score = self._list_similarity(
            student_skills,
            service_skills,
        )

        interest_text = " ".join(
            student_interests
        )

        category_score = self._text_similarity(
            interest_text,
            service_category,
        )

        description_score = self._text_similarity(
            interest_text,
            service_description,
        )

        interest_score = (
            0.5 * category_score
            + 0.5 * description_score
        )

        final_score = (
            self.skill_weight * skill_score
            + self.interest_weight * interest_score
        )

        return round(
            min(1.0, final_score),
            4,
        )

    # =========================================================
    # SERVICE RECOMMENDATIONS
    # =========================================================

    def recommend_services(
        self,
        student: Dict[str, Any],
        services: List[Dict[str, Any]],
        top_k: int = 5,
        minimum_score: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """
        Recommend services for a student.
        """

        if not services:
            return []

        recommendations = []

        for service in services:
            score = self.calculate_service_similarity(
                student,
                service,
            )

            if score < minimum_score:
                continue

            result = dict(service)
            result["match_score"] = score

            recommendations.append(result)

        recommendations.sort(
            key=lambda item: item["match_score"],
            reverse=True,
        )

        return recommendations[:top_k]


# =============================================================
# GLOBAL ENGINE INSTANCE
# =============================================================

recommendation_engine = SkillRecommendationEngine()


# =============================================================
# BACKEND-FRIENDLY FUNCTIONS
# =============================================================

def get_service_recommendations(
    student: Dict[str, Any],
    services: List[Dict[str, Any]],
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """
    Backend-friendly wrapper for service recommendations.
    """

    return recommendation_engine.recommend_services(
        student=student,
        services=services,
        top_k=top_k,
    )


def get_student_recommendations(
    student: Dict[str, Any],
    students: List[Dict[str, Any]],
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """
    Backend-friendly wrapper for student recommendations.
    """

    return recommendation_engine.recommend_students(
        student=student,
        students=students,
        top_k=top_k,
    )


# =============================================================
# REQUEST → SERVICE MATCHING
# =============================================================

def match_request_to_services(
    request: Dict[str, Any],
    services: List[Dict[str, Any]],
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """
    Match a natural-language service request against
    available services.

    Request fields may include:
    - description
    - skills
    - skill_required
    - deadline

    Only description and skills are used directly for
    similarity scoring. Deadline is retained for future
    ranking improvements.
    """

    request_text_parts = []

    description = str(
        request.get("description", "") or ""
    ).strip()

    if description:
        request_text_parts.append(description)

    required_skills = request.get(
        "skills",
        [],
    )

    if isinstance(required_skills, str):
        required_skills = [required_skills]

    if isinstance(required_skills, list):
        request_text_parts.extend(
            str(skill).strip()
            for skill in required_skills
            if skill is not None
            and str(skill).strip()
        )

    request_text = " ".join(
        request_text_parts
    ).strip()

    if not request_text:
        return []

    recommendations = []

    for service in services:
        service_text = recommendation_engine.service_to_text(
            service
        )

        score = recommendation_engine._text_similarity(
            request_text,
            service_text,
        )

        result = dict(service)

        result["match_score"] = round(
            float(score),
            4,
        )

        recommendations.append(result)

    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True,
    )

    return recommendations[:top_k]


# =============================================================
# STUDENT MATCH EXPLANATION
# =============================================================

def explain_student_match(
    student_a: Dict[str, Any],
    student_b: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Explain why two students are considered a good match.

    The explanation is based on:
    - shared skills
    - shared interests
    - overall match score
    """

    skills_a = set(
        recommendation_engine._clean_list(
            student_a.get("skills", [])
        )
    )

    skills_b = set(
        recommendation_engine._clean_list(
            student_b.get("skills", [])
        )
    )

    interests_a = set(
        recommendation_engine._clean_list(
            student_a.get("interests", [])
        )
    )

    interests_b = set(
        recommendation_engine._clean_list(
            student_b.get("interests", [])
        )
    )

    shared_skills = sorted(
        skills_a.intersection(skills_b)
    )

    shared_interests = sorted(
        interests_a.intersection(interests_b)
    )

    score = recommendation_engine.calculate_student_similarity(
        student_a,
        student_b,
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
        "reasons": reasons,
    }