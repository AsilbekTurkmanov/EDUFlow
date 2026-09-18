using EduFlow.Domain.Enums;

namespace EduFlow.Domain.Entities;

public class Course
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationWeeks { get; set; }
    public CourseStatus Status { get; set; } = CourseStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Group> Groups { get; set; } = new List<Group>();
}
