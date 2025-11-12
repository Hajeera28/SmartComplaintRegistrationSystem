using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using SmartComplaint.Data;
using SmartComplaint.Interfaces;
using SmartComplaint.Repositories;
using SmartComplaint.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling =
    Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Description = "Enter JWT token directly (without Bearer prefix)"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database Context
builder.Services.AddDbContext<ComplaintContext>(opt => 
    opt.UseSqlServer(builder.Configuration.GetConnectionString("dbconn")));

// Repository Dependencies
builder.Services.AddScoped<IUser, UserRepository>();
builder.Services.AddScoped<IComplaint, ComplaintRepository>();
builder.Services.AddScoped<IGrievance, GrievanceRepository>();
builder.Services.AddScoped<ICitizen, CitizenRepository>();
builder.Services.AddScoped<IOfficer, OfficerRepository>();
builder.Services.AddScoped<IDepartment, DepartmentRepository>();
builder.Services.AddScoped<IComplaintAssignment, ComplaintAssignmentRepository>();
builder.Services.AddScoped<INotification, NotificationRepository>();

// Service Dependencies
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<ComplaintService>();
builder.Services.AddScoped<GrievanceService>();
builder.Services.AddScoped<CitizenService>();
builder.Services.AddScoped<OfficerService>();
builder.Services.AddScoped<DepartmentService>();
builder.Services.AddScoped<ComplaintAssignmentService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<IToken, TokenService>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(token) && !token.StartsWith("Bearer "))
                {
                    context.Token = token;
                }
                return Task.CompletedTask;
            }
        };
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });


// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Enable serving static files from wwwroot
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
