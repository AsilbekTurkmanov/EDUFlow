using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LessonsController : ControllerBase
{
    private readonly ILessonService _lessonService;

    public LessonsController(ILessonService lessonService)
    {
        _lessonService = lessonService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<LessonDto>>>> GetLessons(
        [FromQuery] Guid? groupId = null,
        [FromQuery] DateTime? date = null)
    {
        var result = await _lessonService.GetLessonsAsync(groupId, date);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<LessonDto>>> GetLessonById(Guid id)
    {
        var result = await _lessonService.GetLessonByIdAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<ApiResponse<LessonDto>>> CreateLesson([FromBody] CreateLessonDto request)
    {
        var result = await _lessonService.CreateLessonAsync(request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteLesson(Guid id)
    {
        var result = await _lessonService.DeleteLessonAsync(id);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AttendanceController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    [HttpGet("lesson/{lessonId}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<ActionResult<ApiResponse<List<AttendanceDto>>>> GetAttendance(Guid lessonId)
    {
        var result = await _attendanceService.GetAttendanceByLessonAsync(lessonId);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("batch")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveAttendanceBatch([FromBody] SaveAttendanceBatchDto request)
    {
        var result = await _attendanceService.SaveAttendanceBatchAsync(request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}
