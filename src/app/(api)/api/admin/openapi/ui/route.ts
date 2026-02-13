import { checkAuthAPI } from "@/lib/utils/auth";

const SWAGGER_UI_VERSION = "5.17.14";

const getSwaggerHtml = () => `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css" />
    <style>
      html, body, #swagger-ui { height: 100%; margin: 0; }
      body { background: #fafafa; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-standalone-preset.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/admin/openapi',
        dom_id: '#swagger-ui',
        deepLinking: true,
        displayRequestDuration: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'BaseLayout',
      });
    </script>
  </body>
</html>`;

export async function GET() {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    return new Response("Non authentifié", {
      status: 401,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  return new Response(getSwaggerHtml(), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
