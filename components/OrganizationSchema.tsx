import JsonLdScript from "@/components/JsonLdScript";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo";

export default function OrganizationSchema() {
  return (
    <>
      <JsonLdScript id="organization-schema" data={getOrganizationSchema()} />
      <JsonLdScript id="website-schema" data={getWebSiteSchema()} />
    </>
  );
}
