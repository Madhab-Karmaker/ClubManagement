using ClubManagement.Domain.Constants;
using ClubManagement.Domain.Models;
using Microsoft.AspNetCore.Identity;

namespace ClubManagement.Infrastructure.Data
{
    // Provides methods to initialize the database with default data.
    public static class DbInitializer
    {
        // Seeds the database with default roles (Admin, Member) if they do not exist.
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();

            // Seed Roles
            string[] roles = { RoleConstants.Admin, RoleConstants.Member };

            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // Optional: Seed an initial Admin user if needed
            // var adminEmail = "admin@club.com";
            // if (await userManager.FindByEmailAsync(adminEmail) == null)
            // {
            //     var adminUser = new User { UserName = "admin", Email = adminEmail };
            //     await userManager.CreateAsync(adminUser, "Admin@123");
            //     await userManager.AddToRoleAsync(adminUser, RoleConstants.Admin);
            // }
        }
    }
}
