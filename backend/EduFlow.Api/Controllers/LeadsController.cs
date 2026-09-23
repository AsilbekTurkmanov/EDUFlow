using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class LeadsController : ControllerBase
{
    private readonly ILeadService _leadService;

    public LeadsController(ILeadService leadService)
    {
        _leadService = leadService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<LeadDto>>>> GetLeads(
        [FromQuery] Guid? centerId = null,
        [FromQuery] LeadStatus? status = null,
        [FromQuery] LeadSource? source = null,
        [FromQuery] string? search = null)
    {
        var result = await _leadService.GetLeadsAsync(centerId, status, source, search);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<LeadDto>>> GetLeadById(Guid id)
    {
        var result = await _leadService.GetLeadByIdAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<LeadSummaryStatsDto>>> GetStats([FromQuery] Guid? centerId = null)
    {
        var result = await _leadService.GetLeadStatsAsync(centerId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<LeadDto>>> CreateLead([FromBody] CreateLeadDto request)
    {
        var result = await _leadService.CreateLeadAsync(request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<LeadDto>>> UpdateLead(Guid id, [FromBody] UpdateLeadDto request)
    {
        var result = await _leadService.UpdateLeadAsync(id, request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult<ApiResponse<LeadDto>>> UpdateLeadStatus(Guid id, [FromBody] UpdateLeadStatusDto request)
    {
        var result = await _leadService.UpdateLeadStatusAsync(id, request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("{id:guid}/convert")]
    public async Task<ActionResult<ApiResponse<UserDto>>> ConvertLeadToStudent(Guid id, [FromBody] ConvertLeadDto request)
    {
        var result = await _leadService.ConvertLeadToStudentAsync(id, request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteLead(Guid id)
    {
        var result = await _leadService.DeleteLeadAsync(id);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}
