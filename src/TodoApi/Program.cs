using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TodoApi.Data;
using TodoApi.Middleware;
using TodoApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
var dbProvider = builder.Configuration.GetValue<string>("DatabaseProvider") ?? "Sqlite";
if (dbProvider == "SqlServer")
{
    builder.Services.AddDbContext<TodoDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServer"))
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));
}
else
{
    builder.Services.AddDbContext<TodoDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("Sqlite"))
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));
}

// Services
builder.Services.AddScoped<ITodoService, TodoService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var emailJsKey = builder.Configuration["EmailJs:PublicKey"];
if (!string.IsNullOrEmpty(emailJsKey))
    builder.Services.AddHttpClient<IEmailService, EmailJsEmailService>();
else
    builder.Services.AddSingleton<IEmailService, ConsoleEmailService>();

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });
builder.Services.AddAuthorization();

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Todo API",
        Version = "v1",
        Description = "A RESTful API for managing todo items with support for priorities, statuses, categories, and due dates.",
    });

    var apiXmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var apiXmlPath = Path.Combine(AppContext.BaseDirectory, apiXmlFile);
    options.IncludeXmlComments(apiXmlPath);

    var sharedXmlFile = "TodoApi.Shared.xml";
    var sharedXmlPath = Path.Combine(AppContext.BaseDirectory, sharedXmlFile);
    if (File.Exists(sharedXmlPath))
        options.IncludeXmlComments(sharedXmlPath);
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:5173" })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Apply migrations on startup (skip for in-memory provider used in tests)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TodoDbContext>();
    if (db.Database.IsSqlite())
    {
        db.Database.Migrate();
    }
    else if (db.Database.ProviderName != "Microsoft.EntityFrameworkCore.InMemory")
    {
        // Migrations were generated for SQLite; use EnsureCreated for SQL Server
        // to create schema directly from the model with correct column types.
        db.Database.EnsureCreated();
    }
}

// Middleware pipeline
app.UseMiddleware<GlobalExceptionHandler>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Required for integration testing with WebApplicationFactory
public partial class Program { }
