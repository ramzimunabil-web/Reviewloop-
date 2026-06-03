import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="font-display text-7xl font-semibold text-moss">404</p>
        <p className="mt-2 text-ink/60">We couldn&apos;t find that page.</p>
        <Link href="/" className="mt-6 inline-block"><Button>Go home</Button></Link>
      </div>
    </main>
  );
}
