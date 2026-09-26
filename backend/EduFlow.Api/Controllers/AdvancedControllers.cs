using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduFlow.Api.Controllers;

// ==========================================
// 1. ROOMS CONTROLLER
// ==========================================
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<RoomDto>>>> GetRooms([FromQuery] Guid? centerId)
    {
        var result = await _roomService.GetRoomsAsync(centerId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> GetRoomById(Guid id)
    {
        var result = await _roomService.GetRoomByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> CreateRoom([FromBody] CreateRoomDto request)
    {
        var result = await _roomService.CreateRoomAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<RoomDto>>> UpdateRoom(Guid id, [FromBody] UpdateRoomDto request)
    {
        var result = await _roomService.UpdateRoomAsync(id, request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteRoom(Guid id)
    {
        var result = await _roomService.DeleteRoomAsync(id);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("{id}/check-availability")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckAvailability(
        Guid id,
        [FromQuery] DateTime startsAt,
        [FromQuery] DateTime endsAt,
        [FromQuery] Guid? excludeLessonId)
    {
        var result = await _roomService.CheckRoomAvailabilityAsync(id, startsAt, endsAt, excludeLessonId);
        return Ok(result);
    }
}

// ==========================================
// 2. PAYROLL CONTROLLER
// ==========================================
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly ITeacherPayrollService _payrollService;

    public PayrollController(ITeacherPayrollService payrollService)
    {
        _payrollService = payrollService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TeacherPayrollDto>>>> GetPayrolls(
        [FromQuery] string? periodMonth,
        [FromQuery] Guid? teacherId,
        [FromQuery] Guid? centerId)
    {
        var result = await _payrollService.GetPayrollsAsync(periodMonth, teacherId, centerId);
        return Ok(result);
    }

    [HttpGet("teacher/{teacherId}")]
    public async Task<ActionResult<ApiResponse<TeacherPayrollDto>>> GetTeacherPayroll(
        Guid teacherId,
        [FromQuery] string periodMonth)
    {
        var month = string.IsNullOrWhiteSpace(periodMonth) ? DateTime.UtcNow.ToString("yyyy-MM") : periodMonth;
        var result = await _payrollService.GenerateOrGetTeacherPayrollAsync(teacherId, month);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("generate-center")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<List<TeacherPayrollDto>>>> GenerateCenterPayrolls([FromBody] GeneratePayrollRequestDto request)
    {
        var result = await _payrollService.GenerateCenterPayrollsAsync(request);
        return Ok(result);
    }

    [HttpPost("{id}/pay")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<TeacherPayrollDto>>> PayTeacher(Guid id, [FromBody] PayPayrollRequestDto request)
    {
        var result = await _payrollService.PayTeacherAsync(id, request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }
}

// ==========================================
// 3. NOTIFICATIONS CONTROLLER
// ==========================================
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetNotifications([FromQuery] bool unreadOnly = false)
    {
        var result = await _notificationService.GetUserNotificationsAsync(unreadOnly);
        return Ok(result);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
    {
        var result = await _notificationService.GetUnreadCountAsync();
        return Ok(result);
    }

    [HttpPost("{id}/read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(Guid id)
    {
        var result = await _notificationService.MarkAsReadAsync(id);
        return Ok(result);
    }

    [HttpPost("read-all")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsRead()
    {
        var result = await _notificationService.MarkAllAsReadAsync();
        return Ok(result);
    }
}

// ==========================================
// 4. EXAMS CONTROLLER
// ==========================================
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExamsController : ControllerBase
{
    private readonly IExamService _examService;

    public ExamsController(IExamService examService)
    {
        _examService = examService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ExamDto>>>> GetExams([FromQuery] Guid? groupId)
    {
        var result = await _examService.GetExamsAsync(groupId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> GetExamById(Guid id)
    {
        var result = await _examService.GetExamByIdAsync(id);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<ApiResponse<ExamDto>>> CreateExam([FromBody] CreateExamDto request)
    {
        var result = await _examService.CreateExamAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpPost("batch-results")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveExamResults([FromBody] BatchSaveExamResultsDto request)
    {
        var result = await _examService.SaveExamResultsBatchAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("student-results")]
    public async Task<ActionResult<ApiResponse<List<ExamResultDto>>>> GetStudentResults([FromQuery] Guid? studentId)
    {
        var result = await _examService.GetStudentExamResultsAsync(studentId);
        return Ok(result);
    }
}

// ==========================================
// 5. CERTIFICATES CONTROLLER
// ==========================================
[ApiController]
[Route("api/[controller]")]
public class CertificatesController : ControllerBase
{
    private readonly ICertificateService _certificateService;

    public CertificatesController(ICertificateService certificateService)
    {
        _certificateService = certificateService;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<ApiResponse<List<CertificateDto>>>> GetCertificates([FromQuery] Guid? studentId)
    {
        var result = await _certificateService.GetCertificatesAsync(studentId);
        return Ok(result);
    }

    [HttpPost("issue")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<ApiResponse<CertificateDto>>> IssueCertificate([FromBody] IssueCertificateDto request)
    {
        var result = await _certificateService.IssueCertificateAsync(request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [HttpGet("verify/{code}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<CertificateDto>>> VerifyCertificate(string code)
    {
        var result = await _certificateService.VerifyCertificateAsync(code);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }
}

// ==========================================
// 6. STUDENT RISKS CONTROLLER
// ==========================================
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Teacher")]
public class StudentRisksController : ControllerBase
{
    private readonly IStudentRiskService _riskService;

    public StudentRisksController(IStudentRiskService riskService)
    {
        _riskService = riskService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<StudentRiskDto>>>> GetStudentRisks([FromQuery] Guid? centerId, [FromQuery] Guid? groupId)
    {
        var result = await _riskService.GetStudentRisksAsync(centerId, groupId);
        return Ok(result);
    }
}

// ==========================================
// 7. PARENT CONTROLLER
// ==========================================
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ParentController : ControllerBase
{
    private readonly IParentService _parentService;

    public ParentController(IParentService parentService)
    {
        _parentService = parentService;
    }

    [HttpGet("children")]
    public async Task<ActionResult<ApiResponse<List<ParentChildDto>>>> GetMyChildren()
    {
        var result = await _parentService.GetMyChildrenAsync();
        return Ok(result);
    }
}
