from typing import List, Dict

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def match_students_to_services(
    student_skills: str,
    services: List[Dict],
    top_k: int = 5
) -> List[Dict]:
    """
    Match a student's skills/interests with available campus services.

    Parameters:
        student_skills: Skills or interests provided by the student.
        services: List of service dictionaries.
        top_k: Maximum number of recommendations.

    Returns:
        List of recommended services sorted by similarity score.
    """

    if not student_skills or not services:
        return []

    service_texts = []

    for service in services:

        skills = service.get("skills", [])

        if isinstance(skills, list):
            skills_text = " ".join(str(skill) for skill in skills)
        else:
            skills_text = str(skills)

        text = " ".join(
            [
                str(service.get("title", "")),
                str(service.get("name", "")),
                str(service.get("description", "")),
                skills_text,
                str(service.get("category", ""))
            ]
        )

        service_texts.append(text)

    documents = [student_skills] + service_texts

    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english"
    )

    vectors = vectorizer.fit_transform(documents)

    student_vector = vectors[0]
    service_vectors = vectors[1:]

    similarity_scores = cosine_similarity(
        student_vector,
        service_vectors
    )[0]

    recommendations = []

    for service, score in zip(services, similarity_scores):

        recommendation = service.copy()

        recommendation["match_score"] = round(
            float(score),
            4
        )

        recommendations.append(recommendation)

    recommendations.sort(
        key=lambda item: item["match_score"],
        reverse=True
    )

    return recommendations[:top_k]


def find_best_matches(
    student: Dict,
    services: List[Dict],
    top_k: int = 5
) -> List[Dict]:
    """
    Find the best campus services for a student.

    This function is used by main.py.
    """

    skills = student.get("skills", [])
    interests = student.get("interests", [])

    if isinstance(skills, list):
        skills_text = " ".join(str(skill) for skill in skills)
    else:
        skills_text = str(skills)

    if isinstance(interests, list):
        interests_text = " ".join(str(item) for item in interests)
    else:
        interests_text = str(interests)

    student_text = f"{skills_text} {interests_text}".strip()

    return match_students_to_services(
        student_text,
        services,
        top_k
    )