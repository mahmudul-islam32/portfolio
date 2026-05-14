'use strict';

const seedPortfolio = require('./seed/portfolio-seed');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Enable public access to content types
    try {
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        const actions = [
          'api::about.about.find',
          'api::about.about.findOne',
          'api::skill.skill.find',
          'api::skill.skill.findOne',
          'api::project.project.find',
          'api::project.project.findOne',
          'api::experience.experience.find',
          'api::experience.experience.findOne',
          'api::certification.certification.find',
          'api::certification.certification.findOne',
          'api::language.language.find',
          'api::language.language.findOne',
        ];

        // Get all existing permissions for the public role
        const existingPermissions = await strapi
          .query('plugin::users-permissions.permission')
          .findMany({
            where: { role: publicRole.id },
          });

        const existingActions = existingPermissions.map(p => p.action);

        // Update or create permissions
        for (const action of actions) {
          const existing = existingPermissions.find(p => p.action === action);
          
          if (existing) {
            // Update existing permission
            await strapi
              .query('plugin::users-permissions.permission')
              .update({
                where: { id: existing.id },
                data: { enabled: true },
              });
          } else {
            // Create new permission if it doesn't exist
            await strapi
              .query('plugin::users-permissions.permission')
              .create({
                data: {
                  action: action,
                  role: publicRole.id,
                  enabled: true,
                },
              });
          }
        }

        console.log('✅ Public API permissions configured successfully');
      }
    } catch (error) {
      console.log('⚠️  Could not configure permissions automatically:', error.message);
      console.log('   Please configure permissions manually in Strapi admin panel');
      console.log('   Go to: Settings → Roles → Public → Enable find and findOne for all content types');
    }

    await seedPortfolio(strapi);
  },
};

