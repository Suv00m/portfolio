# Portfolio & Blog Platform

A modern, production-ready portfolio website with an integrated blog system built with Next.js 14, TypeScript, Tailwind CSS, and file-based storage.

## ✨ Features

### Portfolio
- Clean, minimalist design
- Responsive layout
- Custom navigation component
- Link preview on hover for external URLs

### Blog System
- 📝 Full CRUD operations with file-based storage
- 🔒 Secure admin panel with key-based authentication
- 🔗 Embedded link previews in blog posts
- 📱 Responsive design matching portfolio style
- 📁 Blog posts stored as JSON files in GitHub
- ⚡ Server-side rendering with Next.js App Router
- 🔄 Version-controlled blog content

### Admin Features
- Hidden admin panel at `/admin`
- Create, read, and delete blog posts
- Add multiple links to blog posts with preview support
- Real-time updates
- Secure authentication with key-based access

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: JSON files in `data/blogs/` directory
- **UI Components**: Custom components + Radix UI
- **Animations**: Framer Motion

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd profile
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional, for admin access):
Create `.env.local` file:
```env
ADMIN_SECRET_KEY=your-secret-admin-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

**Note**: Blog posts are stored as JSON files in the `data/blogs/` directory. When you create posts through the admin panel, they're saved as files that you can commit to GitHub. This makes your blog content version-controlled and easy to manage!

## 🗂️ Project Structure

```
/app
  ├── /admin           # Admin dashboard (hidden)
  ├── /api
  │   └── /blogs       # REST API endpoints
  ├── /blog            # Public blog pages
  │   └── /[id]        # Single blog post
  ├── page.tsx         # Home page
  ├── layout.tsx       # Root layout
  └── globals.css      # Global styles

/components
  ├── CenterNavbar.tsx # Custom navigation
  └── /ui
      └── /link-preview.tsx  # Link preview component

/lib
  ├── blogs.ts         # Blog file operations
  ├── types.ts         # TypeScript interfaces
  └── utils.ts         # Utility functions

/data
  └── /blogs           # Blog post JSON files
```

## 🔐 Security

- ✅ Admin operations require key-based authentication
- ✅ Input validation on all operations
- ✅ Admin panel hidden from public navigation
- ✅ Blog posts stored as files (version-controlled in Git)

## 💾 Data Storage

All blog posts are stored as JSON files in the `data/blogs/` directory:
- Each blog post is a separate JSON file named `{id}.json`
- Files are version-controlled with Git
- Easy to edit manually or through the admin panel
- Changes can be committed to GitHub
- No database setup required

## 🎨 Customization

1. **Colors**: Edit Tailwind config or use CSS variables in `globals.css`
2. **Navigation**: Update `components/CenterNavbar.tsx`
3. **Home Page**: Modify `app/page.tsx`
4. **Blog Styling**: Adjust components in `/app/blog`

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add `ADMIN_SECRET_KEY` environment variable (optional, for admin access)
4. Deploy

### Other Platforms

Set the `ADMIN_SECRET_KEY` environment variable if you want to use the admin panel. No database setup required!

## 📝 Managing Blog Posts

### Via Admin Panel
1. Navigate to `/admin`
2. Enter your admin key
3. Create, edit, or delete blog posts
4. Changes are saved as JSON files in `data/blogs/`
5. Commit and push to GitHub

### Manually
You can also create blog posts manually by adding JSON files to `data/blogs/`:

```json
{
  "id": "unique-uuid",
  "title": "My Blog Post",
  "description": "Blog content here...",
  "links": [
    {
      "text": "Example Link",
      "url": "https://example.com"
    }
  ],
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

This is a personal portfolio project, but feel free to fork and customize for your own use!

## 📄 License

MIT License - feel free to use this for your own portfolio.

---

**Built with ❤️ using Next.js and file-based storage**