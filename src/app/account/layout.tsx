
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Hesabım - Preluvia"
};
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
} 