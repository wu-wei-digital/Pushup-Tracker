import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/login", "/register"],
                disallow: [
                    "/dashboard",
                    "/dashboard/*",
                    "/api/*",
                    "/leaderboard",
                    "/profile",
                    "/profile/*",
                    "/challenges",
                    "/challenges/*",
                    "/teams",
                    "/teams/*",
                    "/friends",
                    "/friends/*",
                    "/achievements",
                    "/settings",
                    "/settings/*",
                ],
            },
        ],
        sitemap: "https://pushups.wuwei.digital/sitemap.xml",
    };
}
