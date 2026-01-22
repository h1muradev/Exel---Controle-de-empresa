import "../styles/globals.css";

export const metadata = {
  title: "Intranet Empresas",
  description: "Gestão corporativa de empresas e compliance"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
