---
title: "Webhook Setup"
description: "Configuring Webhooks for ASP.NET Core applications."
---

# Webhook Fundamentals

`Telegrator.Hosting.Web` allows your bot to receive updates via Webhooks instead of long-polling. This is highly recommended for production environments as it's more efficient and reactive.

## Installation

```shell
dotnet add package Telegrator.Hosting.Web
```

## Basic Usage

In an ASP.NET Core application, use `AddTelegratorWeb` and `UseTelegratorWeb`:

```csharp
using Telegrator.Hosting.Web;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Web-specific Telegrator services
builder.AddTelegratorWeb();

// 2. Register handlers as usual
builder.Handlers.CollectHandlersAssemblyWide();

var app = builder.Build();

// 3. Map the webhook endpoint
// Default route is /api/telegrator/update
app.UseTelegratorWeb();

await app.RunAsync();
```

## Configuration Options

You can customize the webhook behavior using `TelegramBotWebOptions`:

```csharp
builder.Services.Configure<TelegramBotWebOptions>(options => {
    options.EndpointPath = "/my/secret/path";
    options.SecretToken = "A_Secure_Token";
});
```

## Advantages
- **Resources**: Doesn't keep an open connection idle.
- **Latency**: Updates reach the bot almost instantly.
- **Scalability**: Can be easily balanced behind Nginx or Cloud Load Balancers.

## Requirements
- **HTTPS**: Telegram only sends webhooks to secure URLs.
- **Valid SSL**: Self-signed certificates are only allowed if you manually upload your public key to Telegram.
- **Public URL**: Your server must be accessible from the internet (use `ngrok` for local development).
