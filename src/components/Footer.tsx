export default function Footer() {
  return (
    <footer className="mt-12 pb-6 text-center text-xs text-whale-muted/60">
      <p>Whale Watcher 🐋 — Not financial advice. Trade at your own risk.</p>
      <p className="mt-1">Built with conviction. © {new Date().getFullYear()}</p>
    </footer>
  );
}
