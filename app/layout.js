import { Exo } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "../components/AnimatedBackground";
import Navigation from "../components/Navigation";

const exo = Exo({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});


export const metadata = {
  title: "AI Quiz App",
  description: "Test your knowledge with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${exo.className} antialiased`}>
        <AnimatedBackground />
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
