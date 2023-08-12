/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: "/api/sse/connect",
        headers: [
          {
            key: "Content-Type",
            value: "text/event-stream",
          },
          {
            key: "Connection",
            value: "keep-alive",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-transform",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
