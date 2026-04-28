# Integration & Deployment

Telegrator works in console, hosted applications, and ASP.NET Core (webhook) projects.

## Console Applications

Simple console bot setup:

```csharp
class Program
{
    static void Main(string[] args)
    {
        var bot = new TelegratorClient("<YOUR_BOT_TOKEN>");
        bot.Handlers.CollectHandlersDomainWide();
        bot.StartReceiving();
        Console.ReadLine();
    }
}
```

## ASP.NET Core Hosting

Telegrator provides seamless integration with .NET's generic host through the `Telegrator.Hosting` package, making it easy to build production-ready bot applications.

Host your bot in ASP.NET Core applications:

```csharp
using Telegrator.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add Telegrator services (with handler collection)
builder.AddTelegrator(action: b => {
    b.Handlers.CollectHandlers(); // Standard collection
});

var app = builder.Build();

app.MapFallback(() => "Bot is running...");

// Initialize Telegrator
app.UseTelegrator();

app.Run();
```

> **How is it working?**
> 1. **Generic Host Integration**: `TelegramBotHost` implements `IHost` and integrates with .NET's generic host.
> 2. **Lifecycle Management**: The host manages the bot's startup, shutdown, and graceful termination.
> 3. **Dependency Injection**: All handlers and services are automatically registered with the DI container.
> 4. **Configuration**: Supports standard .NET configuration patterns (appsettings.json, environment variables, etc.).
> 5. **Logging**: Integrates with .NET's logging infrastructure for comprehensive monitoring.
> 6. **Health Checks**: Can be integrated with .NET's health check system for production monitoring.


## Webhook Deployment

Deploy your bot using webhooks for production using the `Telegrator.Hosting.Web` package:

```csharp
using Telegrator.Hosting.Web;

var builder = WebApplication.CreateBuilder(args);

// Add Telegrator Web services
builder.AddTelegratorWeb();

// Configure services
builder.Services.AddSingleton<IMyService, MyService>();

// Register handlers
builder.Handlers.CollectHandlersAssemblyWide();

var app = builder.Build();

// Initialize Telegrator Web (maps webhook endpoint)
app.UseTelegratorWeb();

await app.RunAsync();
```

> **How is it working?**
> 1. **Webhook Integration**: `TelegramBotWebHost` handles incoming webhook requests from Telegram.
> 2. **Security**: Supports secret token validation for secure webhook handling.
> 3. **Scalability**: Webhook hosting is more efficient for high-traffic bots compared to long-polling.
> 4. **Production Ready**: Includes health checks, logging, and monitoring capabilities.
> 5. **SSL Required**: Webhook hosting requires HTTPS for production use.
