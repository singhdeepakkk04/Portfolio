// One-off migration: content/*.mdx (git-based storage) -> Supabase `posts` table + `Blogs` storage bucket.
// Run once with: node scripts/migrate-blog-to-supabase.js

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { createClient } = require("@supabase/supabase-js");

const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const BUCKET = "Blogs";

function loadEnvLocal() {
    const envPath = path.join(ROOT, ".env.local");
    const text = fs.readFileSync(envPath, "utf-8");
    for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = value;
    }
}

function contentTypeFor(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    return (
        {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".svg": "image/svg+xml",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".html": "text/html",
        }[ext] || "application/octet-stream"
    );
}

async function main() {
    loadEnvLocal();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const files = fs
        .readdirSync(CONTENT_DIR)
        .filter((f) => f.endsWith(".mdx") && !f.startsWith("."));

    console.log(`Found ${files.length} post(s) to migrate:`, files);

    const uploadedPaths = new Map(); // "/blog/images/uploads/x.png" -> public URL

    for (const file of files) {
        const slug = file.replace(/\.mdx$/, "");
        const filePath = path.join(CONTENT_DIR, file);
        let raw = fs.readFileSync(filePath, "utf-8");

        // Find every referenced local asset path, e.g. /blog/images/uploads/thumbnail.jpg
        const refs = new Set((raw.match(/\/blog\/images\/[^\s'")]+/g) || []));

        for (const ref of refs) {
            if (uploadedPaths.has(ref)) continue;

            const relative = ref.replace(/^\/blog\/images\//, "");
            const localAssetPath = path.join(CONTENT_DIR, "images", relative);

            if (!fs.existsSync(localAssetPath)) {
                console.warn(`  ! Referenced asset not found on disk, skipping: ${ref}`);
                continue;
            }

            const buffer = fs.readFileSync(localAssetPath);
            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(relative, buffer, {
                    contentType: contentTypeFor(relative),
                    upsert: true,
                });

            if (uploadError) {
                console.error(`  ! Failed to upload ${ref}:`, uploadError.message);
                continue;
            }

            const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(relative);
            uploadedPaths.set(ref, pub.publicUrl);
            console.log(`  Uploaded ${ref} -> ${pub.publicUrl}`);
        }

        // Rewrite every reference (frontmatter + body) to the new public URL
        for (const [ref, publicUrl] of uploadedPaths) {
            raw = raw.split(ref).join(publicUrl);
        }

        const { data: frontmatter, content } = matter(raw);

        const row = {
            slug,
            title: frontmatter.title || "Untitled",
            published_at: frontmatter.publishedAt || new Date().toISOString(),
            updated_at: frontmatter.updatedAt || null,
            summary: frontmatter.summary || "",
            image: frontmatter.image || null,
            tags: frontmatter.tags || [],
            category: frontmatter.category || "Engineering",
            featured: frontmatter.featured || false,
            status: frontmatter.status || "draft",
            content,
        };

        const { error: insertError } = await supabase.from("posts").upsert(row, { onConflict: "slug" });

        if (insertError) {
            console.error(`Failed to insert post "${slug}":`, insertError.message);
        } else {
            console.log(`Migrated post: ${slug} (status: ${row.status})`);
        }
    }

    console.log("Done.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
