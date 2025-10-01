# Portfolio & Blog Platform

A modern, production-ready portfolio website with an integrated blog system built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

### Portfolio
- Clean, minimalist design
- Responsive layout
- Custom navigation component
- Link preview on hover for external URLs

### Blog System
- 📝 Full CRUD operations via REST API
- 🔒 Secure admin panel with key-based authentication
- 🔗 Embedded link previews in blog posts
- 📱 Responsive design matching portfolio style
- 🗄️ Supabase backend with PostgreSQL
- 🛡️ Row-level security (RLS) enabled
- ⚡ Server-side rendering with Next.js App Router

### Admin Features
- Hidden admin panel at `/admin`
- Create, read, and delete blog posts
- Add multiple links to blog posts with preview support
- Real-time updates
- Secure authentication with environment-based keys

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
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

3. Set up Supabase (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

4. Create `.env.local` file with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SECRET_KEY=your-secret-admin-key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

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
  ├── supabase.ts      # Supabase client
  ├── types.ts         # TypeScript interfaces
  └── utils.ts         # Utility functions
```

## 🔐 Security

- ✅ Row-level security (RLS) on database
- ✅ Admin operations require secret key authentication
- ✅ Service role key stored server-side only
- ✅ Input validation on all API endpoints
- ✅ Admin panel hidden from public navigation

## 📝 API Routes

### Public Endpoints

- `GET /api/blogs` - Fetch all blog posts
- `GET /api/blogs/[id]` - Fetch single blog post

### Admin Endpoints (require `x-admin-key` header)

- `POST /api/blogs` - Create new blog post
- `PUT /api/blogs/[id]` - Update blog post
- `DELETE /api/blogs/[id]` - Delete blog post

## 🎨 Customization

1. **Colors**: Edit Tailwind config or use CSS variables in `globals.css`
2. **Navigation**: Update `components/CenterNavbar.tsx`
3. **Home Page**: Modify `app/page.tsx`
4. **Blog Styling**: Adjust components in `/app/blog`

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure you set all environment variables from `.env.local` in your hosting platform's dashboard.

## 📚 Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md) - Complete database setup instructions
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Contributing

This is a personal portfolio project, but feel free to fork and customize for your own use!

## 📄 License

MIT License - feel free to use this for your own portfolio.

---

**Built with ❤️ using Next.js and Supabase**