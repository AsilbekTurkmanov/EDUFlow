using System.Text;
using System.Text.Json.Serialization;
using EduFlow.Api.Middleware;
using EduFlow.Api.Services;
using EduFlow.Application.Interfaces;
using EduFlow.Infrastructure.Data;
using EduFlow.Infrastructure.Hubs;
using EduFlow.Infrastructure.Security;
using EduFlow.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Database PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<EduFlowDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// 2. Security & JWT
var secretKey = builder.Configuration["Jwt:SecretKey"] ?? SecurityDefaults.DefaultSecretKey;
var issuer = builder.Configuration["Jwt:Issuer"] ?? SecurityDefaults.DefaultIssuer;
var audience = builder.Configuration["Jwt:Audience"] ?? SecurityDefaults.DefaultAudience;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSignalR();

// 3. DI Services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ILearningCenterService, LearningCenterService>();
builder.Services.AddScoped<ILeadService, LeadService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<ITeacherPayrollService, TeacherPayrollService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<ICertificateService, CertificateService>();
builder.Services.AddScoped<IStudentRiskService, StudentRiskService>();
builder.Services.AddScoped<IParentService, ParentService>();

// 4. Controllers & JSON settings
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// 5. OpenAPI & Scalar
builder.Services.AddOpenApi();

// 6. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Global Exception Handler
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.UseCors("AllowAll");

// Scalar & OpenAPI
app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options.WithTitle("EduFlow API Documentation")
           .WithTheme(ScalarTheme.Moon)
           .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<EduFlowHub>("/hubs/eduflow");

// Initialize & Seed Database
try
{
    await DatabaseInitializer.InitializeAsync(app.Services);
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Ma'lumotlar bazasini initsializatsiya qilishda xatolik yuz berdi.");
}

app.Run();
