export type AdminToastType = "success" | "error" | "info";

export const ADMIN_TOAST_QUERY_KEY = "admin_toast";
export const ADMIN_TOAST_TYPE_QUERY_KEY = "admin_toast_type";
export const ADMIN_TOAST_DESC_QUERY_KEY = "admin_toast_desc";

type BuildAdminToastUrlInput = {
  path: string;
  type: AdminToastType;
  message: string;
  description?: string;
};

export function buildAdminToastUrl({
  path,
  type,
  message,
  description,
}: BuildAdminToastUrlInput) {
  const [pathname, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.set(ADMIN_TOAST_QUERY_KEY, message);
  params.set(ADMIN_TOAST_TYPE_QUERY_KEY, type);
  if (description) {
    params.set(ADMIN_TOAST_DESC_QUERY_KEY, description);
  } else {
    params.delete(ADMIN_TOAST_DESC_QUERY_KEY);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
