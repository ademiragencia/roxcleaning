// Server component: emits a JSON-LD <script> into the static HTML so Google
// reads structured data on first crawl (no JS execution needed).
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
