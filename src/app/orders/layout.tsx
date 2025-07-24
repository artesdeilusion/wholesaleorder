
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Siparişlerim - Preluvia"
};
export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
} 