using ClubManagement.Domain.Models;
using ClubManagement.Infrastructure.Data;
using ClubManagement.Services.Interfaces;
using ClubManagement.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddScoped<IUserService, UserService>();
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

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
var app = builder.Build();

// Enable Swagger in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
