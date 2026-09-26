using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace EduFlow.Infrastructure.Hubs;

[Authorize]
public class EduFlowHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        var centerClaim = Context.User?.FindFirst("CenterId")?.Value;
        if (!string.IsNullOrEmpty(centerClaim))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Center_{centerClaim}");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        var centerClaim = Context.User?.FindFirst("CenterId")?.Value;
        if (!string.IsNullOrEmpty(centerClaim))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Center_{centerClaim}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}
