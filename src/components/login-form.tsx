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
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm({
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
      const userCred = await signInWithEmailAndPassword(auth, data.email, data.password);
      // Fetch user role
      const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
      const userData = userDoc.data();
      if (userData?.role === "admin") {
        router.replace("/dashboard");
      } else {
        router.replace("/");
      }
    } catch (err: any) {
      setFirebaseError(err.message || "Login failed");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Preluvia Logo */}
      <div className="text-center mb-6">
        <Link href="/" className="text-4xl   text-black   tracking-wider font-logo"  >
          PRELUVIA
        </Link>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Giriş Yap</CardTitle>
          <CardDescription>
            Lütfen e-posta adresinizi ve şifrenizi giriniz
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
                <div className="flex items-center">
                  <Label htmlFor="password">Şifre</Label>
                  <Link
                    href="/login/forgot"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Şifrenizi mi unuttunuz?
                  </Link>
                </div>
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
              {firebaseError && (
                <div className="text-sm text-red-500 text-center">{firebaseError}</div>
              )}
            </div>
            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
            <div className="mt-4 text-center text-sm">
                Hesabınız yok mu?{" "}
              <a href="/signup" className="underline underline-offset-4">
                Kayıt Ol
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
