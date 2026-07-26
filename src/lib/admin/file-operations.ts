import { getServiceRoleClient } from "@/lib/supabase";

const BUCKET = "Blogs";

export type PostMetadata = {
    title: string;
    publishedAt: string;
    updatedAt?: string;
    summary: string;
    image?: string;
    tags: string[];
    category: 'Engineering' | 'Data Engineering' | 'Product Management' |
    'SQL & Databases' | 'PySpark & Big Data' | 'Tech Decoded';
    featured?: boolean;
    status?: 'draft' | 'published';
};

type PostRow = {
    slug: string;
    title: string;
    published_at: string;
    updated_at: string | null;
    summary: string | null;
    image: string | null;
    tags: string[] | null;
    category: string;
    featured: boolean | null;
    status: string | null;
    content: string;
};

function rowToPost(row: PostRow): { metadata: PostMetadata; content: string } {
    return {
        metadata: {
            title: row.title,
            publishedAt: row.published_at,
            updatedAt: row.updated_at || undefined,
            summary: row.summary || "",
            image: row.image || undefined,
            tags: row.tags || [],
            category: row.category as PostMetadata['category'],
            featured: row.featured || false,
            status: (row.status as PostMetadata['status']) || 'draft',
        },
        content: row.content,
    };
}

function metadataToRow(slug: string, metadata: PostMetadata, content: string) {
    return {
        slug,
        title: metadata.title,
        published_at: metadata.publishedAt,
        updated_at: metadata.updatedAt || null,
        summary: metadata.summary || "",
        image: metadata.image || null,
        tags: metadata.tags || [],
        category: metadata.category,
        featured: metadata.featured || false,
        status: metadata.status || 'draft',
        content,
    };
}

export async function createPost(
    slug: string,
    metadata: PostMetadata,
    content: string
): Promise<void> {
    const adminClient = getServiceRoleClient();
    const { error } = await adminClient.from("posts").insert(metadataToRow(slug, metadata, content));
    if (error) throw new Error(error.message);
}

export async function updatePost(
    slug: string,
    metadata: PostMetadata,
    content: string
): Promise<void> {
    const adminClient = getServiceRoleClient();
    const row = metadataToRow(slug, metadata, content);
    row.updated_at = new Date().toISOString();
    const { error } = await adminClient.from("posts").update(row).eq("slug", slug);
    if (error) throw new Error(error.message);
}

export async function deletePost(slug: string): Promise<void> {
    const adminClient = getServiceRoleClient();
    const { error } = await adminClient.from("posts").delete().eq("slug", slug);
    if (error) throw new Error(error.message);
}

export async function getAllPosts(): Promise<Array<{ slug: string; metadata: PostMetadata; content: string }>> {
    const adminClient = getServiceRoleClient();
    const { data, error } = await adminClient
        .from("posts")
        .select("*")
        .order("published_at", { ascending: false });

    if (error || !data) return [];

    return (data as PostRow[]).map((row) => ({ slug: row.slug, ...rowToPost(row) }));
}

export async function getPost(slug: string): Promise<{ metadata: PostMetadata; content: string } | null> {
    const adminClient = getServiceRoleClient();
    const { data, error } = await adminClient
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

    if (error || !data) return null;

    return rowToPost(data as PostRow);
}

export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export async function uploadImage(
    postSlug: string,
    file: File
): Promise<string> {
    const fileName = file.name.replace(/[^a-z0-9.-]/gi, '-').toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `${postSlug}/${Date.now()}-${fileName}`;

    const adminClient = getServiceRoleClient();
    const { error } = await adminClient.storage.from(BUCKET).upload(storagePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
    });

    if (error) throw new Error(error.message);

    const { data } = adminClient.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
}
