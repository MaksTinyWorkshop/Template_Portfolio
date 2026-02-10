import type {
  About,
  Blog,
  Gallery,
  Home,
  Newsletter,
  Person,
  Social,
  Work,
} from "@/web/types";
import { Line, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "YourFirstName",
  lastName: "YourLastName",
  name: "YourName",
  role: "Full Stack Developer",
  avatar: "/images/avatars/avatar_max.jpg",
  email: "contact@your-domain.com",
  location: "America/New_York", // Replace with your timezone (e.g., Europe/Paris, America/Los_Angeles)
  languages: ["English", "Français"],
};

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>Weekly insights about web development and technology</>,
};

type SocialWithContacts = Social & {
  contacts: {
    linkedin?: string;
  };
};

const linkedInLink = "https://www.linkedin.com/in/YOUR_LINKEDIN";

const socialLinks: Social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/YOUR_GITHUB",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: linkedInLink,
    essential: true,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
];

const social: SocialWithContacts = Object.assign(socialLinks, {
  contacts: {
    linkedin: linkedInLink,
  },
});

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `Portfolio of ${person.name}`,
  description:
    "Full stack developer specializing in modern web applications and scalable solutions.",
  headline: <>Building digital products that matter</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <Text marginRight="4" onBackground="brand-medium">
          Featured Project
        </Text>
        <Line background="brand-alpha-strong" vert height="20" />
        <strong className="ml-4">Web Application</strong>{" "}
      </Row>
    ),
    href: "/work/your-project-slug",
  },
  subline: (
    <>
      I craft thoughtful web experiences that solve real problems.
      <br />
      <br />
      With a focus on clean code, user experience, and maintainability, I help
      businesses and individuals bring their ideas to life through modern web
      technologies.
      <br />
      <br />
      From concept to deployment, I build solutions that are both elegant and
      practical.
    </>
  ),
  keywords: [
    "full stack developer",
    "web development",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "modern web applications",
    "freelance developer",
  ],
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://calendly.com/YOUR_CALENDAR",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I'm a full stack developer passionate about creating web applications
        that combine beautiful design with robust functionality.
        <br />
        <br />
        My approach is simple: understand the problem deeply, design
        thoughtfully, and build with precision. I believe great software is
        invisible—it just works.
        <br />
        <br />
        I specialize in modern JavaScript frameworks, scalable architectures,
        and creating solutions that teams can maintain and evolve over time.
      </>
    ),
  },
  work: {
    display: true,
    title: "Experience",
    experiences: [
      {
        company: "Freelance Development",
        timeframe: "Present",
        role: "Full Stack Developer",
        achievements: [
          <>
            <strong>Web Applications:</strong> Building custom solutions for
            clients using modern frameworks and best practices.
          </>,
          <>
            <strong>Technical Consulting:</strong> Helping teams improve their
            development processes and code quality.
          </>,
        ],
        images: [],
      },
      {
        company: "My Approach",
        timeframe: "Core Values",
        role: "Quality & Impact",
        achievements: [
          <>
            <strong>User-Focused:</strong> Every technical decision starts with
            the end user. I build interfaces that feel natural and workflows
            that save time.
          </>,
          <>
            <strong>Built to Last:</strong> Clean architecture, thoughtful
            dependencies, and comprehensive documentation ensure your project
            stays maintainable for years.
          </>,
          <>
            <strong>Transparent Process:</strong> Regular updates, clear
            communication, and knowledge transfer so your team stays in control.
          </>,
          <>
            <strong>Quality First:</strong> Automated testing, version control
            best practices, and performance optimization are standard, not
            extras.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true,
    title: "Background",
    institutions: [
      {
        name: "Software Development",
        description: (
          <>
            Self-taught developer with years of experience building production
            applications. Continuously learning and adapting to new
            technologies.
          </>
        ),
      },
      {
        name: "Specialization",
        description: (
          <>
            Expert in full stack JavaScript/TypeScript development, with
            experience in React, Next.js, Node.js, and modern deployment
            practices.
          </>
        ),
      },
    ],
  },
  technical: {
    display: true,
    title: "Technical Skills",
    skills: [
      {
        title: "Frontend Development",
        description: (
          <>
            Building responsive, accessible, and performant user interfaces with
            modern frameworks. From landing pages to complex web applications, I
            create experiences users love.
          </>
        ),
        tags: [
          {
            name: "React",
            icon: "react",
          },
          {
            name: "Next.js",
            icon: "nextjs",
          },
          {
            name: "TypeScript",
            icon: "typescript",
          },
          {
            name: "Tailwind CSS",
            icon: "tailwind",
          },
        ],
        images: [],
      },
      {
        title: "Backend Development",
        description: (
          <>
            Creating robust APIs and server-side applications. I build scalable
            backends that handle real-world traffic and evolve with your
            business needs.
          </>
        ),
        tags: [
          {
            name: "Node.js",
            icon: "nodejs",
          },
          {
            name: "Express",
            icon: "express",
          },
          {
            name: "PostgreSQL",
            icon: "postgresql",
          },
          {
            name: "Prisma",
            icon: "prisma",
          },
        ],
        images: [],
      },
      {
        title: "DevOps & Tools",
        description: (
          <>
            Streamlining development workflows and deployment processes. From
            local development to production, I ensure smooth and reliable
            delivery.
          </>
        ),
        tags: [
          {
            name: "Docker",
            icon: "docker",
          },
          {
            name: "Git",
            icon: "git",
          },
          {
            name: "GitHub Actions",
            icon: "githubactions",
          },
          {
            name: "Vercel",
            icon: "vercel",
          },
        ],
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Blog & Articles",
  description: `Technical articles and insights about web development by ${person.name}`,
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: "Projects & Portfolio",
  description: `Explore the portfolio and projects by ${person.name}, full stack developer`,
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  images: [],
};

export { about, blog, gallery, home, newsletter, person, social, work };
