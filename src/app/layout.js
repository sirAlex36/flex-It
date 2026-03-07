import "./globals.css";

export const metadata = {
  title: "Flex-It Events",
  description: "Discover and manage amazing events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
