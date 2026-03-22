export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm font-medium">
          ClauseGuard &mdash; AI Contract Analysis for Indian Law
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          ClauseGuard provides informational analysis only and does not
          constitute legal advice. For important agreements, always consult a
          qualified advocate.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ClauseGuard. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
