import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your Punjabi Throttlers Brotherhood member account.",
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md w-full">
      <h1 className="text-3xl font-semibold text-center text-pt-cream mb-2">Welcome back, rider</h1>
      <p className="text-center text-pt-muted mb-10">Log in to your member account.</p>

      <Card className="p-8">
        <LoginForm />
      </Card>

      <p className="text-center text-sm text-pt-muted mt-6">
        Not a member yet?{" "}
        <Link href="/join" className="text-pt-gold hover:underline">
          Join the brotherhood
        </Link>
      </p>
    </section>
  );
}
