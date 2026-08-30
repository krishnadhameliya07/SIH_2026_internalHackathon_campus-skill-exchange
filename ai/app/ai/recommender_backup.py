"""
AI/ML Recommendation Engine
Campus Skill Exchange

This module calculates semantic/content-based similarity between
a student's skills/interests and available services.

It does NOT handle FastAPI routes or frontend logic.
"""

from typing import List, Dict, Any

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class SkillRecommendationEngine:
    """
    Content-based recommendation engine.

    It converts student profiles and service descriptions into
    TF-IDF vectors and calculates cosine similarity.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2)
        )

    # ---------------------------------------------------------
    # TEXT PREPARATION
    # ---------------------------------------------------------

    def _clean_list(self, values: Any) -> List[str]:
        """
        Safely convert a list-like field into a list of strings.
        """
        if values is None:
            return []

        if isinstance(values, str):
            return [values.strip()]

        if isinstance(values, list):
            return [
                str(value).strip()
                for value in values
                if value is not None and str(value).strip()
            ]

        return []

    def student_to_text(self, student: Dict[str, Any]) -> str:
        """
        Convert a student profile into text that the ML model
        can process.

        We use:
        - skills
        - interests
        - bio
        """

        skills = self._clean_list(student.get("skills"))
        interests = self._clean_list(student.get("interests"))
        bio = str(student.get("bio", "") or "")

        text_parts = []

        if skills:
            text_parts.append(" ".join(skills))

        if interests:
            text_parts.append(" ".join(interests))

        if bio:
            text_parts.append(bio)

        return " ".join(text_parts)

    def service_to_text(self, service: Dict[str, Any]) -> str:
        """
        Convert a service into ML-readable text.

        We use:
        - service name
        - title
        - description
        - skills
        - category
        """

        name = str(service.get("name", "") or "")
        title = str(service.get("title", "") or "")
        description = str(service.get("description", "") or "")
        category = str(service.get("category", "") or "")

        skills = self._clean_list(service.get("skills"))

        text_parts = [
            name,
            title,
            description,
            category,
            " ".join(skills)
        ]

        return " ".join(
            part.strip()
            for part in text_parts
            if part and part.strip()
        )

    # ---------------------------------------------------------
    # SIMILARITY
    # ---------------------------------------------------------

    def calculate_similarity(
        self,
        student: Dict[str, Any],
        service: Dict[str, Any]
    ) -> float:
        """
        Calculate cosine similarity between a student and a service.

        Returns a value between 0 and 1.
        """

        student_text = self.student_to_text(student)
        service_text = self.service_to_text(service)

        if not student_text or not service_text:
            return 0.0

        documents = [
            student_text,
            service_text
        ]

        try:
            vectors = self.vectorizer.fit_transform(documents)

            similarity = cosine_similarity(
                vectors[0:1],
                vectors[1:2]
            )[0][0]

            return round(float(similarity), 4)

        except Exception:
            return 0.0

    # ---------------------------------------------------------
    # RECOMMENDATIONS
    # ---------------------------------------------------------

    def recommend_services(
        self,
        student: Dict[str, Any],
        services: List[Dict[str, Any]],
        top_k: int = 5,
        minimum_score: float = 0.0
    ) -> List[Dict[str, Any]]:
        """
        Return the best matching services for a student.
        """

        recommendations = []

        for service in services:

            score = self.calculate_similarity(
                student,
                service
            )

            if score < minimum_score:
                continue

            result = dict(service)

            result["match_score"] = score

            recommendations.append(result)

        recommendations.sort(
            key=lambda item: item["match_score"],
            reverse=True
        )

        return recommendations[:top_k]

    # ---------------------------------------------------------
    # STUDENT-TO-STUDENT MATCHING
    # ---------------------------------------------------------

    def calculate_student_similarity(
        self,
        student_a: Dict[str, Any],
        student_b: Dict[str, Any]
    ) -> float:
        """
        Calculate similarity between two students.

        This can be used for:
        - peer recommendations
        - collaboration
        - skill exchange
        - finding students with related interests
        """

        text_a = self.student_to_text(student_a)
        text_b = self.student_to_text(student_b)

        if not text_a or not text_b:
            return 0.0

        documents = [text_a, text_b]

        try:
            vectors = self.vectorizer.fit_transform(documents)

            similarity = cosine_similarity(
                vectors[0:1],
                vectors[1:2]
            )[0][0]

            return round(float(similarity), 4)

        except Exception:
            return 0.0

    def recommend_students(
        self,
        student: Dict[str, Any],
        students: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find students whose skills/interests are most relevant
        to the given student.
        """

        recommendations = []

        student_id = student.get("id")

        for other_student in students:

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
                "skills": other_student.get("skills", []),
                "interests": other_student.get("interests", []),
                "match_score": score
            }

            recommendations.append(result)

        recommendations.sort(
            key=lambda item: item["match_score"],
            reverse=True
        )

        return recommendations[:top_k]


# -------------------------------------------------------------
# SINGLE ENGINE INSTANCE
# -------------------------------------------------------------

recommendation_engine = SkillRecommendationEngine()


# -------------------------------------------------------------
# SIMPLE FUNCTIONS FOR BACKEND INTEGRATION
# -------------------------------------------------------------

def get_service_recommendations(
    student: Dict[str, Any],
    services: List[Dict[str, Any]],
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Easy function for the backend to call.
    """

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
    """
    Easy function for the backend to call.
    """

    return recommendation_engine.recommend_students(
        student=student,
        students=students,
        top_k=top_k
    )