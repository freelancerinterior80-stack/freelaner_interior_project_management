"use client";

import { useActionState, useState } from "react";
import { Lock, Mail, Phone } from "lucide-react";
import { signInWithEmail, signInWithPhone, type AuthActionState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

export function LoginForm({ ownerAuthEnabled = false }: { ownerAuthEnabled?: boolean }) {
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [emailState, emailAction, emailPending] = useActionState(signInWithEmail, initialState);
  const [phoneState, phoneAction, phonePending] = useActionState(signInWithPhone, initialState);
  const error = mode === "email" ? emailState.error : phoneState.error;

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="space-y-5 p-4">
        <div className={`grid gap-2 rounded-lg bg-secondary p-1 ${ownerAuthEnabled ? "grid-cols-1" : "grid-cols-2"}`}>
          <button
            type="button"
            onClick={() => setMode("email")}
            className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium ${
              mode === "email" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          {!ownerAuthEnabled ? (
            <button
              type="button"
              onClick={() => setMode("phone")}
              className={`flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium ${
                mode === "phone" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Phone className="h-4 w-4" />
              Phone
            </button>
          ) : null}
        </div>

        {mode === "email" ? (
          <form action={emailAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" placeholder="owner@company.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" name="password" type="password" className="pl-9" required />
              </div>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" disabled={emailPending}>
              {emailPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        ) : (
          <form action={phoneAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+9665xxxxxxx" required />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" disabled={phonePending}>
              {phonePending ? "Sending..." : "Continue"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
