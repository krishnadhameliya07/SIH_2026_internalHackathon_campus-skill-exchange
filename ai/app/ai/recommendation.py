from typing import List, Dict

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def create_recommendation(
    service: Dict,
    match_score: float
) -> Dict:
    """
    Create a recommendation object for a matched service.
    """

    return {
        "service_id": service.get(
            "service_id",
            service.get("id")
        ),
        "service_name": service.get(
            "service_name",
            service.get("name", service.get("title"))
        ),
        "provider_id": service.get("provider_id"),
        "provider_name": service.get("provider_name"),
        "category": service.get("category"),
        "description": service.get("description"),
        "match_score": round(
            float(match_score),
            4
        )
    }


def get_top_recommendations(
    services: List[Dict],
    scores,
    top_k: int = 5
) -> List[Dict]:
    """
    Create and return the top-k service recommendations.
    """

    recommendations = []

    for service, score in zip(services, scores):

        recommendation = create_recommendation(
            service,
            score
        )

        recommendations.append(recommendation)

    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return recommendations[:top_k]


def recommend_students(
    student: Dict,
    students: List[Dict],
    top_k: int = 5
) -> List[Dict]:
    """
    Recommend other students who have similar skills
    or interests.
    """

    student_id = student.get("id")

    if not students:
        return []

    student_skills = student.get("skills", [])
    student_interests = student.get("interests", [])

    if isinstance(student_skills, list):
        student_skills_text = " ".join(
            str(skill) for skill in student_skills
        )
    else:
        student_skills_text = str(student_skills)

    if isinstance(student_interests, list):
        student_interests_text = " ".join(
            str(item) for item in student_interests
        )
    else:
        student_interests_text = str(student_interests)

    student_text = (
        f"{student_skills_text} "
        f"{student_interests_text}"
    ).strip()

    other_students = [
        item
        for item in students
        if item.get("id") != student_id
    ]

    if not other_students:
        return []

    student_texts = []

    for other_student in other_students:

        skills = other_student.get("skills", [])
        interests = other_student.get("interests", [])

        if isinstance(skills, list):
            skills_text = " ".join(
                str(skill) for skill in skills
            )
        else:
            skills_text = str(skills)

        if isinstance(interests, list):
            interests_text = " ".join(
                str(item) for item in interests
            )
        else:
            interests_text = str(interests)

        text = (
            f"{skills_text} "
            f"{interests_text}"
        ).strip()

        student_texts.append(text)

    documents = [student_text] + student_texts

    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english"
    )

    vectors = vectorizer.fit_transform(documents)

    current_student_vector = vectors[0]
    other_student_vectors = vectors[1:]

    scores = cosine_similarity(
        current_student_vector,
        other_student_vectors
    )[0]

    recommendations = []

    for other_student, score in zip(
        other_students,
        scores
    ):

        recommendations.append(
            {
                "student_id": other_student.get("id"),
                "student_name": other_student.get("name"),
                "email": other_student.get("email"),
                "skills": other_student.get("skills", []),
                "interests": other_student.get("interests", []),
                "match_score": round(
                    float(score),
                    4
                )
            }
        )

    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return recommendations[:top_k]