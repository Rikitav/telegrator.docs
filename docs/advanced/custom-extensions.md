# Custom Extensions

You can extend Telegrator by creating custom filters, aspects, and state keepers.

## Custom Filters
```csharp
public class RateLimitFilter : FilterAnnotation<Message>
{
    private readonly Dictionary<long, DateTime> _lastExecution = new();
    private readonly TimeSpan _cooldown = TimeSpan.FromSeconds(5);

    public override bool CanPass(FilterExecutionContext<Message> context)
    {
        var userId = context.Input.From?.Id;
        if (userId == null) return true;

        if (_lastExecution.TryGetValue(userId.Value, out var lastExec))
        {
            if (DateTime.Now - lastExec < _cooldown)
                return false; // Rate limit exceeded
        }

        _lastExecution[userId.Value] = DateTime.Now;
        return true;
    }
}
```

## Custom State Machines
You can implement your own state transition logic by implementing the `IStateMachine<TState>` interface. This allows for complex state transitions beyond simple linear progression.

```csharp
public class BranchingStateMachine : IStateMachine<UserState>
{
    public async Task Advance(IStateStorage storage, string updateKey, CancellationToken ct)
    {
        // Custom logic to decide next state based on current state or complex rules
    }

    public async Task<UserState?> Current(IStateStorage storage, string updateKey, CancellationToken ct)
    {
        return await storage.GetAsync<UserState>(updateKey, ct);
    }
    
    // Retreat, Reset implementations...
}
```

## Custom State Storage
Implement `IStateStorage` to persist user states in your preferred database (SQL, MongoDB, etc.).

```csharp
public class MyDatabaseStorage : IStateStorage
{
    public async Task SetAsync<T>(string key, T state, CancellationToken ct)
    {
        // Save to DB
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct)
    {
        // Retrieve from DB
    }

    public async Task DeleteAsync(string key, CancellationToken ct)
    {
        // Delete from DB
    }
}
```

## Automatic Handler Discovery
Telegrator provides automatic discovery and registration of handlers across your entire application domain using the `CollectHandlersDomainWide()` method.

**How it works:**
- Scans all loaded assemblies in the current domain
- Automatically discovers classes decorated with handler attributes
- Registers them with the bot without manual registration

**Example:**
```csharp
var bot = new TelegratorClient("<YOUR_BOT_TOKEN>");
bot.Handlers.CollectHandlersDomainWide(); // Automatically finds and registers all handlers
bot.StartReceiving();
```

**Benefits:**
- No need to manually register each handler
- Reduces boilerplate code
- Ensures all handlers are discovered automatically
- Perfect for large applications with many handlers
