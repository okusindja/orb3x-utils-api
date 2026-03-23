import { permanentRedirect } from "next/navigation";

export default function ApiPage() {
  permanentRedirect("/docs/api-reference");
}
