"use client";

import { useActionState } from "react";
import { verifyOtp, type AuthActionState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function VerifyForm({ email, phone }: { email?: string; phone?: string }) {
  const [state, action, pending] = useActionState(verifyOtp, initialState);

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <form action={action} className="space-y-4">
          <input type="hidden" name="email" value={email ?? ""} />
          <input type="hidden" name="phone" value={phone ?? ""} />
          <div className="space-y-2">
            <Label htmlFor="token">Code</Label>
            <Input id="token" name="token" inputMode="numeric" placeholder="123456" required />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button className="w-full" disabled={pending}>
            {pending ? "Checking..." : "Verify"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
