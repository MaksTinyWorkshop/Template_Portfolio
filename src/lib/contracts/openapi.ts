import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROUTES_ROOT = path.resolve(process.cwd(), "src/app/(api)/api");
const SUPPORTED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"] as const;

type HttpMethod = (typeof SUPPORTED_METHODS)[number];

interface RouteEntry {
  routePath: string;
  methods: HttpMethod[];
}

const normalizeOpenApiPath = (routePath: string) =>
  routePath
    .replace(/\[\.\.\.(.+?)\]/g, "{$1}")
    .replace(/\[\[(.+?)\]\]/g, "{$1}")
    .replace(/\[(.+?)\]/g, "{$1}");

const getTagForPath = (apiPath: string) => {
  const segments = apiPath.split("/").filter(Boolean); // ["api", ...]
  const scope = segments[1];
  const resource = segments[2];

  if (scope === "authenticate" || scope === "check-auth" || scope === "refresh-token") {
    return "auth";
  }

  if (scope === "admin") {
    return resource ? `admin/${resource}` : "admin";
  }

  if (scope) {
    return `public/${scope}`;
  }

  return "public";
};

const methodPattern = (method: HttpMethod) =>
  new RegExp(`export\\s+(?:async\\s+function\\s+${method}|const\\s+${method}\\s*=)`, "m");

const toOperation = (apiPath: string, method: HttpMethod) => {
  const isAdminRoute = apiPath.startsWith("/api/admin/");
  const isAdminAvailabilityWrite = apiPath === "/api/availability" && method === "POST";
  const requiresAuth = isAdminRoute || isAdminAvailabilityWrite;
  const tag = getTagForPath(apiPath);

  const supportsRateLimit =
    (apiPath === "/api/authenticate" && method === "POST") ||
    (apiPath === "/api/contact" && method === "POST");

  return {
    summary: `${method} ${apiPath}`,
    tags: [tag],
    operationId: `${method.toLowerCase()}_${apiPath.replaceAll("/", "_").replace(/[{}]/g, "")}`,
    responses: {
      200: {
        description: "OK",
      },
      400: {
        description: "Bad Request",
      },
      401: {
        description: "Unauthorized",
      },
      ...(supportsRateLimit
        ? {
            429: {
              description: "Too Many Requests",
            },
          }
        : {}),
      500: {
        description: "Internal Server Error",
      },
    },
    ...(requiresAuth ? { security: [{ cookieAuth: [] }] } : {}),
  };
};

const readRouteMethods = async (filePath: string) => {
  const source = await readFile(filePath, "utf8");
  return SUPPORTED_METHODS.filter((method) => methodPattern(method).test(source));
};

const collectRouteFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectRouteFiles(absolute);
      }
      if (entry.isFile() && entry.name === "route.ts") {
        return [absolute];
      }
      return [];
    }),
  );
  return files.flat();
};

const toRouteEntry = async (filePath: string): Promise<RouteEntry | null> => {
  const methods = await readRouteMethods(filePath);
  if (methods.length === 0) {
    return null;
  }

  const relativePath = path.relative(ROUTES_ROOT, filePath);
  const routePath = `/${relativePath.replace(/\\/g, "/").replace(/\/route\.ts$/, "")}`;
  return { routePath, methods };
};

export const buildOpenApiDocument = async () => {
  const routeFiles = await collectRouteFiles(ROUTES_ROOT);
  const routes = (await Promise.all(routeFiles.map((filePath) => toRouteEntry(filePath)))).filter(
    (entry): entry is RouteEntry => Boolean(entry),
  );

  routes.sort((a, b) => a.routePath.localeCompare(b.routePath, "fr"));

  const paths = routes.reduce<Record<string, Record<string, unknown>>>((acc, route) => {
    const apiPath = `/api${normalizeOpenApiPath(route.routePath)}`;
    const operations = route.methods.reduce<Record<string, unknown>>((ops, method) => {
      ops[method.toLowerCase()] = toOperation(apiPath, method);
      return ops;
    }, {});
    acc[apiPath] = operations;
    return acc;
  }, {});

  return {
    openapi: "3.1.0",
    info: {
      title: "Portfolio API",
      version: "1.0.0",
      description: "Spécifications générées automatiquement",
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "authToken",
        },
      },
    },
    paths,
  };
};
