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
- **AI-Powered Features**:
  - ✨ Inline autocomplete suggestions as you type (like GitHub Copilot)
  - 💡 Idea Box for generating blog post topics
  - ✍️ Writing Assistant for expanding, improving, summarizing, and fixing grammar

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: JSON files in `data/blogs/` directory
- **AI**: Vercel AI SDK with OpenRouter integration
- **Rich Text Editor**: TipTap
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

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create `.env.local` file:
```env
ADMIN_SECRET_KEY=your-secret-admin-key
OPENROUTER_API_KEY=your-openrouter-api-key
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
PEXELS_API_KEY=your-pexels-api-key
```

**Note**: 
- `ADMIN_SECRET_KEY` is required for admin panel access
- `OPENROUTER_API_KEY` is optional but required for AI features (autocomplete, idea generation, writing assistant)
  - Get your API key from [OpenRouter](https://openrouter.ai/)
  - AI features will be disabled if the key is not set
- `GITHUB_TOKEN` is required for creating/updating/deleting blog posts on Vercel
  - Create a Personal Access Token at [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
  - Give it `repo` scope permissions
  - For local development, this is optional (filesystem will be used as fallback)
- `GITHUB_OWNER` and `GITHUB_REPO` are optional (defaults to 'Suv00m' and 'portfolio')

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

**Note**: Blog posts are stored as JSON files in the `data/blogs/` directory. 
- **On Vercel**: Blog posts are created/updated/deleted directly via GitHub API (commits are made automatically)
- **Local development**: Blog posts are saved to the filesystem (you can commit them manually)
- This makes your blog content version-controlled and easy to manage!

## 🗂️ Project Structure

```
/app
  ├── /admin           # Admin dashboard (hidden)
  ├── /api
  │   ├── /blogs       # REST API endpoints
  │   └── /ai          # AI API endpoints (autocomplete, ideas, assist)
  ├── /blog            # Public blog pages
  │   └── /[id]        # Single blog post
  ├── page.tsx         # Home page
  ├── layout.tsx       # Root layout
  └── globals.css      # Global styles

/components
  ├── CenterNavbar.tsx # Custom navigation
  ├── RichTextEditor.tsx  # Rich text editor with AI autocomplete
  ├── IdeaBox.tsx      # AI idea generation and writing assistant
  └── /ui
      └── /link-preview.tsx  # Link preview component

/lib
  ├── blogs.ts         # Blog operations (GitHub API or filesystem)
  ├── github-api.ts    # GitHub API integration for Vercel
  ├── types.ts         # TypeScript interfaces
  ├── utils.ts         # Utility functions
  └── ai-config.ts     # AI/OpenRouter configuration

/components
  ├── RichTextEditor.tsx  # Rich text editor with AI autocomplete
  └── IdeaBox.tsx         # AI idea generation and writing assistant

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
3. Add environment variables:
   - `ADMIN_SECRET_KEY` (required for admin access)
   - `OPENROUTER_API_KEY` (optional, for AI features)
4. Deploy

### Other Platforms

Set the following environment variables:
- `ADMIN_SECRET_KEY` - Required for admin panel access
- `OPENROUTER_API_KEY` - Optional, enables AI features (autocomplete, idea generation, writing assistant)

No database setup required!

## 🤖 AI Features

### Inline Autocomplete
- AI-powered text suggestions appear as you type in the rich text editor
- Toggle on/off with the ✨ button in the toolbar
- Press **Tab** to accept a suggestion, **Esc** to dismiss
- Suggestions are debounced (500ms) to avoid excessive API calls

### Idea Box
Located in the admin panel when creating a new blog post:

**Ideas Tab:**
- Click "Generate Blog Post Ideas" to get AI-generated topic suggestions
- Click any idea to use it as your blog post title
- Ideas are unique and diverse

**Writing Assistant Tab:**
- Paste your content and choose an action:
  - **Expand**: Make content more detailed and comprehensive
  - **Improve**: Enhance clarity, flow, and readability
  - **Summarize**: Create a concise summary
  - **Fix Grammar**: Correct grammatical errors and improve clarity
- Click "Insert into Editor" to add the processed content

**Note**: AI features require `OPENROUTER_API_KEY` to be set in your environment variables.

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