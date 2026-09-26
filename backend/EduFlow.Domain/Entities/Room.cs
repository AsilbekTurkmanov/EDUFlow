namespace EduFlow.Domain.Entities;

public class Room
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty; // masalan: "Auditoriya 101", "Frontend Lab"
    public int Capacity { get; set; } = 25;
    public bool HasProjector { get; set; } = true;
    public int ComputersCount { get; set; } = 20;
    public bool HasAirConditioner { get; set; } = true;
    public bool IsActive { get; set; } = true;

    public Guid? CenterId { get; set; }
    public LearningCenter? Center { get; set; }

    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
