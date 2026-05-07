namespace RozgarHub.Api.Services;

public sealed class SyncStatus
{
    public bool IsRunning { get; init; }
    public DateTime? LastSyncUtc { get; init; }
    public int CooldownSecondsRemaining { get; init; }
}
