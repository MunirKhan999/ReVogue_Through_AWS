"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  signUp,
  confirmSignUp,
  signIn,
  fetchAuthSession,
} from "aws-amplify/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sparkles, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getRoleFromToken, syncUserWithBackend } from "@/lib/auth-sync"

type Step = "signup" | "confirm"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>("signup")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "buyer",
  })

  async function completeLoginAndSync(email: string, password: string) {
    await signIn({ username: email, password })

    const session = await fetchAuthSession()
    const token = session.tokens?.accessToken?.toString()

    if (!token) {
      throw new Error("No access token received")
    }

    const user = await syncUserWithBackend(token)

    localStorage.setItem("token", token)
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      }),
    )

    const role = getRoleFromToken(token) ?? user.role
    router.push(role === "seller" ? "/seller/dashboard" : "/store")
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await signUp({
        username: formData.email,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
            name: formData.full_name,
            "custom:role": formData.role,
          },
        },
      })

      toast({
        title: "Check your email",
        description: "Enter the 6-digit confirmation code we sent you.",
      })
      setStep("confirm")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to create account"
      toast({
        title: "Signup failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await confirmSignUp({
        username: formData.email,
        confirmationCode,
      })

      await completeLoginAndSync(formData.email, formData.password)

      toast({
        title: "Account created!",
        description: "Welcome to ReVogue",
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid confirmation code"
      toast({
        title: "Confirmation failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-8 w-8 text-brand" />
            <span className="font-bold text-2xl">ReVogue</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join ReVogue and start your fashion journey</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{step === "signup" ? "Sign Up" : "Confirm Email"}</CardTitle>
            <CardDescription>
              {step === "signup"
                ? "Create your account to get started"
                : "Enter the 6-digit code sent to your email"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "signup" ? (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>I want to</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <div className="space-y-3">
                      <RadioGroupItem value="buyer">Shop for fashion items</RadioGroupItem>
                      <RadioGroupItem value="seller">Sell my products</RadioGroupItem>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirm} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="confirmationCode">Confirmation Code</Label>
                  <Input
                    id="confirmationCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    required
                    maxLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                  disabled={loading}
                >
                  {loading ? "Confirming..." : "Confirm & Sign In"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("signup")}
                  disabled={loading}
                >
                  Back to sign up
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-brand hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
