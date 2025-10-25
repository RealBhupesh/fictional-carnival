import Link from "next/link";

const SiteFooter = () => {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-text/70 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} NovaPulse. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-primary">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-primary">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-primary">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
