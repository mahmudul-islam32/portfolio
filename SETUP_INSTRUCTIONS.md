# Portfolio Setup Instructions

## ✅ Permissions Already Configured!

The API permissions have been automatically configured. Your Strapi API is now accessible from the frontend.

## Current Status

- ✅ **API Permissions**: Configured automatically via bootstrap script
- ✅ **Services Running**: All Docker containers are up and running
- ⚠️ **Content**: You need to add your portfolio content in Strapi

## Next Steps: Add Your Content

1. **Access Strapi Admin Panel**
   - Go to: http://localhost:1337/admin
   - Login with your admin account (create one if you haven't)

2. **Add About Section** (Single Type)
   - Go to: **Content Manager → About**
   - Click **"Create new entry"** (if no entry exists)
   - Fill in:
     - Name (your name)
     - Title (your job title)
     - Bio (your bio/description)
     - Image (upload profile picture)
     - Email, Phone, Location (optional)
     - Social Links (JSON format: `{"github": "url", "linkedin": "url"}`)
   - Click **"Save"** then **"Publish"**

3. **Add Skills** (Collection Type)
   - Go to: **Content Manager → Skills**
   - Click **"Create new entry"**
   - Add each skill:
     - Name (e.g., "React", "Node.js")
     - Level (0-100)
     - Category (frontend, backend, database, tools, other)
     - Icon (optional - upload icon image)
   - Click **"Save"** then **"Publish"**
   - Repeat for all your skills

4. **Add Projects** (Collection Type)
   - Go to: **Content Manager → Projects**
   - Click **"Create new entry"**
   - Fill in:
     - Title
     - Short Description
     - Description (full description)
     - Technologies (JSON array: `["React", "Node.js"]`)
     - Image (main project image)
     - Live URL (optional)
     - GitHub URL (optional)
     - Featured (toggle if you want to highlight)
   - Click **"Save"** then **"Publish"**
   - Repeat for all your projects

5. **Add Experience** (Collection Type)
   - Go to: **Content Manager → Experiences**
   - Click **"Create new entry"**
   - Fill in:
     - Title (job title or degree)
     - Company (company name or school)
     - Location (optional)
     - Start Date
     - End Date (leave empty if current)
     - Current (toggle if this is your current position)
     - Description
     - Type (work or education)
     - Logo (optional - company/school logo)
   - Click **"Save"** then **"Publish"**
   - Repeat for all your experiences

6. **View Your Portfolio**
   - Go to: http://localhost:3000
   - Your content should now appear on the frontend!

## API Endpoints (For Reference)

All endpoints are publicly accessible:
- `/api/about?populate=*` - About section
- `/api/skills?populate=*&sort=level:desc` - Skills list
- `/api/projects?populate=*&sort=createdAt:desc` - Projects list
- `/api/experiences?populate=*&sort=startDate:desc` - Experience list

## Troubleshooting

### If data still doesn't show:

1. **Check if content is published**
   - Make sure all entries have the green "Published" status
   - Unpublished content won't appear on the frontend

2. **Check browser console**
   - Open Developer Tools (F12)
   - Check Console tab for any errors
   - Check Network tab to see API requests

3. **Verify API endpoints**
   ```bash
   curl http://localhost:1337/api/skills?populate=*
   ```
   Should return data if you have published skills

4. **Restart services if needed**
   ```bash
   docker-compose restart
   ```

## Permissions

If you need to manually configure permissions (though they're auto-configured):
- Go to: **Settings → Roles → Public**
- Under "Permissions", enable:
  - **About**: `find`, `findOne`
  - **Skills**: `find`, `findOne`
  - **Projects**: `find`, `findOne`
  - **Experiences**: `find`, `findOne`
- Click **"Save"**

## Need Help?

- Check the main README.md for general setup
- Strapi docs: https://docs.strapi.io
- React docs: https://react.dev

