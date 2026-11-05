import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Resource, ResourceCategory } from "@/types";

const BUCKET = "resources";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

type StorageFile = {
  id?: string | null;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: { mimetype?: string | null } | null;
};

function titleFromPath(path: string) {
  const filename = path.split("/").at(-1) ?? path;
  return decodeURIComponent(filename)
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function categoryFromFile(file: StorageFile): ResourceCategory {
  const type = file.metadata?.mimetype?.toLowerCase() ?? "";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("video/")) return "video";
  return "reading";
}

async function listBucketFiles(prefix = ""): Promise<Array<{ file: StorageFile; path: string }>> {
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  const { data, error } = await admin.storage.from(BUCKET).list(prefix, {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) return [];

  const entries = (data ?? []) as StorageFile[];
  const files = entries
    .filter((entry) => Boolean(entry.id) && entry.name !== ".emptyFolderPlaceholder")
    .map((file) => ({ file, path: `${prefix}${file.name}` }));
  const folders = entries.filter((entry) => !entry.id).map((entry) => `${prefix}${entry.name}/`);
  const nested = await Promise.all(folders.map((folder) => listBucketFiles(folder)));

  return [...files, ...nested.flat()];
}

export type StoredResourceFile = {
  id: string;
  path: string;
  title: string;
  category: ResourceCategory;
  createdAt: string;
  downloadUrl: string | null;
};

export async function getStoredResourceFiles(): Promise<StoredResourceFile[]> {
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  const files = await listBucketFiles();
  return Promise.all(files.map(async ({ file, path }) => {
    const { data } = await admin.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
    return {
      id: `storage:${path}`,
      path,
      title: titleFromPath(path) || "Resource document",
      category: categoryFromFile(file),
      createdAt: file.updated_at ?? file.created_at ?? "",
      downloadUrl: data?.signedUrl ?? null,
    };
  }));
}

function storagePathFromUrl(url: string | null) {
  if (!url) return "";
  try {
    return decodeURIComponent(new URL(url).pathname).split("/object/").at(-1) ?? "";
  } catch {
    return decodeURIComponent(url);
  }
}

export async function getMemberResources(): Promise<Resource[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resources")
    .select("id,title,category,description,file_url,is_published,sort_order,created_at,updated_at")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const databaseResources = error
    ? []
    : (data ?? []).flatMap((resource): Resource[] => {
        if (!resource.file_url) return [];
        return [{
          id: resource.id,
          title: resource.title,
          category: resource.category,
          description: resource.description,
          url: resource.file_url,
          is_published: resource.is_published,
          sort_order: resource.sort_order,
          created_at: resource.created_at,
          updated_at: resource.updated_at,
        }];
      });
  const bucketFiles = await getStoredResourceFiles();
  const existingPaths = new Set(databaseResources.map((resource) => storagePathFromUrl(resource.url)));
  const storageResources = bucketFiles
      .filter((file) => !existingPaths.has(file.path) && file.downloadUrl)
      .map((file, index): Resource => {
        return {
          id: file.id,
          title: file.title,
          category: file.category,
          description: "Open this resource in a new tab.",
          url: file.downloadUrl,
          is_published: true,
          sort_order: databaseResources.length + index,
          created_at: file.createdAt,
          updated_at: file.createdAt,
        };
      });

  return [...databaseResources, ...storageResources];
}
