### Projects API ###

# Get all projects
GET http://localhost:3000/api/projects
Content-Type: application/json

### Get project by slug
GET http://localhost:3000/api/projects?slug=project-1
Content-Type: application/json

### Create new project
POST http://localhost:3000/api/projects
Content-Type: application/json

{
  "title": "Test Project",
  "description": "This is a test project description",
  "liveUrl": "https://example.com",
  "githubUrl": "https://github.com/user/project",
  "image": "https://example.com/image.jpg",
  "technologies": ["React", "Node.js", "TypeScript"],
  "featured": true
}

### Update project
PUT http://localhost:3000/api/projects/[project-id]
Content-Type: application/json

{
  "title": "Updated Project",
  "description": "Updated project description",
  "liveUrl": "https://example.com/updated",
  "githubUrl": "https://github.com/user/updated-project",
  "image": "https://example.com/updated-image.jpg",
  "technologies": ["React", "Node.js", "MongoDB"],
  "featured": false
}

### Delete project
DELETE http://localhost:3000/api/projects/[project-id]
Content-Type: application/json

### Blogs API ###

# Get all blogs
GET http://localhost:3000/api/blogs
Content-Type: application/json

### Get blog by slug
GET http://localhost:3000/api/blogs?slug=blog-1
Content-Type: application/json

### Create new blog
POST http://localhost:3000/api/blogs
Content-Type: application/json

{
  "title": "Test Blog Post",
  "content": "This is a test blog post content that should be at least 100 characters long to meet the minimum requirement for the blog content validation.",
  "excerpt": "This is a short excerpt of the blog post",
  "featuredImage": "https://example.com/image.jpg",
  "seo": {
    "metaTitle": "Test Blog Post",
    "metaDescription": "This is a test blog post meta description",
    "canonicalUrl": "https://example.com/blog/test-post",
    "openGraph": {
      "title": "Test Blog Post OG",
      "description": "This is a test blog post OG description",
      "images": [
        {
          "url": "https://example.com/og-image.jpg"
        }
      ]
    }
  },
  "isPublished": true
}

### Update blog
PUT http://localhost:3000/api/blogs/[blog-id]
Content-Type: application/json

{
  "title": "Updated Blog Post",
  "content": "This is an updated blog post content that should be at least 100 characters long to meet the minimum requirement for the blog content validation.",
  "isPublished": true
}

### Delete blog
DELETE http://localhost:3000/api/blogs/[blog-id]
Content-Type: application/json

### Contact API ###

# Get all messages
GET http://localhost:3000/api/contact
Content-Type: application/json

### Send contact message
POST http://localhost:3000/api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Test Contact Message",
  "message": "This is a test contact form message to check the functionality."
}

### Personal Details API ###

# Get personal details
GET http://localhost:3000/api/me
Content-Type: application/json

### Update personal details
POST http://localhost:3000/api/me
Content-Type: application/json

{
  "name": "John Doe",
  "title": "Full Stack Developer",
  "bio": "Experienced full stack developer with expertise in React and Node.js",
  "email": "john@example.com",
  "location": "New York, USA",
  "avatar": "https://example.com/avatar.jpg",
  "social": {
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe"
  }
}

### AI APIs ###

# Generate AI blog
GET http://localhost:3000/api/ai/blog
Content-Type: application/json

### Improve project content
POST http://localhost:3000/api/ai/project
Content-Type: application/json

{
  "title": "My Project",
  "description": "A brief description of my project that needs improvement",
  "content": "Detailed content about the project that will be improved by the AI",
  "keywords": ["react", "nextjs", "typescript"]
}
