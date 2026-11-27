/** Public listing that every course without its own external page links to. */
export const COURSE_FALLBACK_HREF = "/courses";

export function slugifyCourseTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "course"
  );
}

/**
 * Anchor id for a course card on /courses. Dashboard hrefs are usually
 * auto-generated as `/courses/{slug}`, so reuse that slug when present.
 */
export function courseAnchorId(course: { title: string; href?: string | null }): string {
  const match = course.href?.trim().match(/^\/courses\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : slugifyCourseTitle(course.title);
}

/**
 * There is no per-course detail route, so `/courses/{slug}` links jump to that
 * course's card on the /courses listing. External or other site links pass through.
 * Idempotent: resolving an already-resolved href returns it unchanged.
 */
export function resolveCourseHref(href?: string | null): string {
  const trimmed = href?.trim() ?? "";
  if (!trimmed || trimmed === "#") return COURSE_FALLBACK_HREF;
  const slug = trimmed.match(/^\/courses\/([^/?#]+)/);
  if (slug) return `${COURSE_FALLBACK_HREF}#${slug[1]}`;
  return trimmed;
}
