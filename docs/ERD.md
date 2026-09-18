# EduFlow — Ma'lumotlar Modeli (ERD)

Ushbu hujjat EduFlow tizimining ma'lumotlar bazasi munosabatlarini (Entity-Relationship Diagram) ifodalaydi.

```mermaid
erDiagram
    USER ||--o{ GROUP : "teaches"
    USER ||--o{ ENROLLMENT : "enrolled in"
    USER ||--o{ ATTENDANCE : "has attendance"
    USER ||--o{ SUBMISSION : "submits"
    USER ||--o{ PAYMENT : "pays"
    USER ||--o{ AUDIT_LOG : "triggers"

    COURSE ||--o{ GROUP : "contains"
    
    GROUP ||--o{ ENROLLMENT : "has students"
    GROUP ||--o{ LESSON : "scheduled for"
    GROUP ||--o{ ASSIGNMENT : "assigned to"

    LESSON ||--o{ ATTENDANCE : "records"

    ASSIGNMENT ||--o{ SUBMISSION : "receives"

    USER {
        uuid Id PK
        string FullName
        string Email UK
        string PasswordHash
        string Role
        string Status
        string Phone
        datetime CreatedAt
    }

    COURSE {
        uuid Id PK
        string Name
        string Description
        decimal Price
        int DurationWeeks
        string Status
        datetime CreatedAt
    }

    GROUP {
        uuid Id PK
        string Name
        uuid CourseId FK
        uuid TeacherId FK
        datetime StartDate
        datetime EndDate
        string Status
        datetime CreatedAt
    }

    ENROLLMENT {
        uuid Id PK
        uuid GroupId FK
        uuid StudentId FK
        datetime JoinedAt
        string Status
    }

    LESSON {
        uuid Id PK
        uuid GroupId FK
        string Title
        datetime StartsAt
        datetime EndsAt
        string Room
        string OnlineUrl
    }

    ATTENDANCE {
        uuid Id PK
        uuid LessonId FK
        uuid StudentId FK
        string Status
        string Note
    }

    ASSIGNMENT {
        uuid Id PK
        uuid GroupId FK
        string Title
        string Description
        datetime Deadline
        int MaxScore
        datetime CreatedAt
    }

    SUBMISSION {
        uuid Id PK
        uuid AssignmentId FK
        uuid StudentId FK
        string Url
        string Text
        datetime SubmittedAt
        int Score
        string Feedback
    }

    PAYMENT {
        uuid Id PK
        uuid StudentId FK
        decimal Amount
        datetime PaidAt
        string Method
        string Status
        string Note
    }

    AUDIT_LOG {
        uuid Id PK
        uuid UserId FK
        string Action
        string Entity
        string EntityId
        datetime CreatedAt
        string Metadata
    }
```

### Indekslar va Cheklovlar (Constraints)
- `User.Email`: Unique index
- `Enrollment(GroupId, StudentId)`: Unique composite index (bitta o'quvchi bir guruhga ikki marta yozilishi taqiqlangan)
- `Attendance(LessonId, StudentId)`: Unique composite index
- `Submission(AssignmentId, StudentId)`: Unique composite index
- `Lesson(Room, StartsAt, EndsAt)`: Darslar to'qnashuvi (Room / Teacher conflict) validatsiyasi
