using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Application.Interfaces;
using ClubManagement.Services.Interfaces;
using ClubManagement.Services;
using ClubManagement.Services.Implementations;
using ClubManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// ✅ CORS – allow the Vite dev server (and production origin) to call the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",   // Vite dev server
                "https://localhost:5173"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<IDonationService, DonationService>();
builder.Services.AddScoped<IDonationCategoryService, DonationCategoryService>();
builder.Services.AddScoped<IPaymentMethodService, PaymentMethodService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// ✅ Identity setup
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequiredLength = 6;
    options.Password.RequireDigit = true;
    options.Password.RequireNonAlphanumeric = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ✅ Cookie behaviour: return 401/403 for API calls instead of redirecting to /Account/Login
builder.Services.ConfigureApplicationCookie(options =>
{
    // Prevent the cookie middleware from redirecting API requests to a login page
    options.Events.OnRedirectToLogin = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };

    // In development the Vite proxy serves over HTTP, so drop the Secure flag
    // so the browser can store the cookie without HTTPS
    if (builder.Environment.IsDevelopment())
    {
        options.Cookie.SecurePolicy = CookieSecurePolicy.None;
        options.Cookie.SameSite = SameSiteMode.Lax;
    }
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
var app = builder.Build();

// Seed Roles
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await DbInitializer.SeedAsync(services);
}

// Enable Swagger in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");   // ✅ must be before UseAuthorization
app.UseAuthentication();         // ✅ reads the session cookie
app.UseAuthorization();
app.MapControllers();
app.Run();