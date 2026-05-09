import { LoginForm } from "@/features/auth/components/login-form";
import { isOwnerAuthConfigured } from "@/lib/auth/owner-auth";

export default function LoginPage() {
  const ownerAuthEnabled = isOwnerAuthConfigured();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-normal text-charcoal-900">
          Freelancerinterior Operation
        </h1>
        <p className="mt-3 text-base font-medium text-wood-700">Sign in to your projects</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {ownerAuthEnabled
            ? "Use your owner email and password. The app keeps your session active on this device."
            : "Use email or phone. The app keeps your session active on this device."}
        </p>
      </div>
      <LoginForm ownerAuthEnabled={ownerAuthEnabled} />
    </div>
  );
}
