import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


export default function RootLayout({ children }) {
  return (
    <div>
        <Navbar />
        <div className="flex-grow flex flex-col">{children}</div>
        <Footer />
      </div>
  );
}
