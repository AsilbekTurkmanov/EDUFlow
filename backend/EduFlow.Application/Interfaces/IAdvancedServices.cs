using EduFlow.Application.Common;
using EduFlow.Application.DTOs;

namespace EduFlow.Application.Interfaces;

public interface IRoomService
{
    Task<ApiResponse<List<RoomDto>>> GetRoomsAsync(Guid? centerId = null);
    Task<ApiResponse<RoomDto>> GetRoomByIdAsync(Guid id);
    Task<ApiResponse<RoomDto>> CreateRoomAsync(CreateRoomDto request);
    Task<ApiResponse<RoomDto>> UpdateRoomAsync(Guid id, UpdateRoomDto request);
    Task<ApiResponse<bool>> DeleteRoomAsync(Guid id);
    Task<ApiResponse<bool>> CheckRoomAvailabilityAsync(Guid roomId, DateTime startsAt, DateTime endsAt, Guid? excludeLessonId = null);
}

public interface ITeacherPayrollService
{
    Task<ApiResponse<List<TeacherPayrollDto>>> GetPayrollsAsync(string? periodMonth = null, Guid? teacherId = null, Guid? centerId = null);
    Task<ApiResponse<TeacherPayrollDto>> GenerateOrGetTeacherPayrollAsync(Guid teacherId, string periodMonth);
    Task<ApiResponse<List<TeacherPayrollDto>>> GenerateCenterPayrollsAsync(GeneratePayrollRequestDto request);
    Task<ApiResponse<TeacherPayrollDto>> PayTeacherAsync(Guid payrollId, PayPayrollRequestDto request);
}

public interface INotificationService
{
    Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(bool unreadOnly = false);
    Task<ApiResponse<int>> GetUnreadCountAsync();
    Task<ApiResponse<bool>> MarkAsReadAsync(Guid notificationId);
    Task<ApiResponse<bool>> MarkAllAsReadAsync();
    Task SendNotificationAsync(CreateNotificationDto request);
}

public interface IExamService
{
    Task<ApiResponse<List<ExamDto>>> GetExamsAsync(Guid? groupId = null);
    Task<ApiResponse<ExamDto>> GetExamByIdAsync(Guid id);
    Task<ApiResponse<ExamDto>> CreateExamAsync(CreateExamDto request);
    Task<ApiResponse<bool>> SaveExamResultsBatchAsync(BatchSaveExamResultsDto request);
    Task<ApiResponse<List<ExamResultDto>>> GetStudentExamResultsAsync(Guid? studentId = null);
}

public interface ICertificateService
{
    Task<ApiResponse<List<CertificateDto>>> GetCertificatesAsync(Guid? studentId = null);
    Task<ApiResponse<CertificateDto>> IssueCertificateAsync(IssueCertificateDto request);
    Task<ApiResponse<CertificateDto>> VerifyCertificateAsync(string certificateCode);
}

public interface IStudentRiskService
{
    Task<ApiResponse<List<StudentRiskDto>>> GetStudentRisksAsync(Guid? centerId = null, Guid? groupId = null);
}

public interface IParentService
{
    Task<ApiResponse<List<ParentChildDto>>> GetMyChildrenAsync();
}
