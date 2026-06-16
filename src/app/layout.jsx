
import "./globals.css";

export const metadata = {
  title: "Ticketo | Premium Event Discovery & Ticket Booking Platform",
  description:
    "Browse, discover, and purchase tickets for the finest premium events near you. Or create your own organizer account and host events seamlessly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#080c16] text-[#f3f4f6]">
        
        <main className="flex-grow flex flex-col">{children}</main>
       
      </body>
    </html>
  );
}
