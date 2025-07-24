"use client";
import Link from "next/link";

export default function AccountAppbar() {
  return (
    <header className="w-full flex justify-between items-center py-4 px-6 bg-white shadow-sm">
      <div className="text-xl font-bold text-primary font-logo"><Link href="/">PRELUVIA</Link></div>
      <div className="flex gap-4">
        <Link href="/"><button className="text-gray-600 hover:text-black">Anasayfa</button></Link>
      </div>
    </header>
  );
} 