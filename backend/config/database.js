const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'postgres');

  if (client === 'sqlite') {
    const filename = env(
      'DATABASE_FILENAME',
      path.join(__dirname, '..', '.tmp', 'data.db')
    );
    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.isAbsolute(filename)
            ? filename
            : path.join(__dirname, '..', filename),
        },
        useNullAsDefault: true,
      },
    };
  }

  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false),
      },
    },
  };
};
