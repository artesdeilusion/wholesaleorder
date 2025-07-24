"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  legalAgreements: z.boolean().refine(val => val === true, "Yasal sözleşmeleri kabul etmelisiniz"),
 });

type FormValues = z.infer<typeof formSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: FormValues) => {
    setFirebaseError(null);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      // Create user doc in Firestore with role 'customer'
      await setDoc(doc(db, "users", userCred.user.uid), {
        role: "customer",
       });
      // Redirect to /shop after signup
      router.replace("/");
    } catch (err: any) {
      setFirebaseError(err.message || "Kayıt başarısız");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
     <div className="text-center mb-6">
         <Link href="/" className="text-4xl   text-black   tracking-wider font-logo"  >
           PRELUVIA
         </Link>
         </div>

      <Card>
        <CardHeader>
          <CardTitle>Hesap Oluştur</CardTitle>
          <CardDescription>
            Sipariş vermek için kayıt olun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register("email")}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className="text-sm text-red-500">{errors.email.message}</span>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  {...register("password")}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <span className="text-sm text-red-500">{errors.password.message}</span>
                )}
              </div>

              {/* Legal Agreements Checkbox */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="legalAgreements"
                  {...register("legalAgreements")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <div className="flex-1">
                  <label htmlFor="legalAgreements" className="text-sm text-gray-700">
                    <Link href="/kvkk" className="text-black hover:underline font-medium">
                      KVKK Aydınlatma Metni
                    </Link>
                    'ni, <Link href="/privacy" className="text-black hover:underline font-medium">
                      Gizlilik Politikası
                    </Link>
                    'nı ve <Link href="/tos" className="text-black hover:underline font-medium">
                      Kullanım Şartları
                    </Link>
                    'nı okudum ve kabul ediyorum.
                  </label>
                  {errors.legalAgreements && (
                    <span className="text-sm text-red-500 block mt-1">{errors.legalAgreements.message}</span>
                  )}
                </div>
              </div>
             
             
              {firebaseError && (
                <div className="text-sm text-red-600">{firebaseError}</div>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Kayıt Olunuyor..." : "Kayıt Ol"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Zaten hesabınız var mı?{" "}
              <a href="/login" className="underline underline-offset-4">
                Giriş yap
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 