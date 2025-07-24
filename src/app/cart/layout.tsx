 
import Navbar from "@/components/Navbar";
export const metadata = {
  title: "Sepetim - Preluvia"
};
 
export default function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
} 