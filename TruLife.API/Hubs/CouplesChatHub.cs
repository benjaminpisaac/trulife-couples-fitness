using Microsoft.AspNetCore.SignalR;

namespace TruLife.API.Hubs
{
    public class CouplesChatHub : Hub
    {
        public async Task SendMessage(int coupleProfileId, string message, string messageType = "text")
        {
            // Send message to all clients in the couple's group
            await Clients.Group($"couple_{coupleProfileId}").SendAsync("ReceiveMessage", new
            {
                senderId = Context.UserIdentifier,
                message = message,
                messageType = messageType,
                timestamp = DateTime.UtcNow
            });
        }

        public async Task JoinCoupleGroup(int coupleProfileId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"couple_{coupleProfileId}");
        }

        public async Task LeaveCoupleGroup(int coupleProfileId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"couple_{coupleProfileId}");
        }

        public async Task SendFlirtMessage(int coupleProfileId, string messageId)
        {
            await Clients.Group($"couple_{coupleProfileId}").SendAsync("ReceiveFlirtMessage", new
            {
                senderId = Context.UserIdentifier,
                messageId = messageId,
                timestamp = DateTime.UtcNow
            });
        }

        public async Task SendTypingIndicator(int coupleProfileId, bool isTyping)
        {
            await Clients.OthersInGroup($"couple_{coupleProfileId}").SendAsync("TypingIndicator", new
            {
                userId = Context.UserIdentifier,
                isTyping = isTyping
            });
        }
    }
}
