using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Domain.Enums;

namespace EduFlow.Application.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
}

public interface ILearningCenterService
{
    Task<ApiResponse<List<LearningCenterDto>>> GetCentersAsync();
    Task<ApiResponse<LearningCenterDto>> GetCenterByIdAsync(Guid id);
    Task<ApiResponse<LearningCenterDto>> CreateCenterAsync(CreateCenterDto request);
    Task<ApiResponse<LearningCenterDto>> UpdateCenterAsync(Guid id, UpdateCenterDto request);
    Task<ApiResponse<LearningCenterDto>> UpdateTariffAsync(Guid id, UpdateCenterTariffDto request);
    Task<ApiResponse<bool>> DeleteCenterAsync(Guid id);
    Task<ApiResponse<List<TariffPlanOptionDto>>> GetTariffPlansAsync();
    Task<ApiResponse<bool>> CheckAndEnforceQuotaAsync(Guid centerId);
}

public interface IAuthService
{
    Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request);
    Task<ApiResponse<UserDto>> GetCurrentUserAsync();
}

public interface IUserService
{
    Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(int page = 1, int pageSize = 20, UserRole? role = null, UserStatus? status = null, string? search = null);
    Task<ApiResponse<UserDto>> GetUserByIdAsync(Guid id);
    Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto request);
    Task<ApiResponse<UserDto>> UpdateUserAsync(Guid id, UpdateUserDto request);
    Task<ApiResponse<bool>> DeleteUserAsync(Guid id);
}

public interface ICourseService
{
    Task<ApiResponse<List<CourseDto>>> GetCoursesAsync();
    Task<ApiResponse<CourseDto>> GetCourseByIdAsync(Guid id);
    Task<ApiResponse<CourseDto>> CreateCourseAsync(CreateCourseDto request);
    Task<ApiResponse<CourseDto>> UpdateCourseAsync(Guid id, CreateCourseDto request);
    Task<ApiResponse<bool>> DeleteCourseAsync(Guid id);
}

public interface IGroupService
{
    Task<ApiResponse<List<GroupDto>>> GetGroupsAsync(Guid? teacherId = null);
    Task<ApiResponse<GroupDto>> GetGroupByIdAsync(Guid id);
    Task<ApiResponse<GroupDto>> CreateGroupAsync(CreateGroupDto request);
    Task<ApiResponse<GroupDto>> UpdateGroupAsync(Guid id, CreateGroupDto request);
    Task<ApiResponse<bool>> DeleteGroupAsync(Guid id);
    Task<ApiResponse<List<EnrollmentDto>>> GetGroupStudentsAsync(Guid groupId);
    Task<ApiResponse<EnrollmentDto>> EnrollStudentAsync(EnrollStudentDto request);
    Task<ApiResponse<bool>> RemoveStudentAsync(Guid enrollmentId);
}

public interface ILessonService
{
    Task<ApiResponse<List<LessonDto>>> GetLessonsAsync(Guid? groupId = null, DateTime? date = null);
    Task<ApiResponse<LessonDto>> GetLessonByIdAsync(Guid id);
    Task<ApiResponse<LessonDto>> CreateLessonAsync(CreateLessonDto request);
    Task<ApiResponse<bool>> DeleteLessonAsync(Guid id);
}

public interface IAttendanceService
{
    Task<ApiResponse<List<AttendanceDto>>> GetAttendanceByLessonAsync(Guid lessonId);
    Task<ApiResponse<bool>> SaveAttendanceBatchAsync(SaveAttendanceBatchDto request);
}

public interface IAssignmentService
{
    Task<ApiResponse<List<AssignmentDto>>> GetAssignmentsAsync(Guid? groupId = null);
    Task<ApiResponse<AssignmentDto>> GetAssignmentByIdAsync(Guid id);
    Task<ApiResponse<AssignmentDto>> CreateAssignmentAsync(CreateAssignmentDto request);
    Task<ApiResponse<List<SubmissionDto>>> GetSubmissionsAsync(Guid assignmentId);
    Task<ApiResponse<SubmissionDto>> SubmitAssignmentAsync(SubmitAssignmentDto request);
    Task<ApiResponse<SubmissionDto>> GradeSubmissionAsync(Guid submissionId, GradeSubmissionDto request);
}

public interface IPaymentService
{
    Task<ApiResponse<List<PaymentDto>>> GetPaymentsAsync(Guid? studentId = null);
    Task<ApiResponse<PaymentDto>> CreatePaymentAsync(CreatePaymentDto request);
    Task<ApiResponse<List<StudentDebtDto>>> GetDebtsReportAsync();
    Task<ApiResponse<StudentBalanceDto>> GetStudentBalanceAsync();
}

public interface IDashboardService
{
    Task<ApiResponse<AdminDashboardDto>> GetAdminDashboardAsync();
    Task<ApiResponse<TeacherDashboardDto>> GetTeacherDashboardAsync();
    Task<ApiResponse<StudentDashboardDto>> GetStudentDashboardAsync();
}

public interface IAuditLogService
{
    Task LogAsync(string action, string entity, string? entityId = null, string? metadata = null);
    Task<ApiResponse<List<AuditLogDto>>> GetRecentLogsAsync(int count = 50);
}
