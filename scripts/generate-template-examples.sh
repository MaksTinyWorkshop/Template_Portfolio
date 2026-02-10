#!/bin/bash
# Generate template examples for public template repository
# This script is called by the sync workflow to create example files

set -e

STAGING_DIR="${1:-/tmp/staging}"

echo "Generating template examples in $STAGING_DIR..."

# Create data-examples structure
mkdir -p "$STAGING_DIR/data-examples/posts"
mkdir -p "$STAGING_DIR/data-examples/projects"

# Generate example blog post
cat > "$STAGING_DIR/data-examples/posts/example-post.mdx" <<'EXAMPLE_POST_EOF'
---
title: "Your First Blog Post Title"
summary: "A brief summary of your blog post that will appear in the blog list and meta tags. Keep it concise and engaging."
publishedAt: "2024-01-15"
status: "published"
image: "/images/articles/your-post-image.jpg"
tag: "Tech"
---

## Introduction

Start your blog post here with an engaging introduction that hooks your readers.

## Main Content

Add your main content here. You can use:

- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- `Code blocks` for technical content
- [Links](https://example.com) to external resources

### Subheading

Break your content into logical sections using headings.

```javascript
// You can include code examples
const example = "like this";
console.log(example);
```

## Conclusion

Wrap up your thoughts and provide value to your readers.

---

**Note:** This is an example blog post. Copy this file to `data/posts/` and customize it with your own content.
EXAMPLE_POST_EOF

# Generate example project
cat > "$STAGING_DIR/data-examples/projects/example-project.mdx" <<'EXAMPLE_PROJECT_EOF'
---
title: "Your Project Name"
publishedAt: "2024-01"
status: "published"
summary: "A compelling one-line description of your project. What problem does it solve? What makes it special?"
typeProjectTag:
  - "Web"
  - "Mobile"
  - "SaaS"
images:
  - "/images/projects/your-project/cover-1.jpg"
  - "/images/projects/your-project/cover-2.jpg"
team:
  - name: "Your Name"
    role: "Full Stack Developer"
    avatar: "/images/avatars/your-avatar.jpg"
    linkedIn: "https://www.linkedin.com/in/yourprofile/"
---

## Project Overview

Describe your project in detail. What was the challenge? What solution did you build?

## Key Features

- **Feature 1**: Description of the first key feature
- **Feature 2**: Description of the second key feature
- **Feature 3**: Description of the third key feature

## Technologies Used

- **Frontend**: React, Next.js, TypeScript
- **Backend**: Node.js, PostgreSQL
- **DevOps**: Docker, GitHub Actions

## Challenges & Solutions

Describe interesting technical challenges you faced and how you solved them.

## Results

What impact did this project have? Include metrics if possible:
- X% performance improvement
- Y users onboarded
- Z features delivered

---

**Note:** This is an example project file. Copy this to `data/projects/` and customize with your own project details.
EXAMPLE_PROJECT_EOF

# Generate data-examples README
cat > "$STAGING_DIR/data-examples/README.md" <<'DATA_README_EOF'
# Data Examples

This folder contains **template examples** for blog posts and projects.

## Usage

### Blog Posts

1. Copy `posts/example-post.mdx` to `data/posts/your-post-name.mdx`
2. Customize the frontmatter (title, summary, date, etc.)
3. Write your content
4. Add an image to `public/images/articles/`

### Projects

1. Copy `projects/example-project.mdx` to `data/projects/your-project-name.mdx`
2. Customize the frontmatter (title, summary, team, etc.)
3. Describe your project
4. Add images to `public/images/projects/your-project-name/`

## File Structure

```
data/
├── posts/
│   └── your-post.mdx
└── projects/
    └── your-project.mdx

public/images/
├── articles/
│   └── your-post-image.jpg
├── projects/
│   └── your-project/
│       ├── cover-1.jpg
│       └── cover-2.jpg
└── avatars/
    └── your-avatar.jpg
```

## Tips

- Keep summaries under 160 characters for SEO
- Use descriptive file names (kebab-case)
- Optimize images (WebP or AVIF format recommended)
- Use `status: "draft"` for unpublished content
- Add meaningful tags for better organization
DATA_README_EOF

# Create public/images-examples structure
mkdir -p "$STAGING_DIR/public/images-examples/articles"
mkdir -p "$STAGING_DIR/public/images-examples/projects"
mkdir -p "$STAGING_DIR/public/images-examples/avatars"

# Generate images-examples README
cat > "$STAGING_DIR/public/images-examples/README.md" <<'IMAGES_README_EOF'
# Images Examples

This folder contains **placeholder images** for development and examples.

## Structure

```
public/images/
├── articles/
│   └── your-article-image.jpg (1200x630px recommended)
├── projects/
│   └── your-project/
│       ├── cover-1.jpg (1200x800px recommended)
│       ├── cover-2.jpg
│       └── featured.jpg
└── avatars/
    └── your-avatar.jpg (400x400px recommended)
```

## Image Guidelines

### Blog Articles
- **Dimensions**: 1200x630px (OG image standard)
- **Format**: JPEG, WebP, or AVIF
- **File size**: < 200KB
- **Naming**: Use descriptive kebab-case names

### Projects
- **Cover images**: 1200x800px (landscape)
- **Featured image**: 1200x630px (for social sharing)
- **Format**: JPEG, WebP, or AVIF
- **File size**: < 300KB per image

### Avatars
- **Dimensions**: 400x400px (square)
- **Format**: JPEG, WebP, or AVIF
- **File size**: < 100KB

## Adding Your Images

1. Create appropriate subdirectories in `public/images/`
2. Add optimized images
3. Reference them in your MDX files:
   ```mdx
   image: "/images/articles/my-post.jpg"
   ```

## Optimization Tips

- Use modern formats (WebP, AVIF) for better compression
- Optimize with tools like:
  - [TinyPNG](https://tinypng.com/)
  - [Squoosh](https://squoosh.app/)
  - [Sharp](https://sharp.pixelplumbing.com/) (CLI)

## Placeholder Service

During development, you can use placeholder services:
- [Unsplash Source](https://source.unsplash.com/)
- [Lorem Picsum](https://picsum.photos/)

Example:
```mdx
image: "https://source.unsplash.com/1200x630/?technology"
```
IMAGES_README_EOF

echo "✓ Template examples generated successfully"
