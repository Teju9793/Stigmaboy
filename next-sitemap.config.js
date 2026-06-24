/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://stigmaboy.com",
  generateRobotsTxt: false, // We manage robots.txt manually
  exclude: [
    "/admin",
    "/admin/*",
    "/dashboard",
    "/dashboard/*",
    "/api/*",
    "/login",
    "/register",
    "/forgot-password",
  ],
  additionalPaths: async (config) => {
    // Static routes to include explicitly
    return [
      { loc: "/", changefreq: "daily", priority: 1.0 },
      { loc: "/courses", changefreq: "daily", priority: 0.9 },
      { loc: "/templates", changefreq: "daily", priority: 0.9 },
      { loc: "/resources", changefreq: "weekly", priority: 0.8 },
      { loc: "/portfolio", changefreq: "weekly", priority: 0.7 },
      { loc: "/blog", changefreq: "weekly", priority: 0.8 },
      { loc: "/contact", changefreq: "monthly", priority: 0.6 },
    ];
  },
};
