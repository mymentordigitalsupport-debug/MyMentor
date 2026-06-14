import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl mb-6" aria-hidden="true">🌫</p>
      <h1 className="font-serif text-3xl text-forest font-semibold mb-3">
        Page not found
      </h1>
      <p className="text-muted text-sm mb-8 max-w-xs leading-relaxed">
        This page doesn&apos;t exist or may have moved. Let&apos;s get you back
        on your path.
      </p>
      <Link
        href="/today"
        className="bg-sage text-cream px-6 py-3 rounded-2xl text-sm font-medium hover:bg-forest transition-colors"
      >
        Back to Today
      </Link>
    </div>
  );
}
