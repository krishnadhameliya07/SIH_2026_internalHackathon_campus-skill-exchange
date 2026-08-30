from app.ai.recommender import SkillRecommendationEngine, explain_student_match


# ---------------------------------------------------------
# SAMPLE STUDENTS
# ---------------------------------------------------------

students = [
    {
        "id": 1,
        "name": "Alice",
        "email": "alice@example.com",
        "skills": [
            "Python",
            "Machine Learning",
            "Data Analysis"
        ],
        "interests": [
            "Artificial Intelligence",
            "Data Science"
        ],
        "bio": "Interested in AI, machine learning and data science."
    },
    {
        "id": 2,
        "name": "Rahul",
        "email": "rahul@example.com",
        "skills": [
            "Python",
            "Machine Learning",
            "Deep Learning"
        ],
        "interests": [
            "Artificial Intelligence",
            "Robotics"
        ],
        "bio": "Interested in machine learning and robotics."
    },
    {
        "id": 3,
        "name": "Priya",
        "email": "priya@example.com",
        "skills": [
            "Graphic Design",
            "UI Design",
            "Figma"
        ],
        "interests": [
            "Design",
            "Photography"
        ],
        "bio": "UI/UX designer interested in creative projects."
    },
    {
        "id": 4,
        "name": "Arjun",
        "email": "arjun@example.com",
        "skills": [
            "Python",
            "Web Development",
            "Django"
        ],
        "interests": [
            "Software Development",
            "Backend Development"
        ],
        "bio": "Backend developer interested in building web applications."
    },
    {
        "id": 5,
        "name": "Sneha",
        "email": "sneha@example.com",
        "skills": [
            "Photography",
            "Video Editing",
            "Photoshop"
        ],
        "interests": [
            "Photography",
            "Content Creation"
        ],
        "bio": "Photographer and content creator."
    }
]


# ---------------------------------------------------------
# CREATE AI ENGINE
# ---------------------------------------------------------

engine = SkillRecommendationEngine()


# ---------------------------------------------------------
# SELECT TARGET STUDENT
# ---------------------------------------------------------

target_student = students[0]


print("\n")
print("=" * 60)
print("CAMPUS SKILL EXCHANGE - AI RECOMMENDATION ENGINE")
print("=" * 60)

print(f"\nRecommendations for: {target_student['name']}")

print("\nSkills:")
print(", ".join(target_student["skills"]))

print("\nInterests:")
print(", ".join(target_student["interests"]))


# ---------------------------------------------------------
# STUDENT RECOMMENDATIONS
# ---------------------------------------------------------

recommendations = engine.recommend_students(
    student=target_student,
    students=students,
    top_k=5
)


print("\n")
print("-" * 60)
print("RECOMMENDED STUDENTS")
print("-" * 60)


for recommendation in recommendations:

    print(
        f"\nStudent: {recommendation['student_name']}"
    )

    print(
        f"Skills: "
        f"{', '.join(recommendation['skills'])}"
    )

    print(
        f"Match Score: "
        f"{recommendation['match_score']:.4f}"
    )
 # Find the complete student object
    matched_student = next(
        (
            s for s in students
            if s["id"] == recommendation["student_id"]
        ),
        None
    )

    if matched_student:

        explanation = explain_student_match(
            target_student,
            matched_student
        )

        print("\nWhy this match?")

        if explanation["shared_skills"]:
            print(
                "Shared skills: "
                + ", ".join(
                    explanation["shared_skills"]
                )
            )

        if explanation["shared_interests"]:
            print(
                "Shared interests: "
                + ", ".join(
                    explanation["shared_interests"]
                )
            )

        if not explanation["shared_skills"] and not explanation["shared_interests"]:
            print(
                "No major direct skill or interest overlap."
            )


print("\n")
print("=" * 60)
print("TEST COMPLETED")
print("=" * 60)


# ---------------------------------------------------------
# SERVICE RECOMMENDATION TEST
# ---------------------------------------------------------

services = [
    {
        "id": 101,
        "title": "Python Programming Tutoring",
        "category": "Programming",
        "skills": [
            "Python",
            "Programming"
        ],
        "description": "Learn Python programming and solve coding problems."
    },
    {
        "id": 102,
        "title": "Machine Learning Project Help",
        "category": "Artificial Intelligence",
        "skills": [
            "Machine Learning",
            "Python"
        ],
        "description": "Get help with machine learning projects and AI concepts."
    },
    {
        "id": 103,
        "title": "Graphic Design Services",
        "category": "Design",
        "skills": [
            "Graphic Design",
            "Figma"
        ],
        "description": "Logo design, posters and UI design services."
    },
    {
        "id": 104,
        "title": "Photography Service",
        "category": "Photography",
        "skills": [
            "Photography",
            "Photo Editing"
        ],
        "description": "Photography and photo editing for campus events."
    }
]


print("\n")
print("=" * 60)
print("SERVICE RECOMMENDATIONS")
print("=" * 60)

print(
    f"\nFinding services for: "
    f"{target_student['name']}"
)


service_recommendations = engine.recommend_services(
    student=target_student,
    services=services,
    top_k=5
)


print("\n")
print("-" * 60)
print("RECOMMENDED SERVICES")
print("-" * 60)


for service in service_recommendations:

    print(
        f"\nService: "
        f"{service.get('title', service.get('name', 'Unknown'))}"
    )

    print(
        f"Category: "
        f"{service.get('category', 'Unknown')}"
    )

    print(
        f"Match Score: "
        f"{service['match_score']:.4f}"
    )


print("\n")
print("=" * 60)
print("SERVICE TEST COMPLETED")
print("=" * 60)
