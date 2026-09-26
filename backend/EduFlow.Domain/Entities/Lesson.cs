namespace EduFlow.Domain.Entities;

public class Lesson
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GroupId { get; set; }
    public Group Group { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string Room { get; set; } = string.Empty;
    public Guid? RoomId { get; set; }
    public Room? RoomEntity { get; set; }
    public string? OnlineUrl { get; set; }

    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
