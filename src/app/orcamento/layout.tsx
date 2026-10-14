export default function OrcamentoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Public layout — no authentication, no sidebar
  return <>{children}</>;
}
