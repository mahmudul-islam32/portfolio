# Portfolio Application

A modern, single-page portfolio application built with React and Strapi (Headless CMS), fully containerized with Docker.

## Features

- 🎨 Modern, responsive design
- 📱 Mobile-friendly interface
- 🚀 Fast performance
- ✏️ Content management through Strapi CMS
- 📝 Markdown tech blog (`frontend/src/content/posts/`)
- 🐳 Fully dockerized setup
- 📦 All content editable from Strapi admin panel

## Tech Stack

- **Frontend**: React 18
- **Backend**: Strapi 4.15.5
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose

## Project Structure

```
Portfolio/
├── backend/              # Strapi CMS backend
│   ├── src/
│   │   └── api/         # Content types (About, Skills, Projects, Experience)
│   ├── config/          # Strapi configuration
│   ├── Dockerfile
│   └── package.json
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   # Docker orchestration
└── README.md
```

## Content Types

The portfolio supports the following content types in Strapi:

1. **About** (Single Type)
   - Name, Title, Bio
   - Profile Image
   - Resume file
   - Contact information (Email, Phone, Location)
   - Social links

2. **Skills** (Collection Type)
   - Skill name
   - Proficiency level (0-100)
   - Category (frontend, backend, database, tools, other)
   - Icon image

3. **Projects** (Collection Type)
   - Title, Description
   - Images
   - Technologies list
   - Live URL and GitHub URL
   - Featured flag
   - Category

4. **Experience** (Collection Type)
   - Title, Company
   - Location
   - Start/End dates
   - Current position flag
   - Description
   - Type (work/education)
   - Company logo

## Blog

Posts are Markdown files in `frontend/src/content/posts/`, named `YYYY-MM-DD-slug.md`, with `title`, `summary`, and `tags` front matter. They are listed at `/blog` and previewed on the home page. See `frontend/src/content/README.md` for the format.

To build the frontend without Docker: `cd frontend && npm install && npm run build:local`.

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your system
- Git (optional, for cloning)

### Installation & Setup

1. **Clone or navigate to the project directory**
   ```bash
   cd Portfolio
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Build and start the PostgreSQL database
   - Build and start the Strapi backend
   - Build and start the React frontend

3. **Access the applications**

   - **Strapi Admin Panel**: http://localhost:1337/admin
   - **Frontend Application**: http://localhost:3000
   - **Strapi API**: http://localhost:1337/api

4. **Create Admin Account**

   On first run, visit http://localhost:1337/admin and create your admin account.

5. **Configure Content Types**

   After logging into Strapi:
   - Go to Content-Type Builder
   - The content types (About, Skill, Project, Experience) should already be created
   - Configure permissions:
     - Go to Settings → Roles → Public
     - Enable `find` and `findOne` permissions for:
       - About
       - Skills
       - Projects
       - Experiences

6. **Add Content**

   - Create your About entry (Content Manager → About → Create new entry)
   - Add Skills, Projects, and Experience entries
   - Publish all entries to make them visible on the frontend

### Development Mode

For development with hot-reload:

```bash
# Start services
docker-compose up

# To view logs
docker-compose logs -f

# To stop services
docker-compose down

# To rebuild after changes
docker-compose up --build
```

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend/` directory (or use the provided `.env` file):

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
JWT_SECRET=your-jwt-secret-here
TRANSFER_TOKEN_SALT=your-transfer-token-salt-here

DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
DATABASE_SSL=false
```

### Frontend

The frontend uses `REACT_APP_STRAPI_URL` environment variable (set in docker-compose.yml).

## Customization

### Styling

The frontend uses CSS modules. You can customize colors and styling in:
- `frontend/src/App.css` - Global styles
- Individual component CSS files in `frontend/src/components/`

### Content Structure

All content structure is defined in Strapi. Modify content types in:
- `backend/src/api/[content-type]/content-types/[content-type]/schema.json`

Then rebuild the Strapi container.

## API Endpoints

The frontend fetches data from these Strapi endpoints:
- `/api/about?populate=*` - About section
- `/api/skills?populate=*&sort=level:desc` - Skills list
- `/api/projects?populate=*&sort=createdAt:desc` - Projects list
- `/api/experiences?populate=*&sort=startDate:desc` - Experience list

## Troubleshooting

### Port conflicts

If ports 3000, 1337, or 5432 are already in use, modify them in `docker-compose.yml`.

### Database connection issues

Ensure the PostgreSQL container is running:
```bash
docker-compose ps
```

### Frontend not loading data

1. Check if Strapi is running: http://localhost:1337/admin
2. Verify content permissions in Strapi (Settings → Roles → Public)
3. Check browser console for API errors
4. Verify `REACT_APP_STRAPI_URL` environment variable

### Rebuilding containers

If you make changes to dependencies or configuration:
```bash
docker-compose down
docker-compose up --build
```

## Production Deployment

For production:

1. Update environment variables with secure values
2. Set `NODE_ENV=production` in docker-compose.yml
3. Build optimized frontend: `npm run build` in frontend container
4. Use a reverse proxy (nginx) for serving static files
5. Set up SSL certificates
6. Use environment-specific database credentials

## License

MIT

## Support

For issues or questions, please check the Strapi documentation:
- https://docs.strapi.io
- https://react.dev

