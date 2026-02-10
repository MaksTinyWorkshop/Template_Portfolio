import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "YOUR_FIRST_NAME",
  lastName: "YOUR_LAST_NAME",
  name: "YOUR_NAME",
  role: "Full Stack Developer",
  avatar: "/images/avatars/avatar.jpg",
  email: "your.email@example.com",
  location: "Europe/Paris",
  languages: ["Français", "English"],
};

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>My weekly newsletter about creativity and engineering</>,
};

const social: Social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/yourusername",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/yourprofile/",
    essential: true,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description:
    "Full stack freelance developer, crafting web applications and tools built to last — from efficient showcase sites to custom business solutions.",
  headline: <>Meaningful development, built to last</>,
  featured: {
    display: false,
    title: (
      <Row gap="12" vertical="center">
        <Text marginRight="4" onBackground="brand-medium">
          Current Project
        </Text>
        <Line background="brand-alpha-strong" vert height="20" />
        <strong className="ml-4">WebApp</strong>{" "}
      </Row>
    ),
    href: "/work/your-project",
  },
  subline: (
    <>
      Every line of code I write carries intent: solving real problems with tools that endure.
      <br />
      <br />
      I bring experience from diverse backgrounds to build web applications with reliability at their
      core.
      <br />
      <br />
      From initial conversation to production deployment, I guide you with one conviction: the best
      technology is the one you forget about because it just works.
    </>
  ),
  keywords: [
    "full stack developer",
    "freelance developer",
    "custom business solutions",
    "Java Spring",
    "Next.js",
    "Astro",
    "web development",
    "custom web application",
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
    display: false,
    link: "https://calendly.com/your-calendar",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I've learned that great software isn't about the technology—it's about the people who use it.
        <br />
        <br />
        That's why I prioritize simple, well-documented solutions designed to outlast my own
        involvement.
      </>
    ),
  },
  work: {
    display: true,
    title: "My Approach",
    experiences: [
      {
        company: "From showcase to internal product",
        timeframe: "Multiple ways to deliver value",
        role: "The right tool at the right time",
        achievements: [
          <>
            <strong>Showcase site:</strong> fast and polished design, with special attention to
            performance, accessibility, SEO, and scalability.
          </>,
          <>
            <strong>Business solution:</strong> development of tools adapted to specific processes,
            prioritizing clarity, maintainability, and team adoption.
          </>,
        ],
        images: [],
      },
      {
        company: "Values & Commitment",
        timeframe: "What guides me",
        role: "Impact and sustainability",
        achievements: [
          <>
            <strong>Utility:</strong> I don't code to impress peers, but so your users accomplish their
            work faster, simpler, with less friction. Every feature must earn its place.
          </>,
          <>
            <strong>Built to last:</strong> frameworks come and go, good foundations remain. I write
            code you'll be able to revisit in 5 years without frowning: sober architectures, carefully
            chosen dependencies, controlled technical debt.
          </>,
          <>
            <strong>Transparency:</strong> you'll always know where we stand. Code documented like a
            letter to your future developer, regular progress updates, training your teams for autonomy.
            No black boxes, no forced dependency.
          </>,
          <>
            <strong>Commitment:</strong> automated tests before each delivery, version control that
            tells the project's story, responsive availability when you need it. I don't disappear after
            production, I stay available until you can fly on your own.
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
        name: "Full Stack Developer",
        description: (
          <>
            Specialized in custom design, from modern front-end (Astro, Next.js,...) to robust back-end
            systems (Java/Spring, TypeScript/Nest), with a preference for monorepo architectures.
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
        title: "Modern Front-end",
        description: (
          <>
            From lightning-fast showcase sites to rich interfaces that captivate users: I choose the
            tool based on the story you want to tell. Astro when speed matters, Next.js when complexity
            demands structure, Vue.js when interactivity must dance at your fingertips.
          </>
        ),
        tags: [
          {
            name: "Astro",
            icon: "astro",
          },
          {
            name: "Next.js",
            icon: "nextjs",
          },
          {
            name: "Vue",
            icon: "vue",
          },
          {
            name: "TypeScript",
            icon: "typescript",
          },
        ],
        images: [],
      },
      {
        title: "Robust Back-end",
        description: (
          <>
            Behind every elegant interface lies solid machinery. Java/Spring for projects that must
            endure, NestJS for teams that think in TypeScript. My expertise: building invisible but
            unshakeable foundations, clearly communicating APIs, and architectures that grow without
            breaking.
          </>
        ),
        tags: [
          {
            name: "Java",
            icon: "java",
          },
          {
            name: "Spring",
            icon: "spring",
          },
          {
            name: "NestJS",
            icon: "nest",
          },
        ],
        images: [],
      },
      {
        title: "Databases",
        description: (
          <>
            Your data tells your company's story. I structure it to remain consistent, accessible, and
            protected—whether it's 1,000 or 1 million entries. From the first table to the last index,
            every modeling decision is designed for today's performance and tomorrow's evolution.
          </>
        ),
        tags: [
          {
            name: "PostgreSQL",
            icon: "postgresql",
          },
          {
            name: "MySQL",
            icon: "mysql",
          },
          {
            name: "Prisma",
            icon: "prisma",
          },
        ],
        images: [],
      },
      {
        title: "DevOps & Infrastructure",
        description: (
          <>
            The most brilliant code is worthless if it remains trapped. I transform your work into
            living systems: pipelines that deploy with confidence, containers that adapt to load,
            monitoring that alerts you before problems occur. From your machine to production, I build
            smooth highways.
          </>
        ),
        tags: [
          {
            name: "Docker",
            icon: "docker",
          },
          {
            name: "GitHub Actions",
            icon: "githubactions",
          },
          {
            name: "GitLab CI",
            icon: "gitlab",
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
  title: "Tech & Development Blog",
  description: `Technical articles and experience feedback on full stack development, Java/Spring, Next.js and eco-design by ${person.name}`,
};

const work: Work = {
  path: "/work",
  label: "Projects",
  title: "Projects & Achievements",
  description: `Web project portfolio: custom business solutions, full stack applications and performant sites developed by ${person.name}, freelance developer`,
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  images: [],
};

export { about, blog, gallery, home, newsletter, person, social, work };
