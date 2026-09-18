using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CourseDto>>>> GetCourses()
    {
        var result = await _courseService.GetCoursesAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CourseDto>>> GetCourseById(Guid id)
    {
        var result = await _courseService.GetCourseByIdAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<CourseDto>>> CreateCourse([FromBody] CreateCourseDto request)
    {
        var result = await _courseService.CreateCourseAsync(request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<CourseDto>>> UpdateCourse(Guid id, [FromBody] CreateCourseDto request)
    {
        var result = await _courseService.UpdateCourseAsync(id, request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCourse(Guid id)
    {
        var result = await _courseService.DeleteCourseAsync(id);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GroupsController : ControllerBase
{
    private readonly IGroupService _groupService;

    public GroupsController(IGroupService groupService)
    {
        _groupService = groupService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<GroupDto>>>> GetGroups([FromQuery] Guid? teacherId = null)
    {
        var result = await _groupService.GetGroupsAsync(teacherId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<GroupDto>>> GetGroupById(Guid id)
    {
        var result = await _groupService.GetGroupByIdAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<GroupDto>>> CreateGroup([FromBody] CreateGroupDto request)
    {
        var result = await _groupService.CreateGroupAsync(request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<GroupDto>>> UpdateGroup(Guid id, [FromBody] CreateGroupDto request)
    {
        var result = await _groupService.UpdateGroupAsync(id, request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteGroup(Guid id)
    {
        var result = await _groupService.DeleteGroupAsync(id);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("{id}/students")]
    public async Task<ActionResult<ApiResponse<List<EnrollmentDto>>>> GetGroupStudents(Guid id)
    {
        var result = await _groupService.GetGroupStudentsAsync(id);
        return Ok(result);
    }

    [HttpPost("enroll")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<EnrollmentDto>>> EnrollStudent([FromBody] EnrollStudentDto request)
    {
        var result = await _groupService.EnrollStudentAsync(request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("enrollments/{enrollmentId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveStudent(Guid enrollmentId)
    {
        var result = await _groupService.RemoveStudentAsync(enrollmentId);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}
