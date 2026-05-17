import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Flex-It Events",
  description: "Discover and manage amazing events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
