import { VerifyForm } from "@/features/auth/components/verify-form";

export default async function VerifyPage({
  searchParams
}: {
  searchParams: Promise<{ phone?: string; email?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-wood-700">Verification</p>
        <h1 className="mt-2 text-3xl font-semibold text-charcoal-900">Enter your code</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Check your phone or email for the one-time code.
        </p>
      </div>
      <VerifyForm email={params.email} phone={params.phone} />
    </div>
  );
}
