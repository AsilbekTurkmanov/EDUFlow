using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CentersController : ControllerBase
{
    private readonly ILearningCenterService _centerService;
    private readonly ICurrentUserService _currentUser;
    private readonly IUserService _userService;

    public CentersController(
        ILearningCenterService centerService,
        ICurrentUserService currentUser,
        IUserService userService)
    {
        _centerService = centerService;
        _currentUser = currentUser;
        _userService = userService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<List<LearningCenterDto>>>> GetCenters()
    {
        var result = await _centerService.GetCentersAsync();
        return Ok(result);
    }

    [HttpGet("tariffs")]
    public async Task<ActionResult<ApiResponse<List<TariffPlanOptionDto>>>> GetTariffPlans()
    {
        var result = await _centerService.GetTariffPlansAsync();
        return Ok(result);
    }

    [HttpGet("current")]
    public async Task<ActionResult<ApiResponse<LearningCenterDto>>> GetCurrentCenter()
    {
        var user = await _userService.GetUserByIdAsync(_currentUser.UserId ?? Guid.Empty);
        if (user?.Data?.CenterId == null)
        {
            // If Super Admin without center, return first center or all
            var all = await _centerService.GetCentersAsync();
            if (all.Data != null && all.Data.Any())
                return Ok(ApiResponse<LearningCenterDto>.Ok(all.Data.First()));

            return NotFound(ApiResponse<LearningCenterDto>.Fail("Foydalanuvchiga biriktirilgan markaz topilmadi."));
        }

        var result = await _centerService.GetCenterByIdAsync(user.Data.CenterId.Value);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<LearningCenterDto>>> GetCenterById(Guid id)
    {
        var result = await _centerService.GetCenterByIdAsync(id);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<LearningCenterDto>>> CreateCenter([FromBody] CreateCenterDto request)
    {
        var result = await _centerService.CreateCenterAsync(request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<LearningCenterDto>>> UpdateCenter(Guid id, [FromBody] UpdateCenterDto request)
    {
        var result = await _centerService.UpdateCenterAsync(id, request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}/tariff")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<LearningCenterDto>>> UpdateTariff(Guid id, [FromBody] UpdateCenterTariffDto request)
    {
        var result = await _centerService.UpdateTariffAsync(id, request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCenter(Guid id)
    {
        var result = await _centerService.DeleteCenterAsync(id);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}
