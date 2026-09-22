using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentsController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AssignmentDto>>>> GetAssignments([FromQuery] Guid? groupId = null)
    {
        var result = await _assignmentService.GetAssignmentsAsync(groupId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> GetAssignmentById(Guid id)
    {
        var result = await _assignmentService.GetAssignmentByIdAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<ApiResponse<AssignmentDto>>> CreateAssignment([FromBody] CreateAssignmentDto request)
    {
        var result = await _assignmentService.CreateAssignmentAsync(request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("{id}/submissions")]
    [Authorize(Roles = "Admin,Teacher,Student")]
    public async Task<ActionResult<ApiResponse<List<SubmissionDto>>>> GetSubmissions(Guid id)
    {
        var result = await _assignmentService.GetSubmissionsAsync(id);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("submit")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> SubmitAssignment([FromBody] SubmitAssignmentDto request)
    {
        var result = await _assignmentService.SubmitAssignmentAsync(request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("submissions/{submissionId}/grade")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<ActionResult<ApiResponse<SubmissionDto>>> GradeSubmission(Guid submissionId, [FromBody] GradeSubmissionDto request)
    {
        var result = await _assignmentService.GradeSubmissionAsync(submissionId, request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Student")]
    public async Task<ActionResult<ApiResponse<List<PaymentDto>>>> GetPayments([FromQuery] Guid? studentId = null)
    {
        var result = await _paymentService.GetPaymentsAsync(studentId);
        return Ok(result);
    }

    [HttpGet("balance")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<ApiResponse<StudentBalanceDto>>> GetStudentBalance()
    {
        var result = await _paymentService.GetStudentBalanceAsync();
        return Ok(result);
    }

    [HttpPost]
    [HttpPost("pay")]
    [Authorize(Roles = "Admin,Student")]
    public async Task<ActionResult<ApiResponse<PaymentDto>>> CreatePayment([FromBody] CreatePaymentDto request)
    {
        var result = await _paymentService.CreatePaymentAsync(request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("debts")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<List<StudentDebtDto>>>> GetDebtsReport()
    {
        var result = await _paymentService.GetDebtsReportAsync();
        return Ok(result);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ICurrentUserService _currentUser;

    public DashboardController(IDashboardService dashboardService, ICurrentUserService currentUser)
    {
        _dashboardService = dashboardService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<object>>> GetDashboard()
    {
        if (_currentUser.Role == UserRole.Admin)
        {
            var adminData = await _dashboardService.GetAdminDashboardAsync();
            return Ok(adminData);
        }
        else if (_currentUser.Role == UserRole.Teacher)
        {
            var teacherData = await _dashboardService.GetTeacherDashboardAsync();
            return Ok(teacherData);
        }
        else
        {
            var studentData = await _dashboardService.GetStudentDashboardAsync();
            return Ok(studentData);
        }
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<AuditLogDto>>>> GetRecentLogs([FromQuery] int count = 50)
    {
        var result = await _auditLogService.GetRecentLogsAsync(count);
        return Ok(result);
    }
}
