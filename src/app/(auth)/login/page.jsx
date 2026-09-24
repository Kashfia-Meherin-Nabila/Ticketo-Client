"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent as CardBody,
  Input,
  Button,
  Label,
  Form,
} from "@heroui/react";
import { FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";
import Logo from "@/components/Logo";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message || "Login failed");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div>
      <Card className="w-full max-w-md border border-white/5 bg-slate-950/70 backdrop-blur-xl shadow-2xl p-4 my-8 mx-auto">
        <CardHeader className="flex flex-col gap-1 items-center pb-6 text-center">
          <Logo />
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-pink-500 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Access your Ticketo account and purchase event tickets.
          </p>
        </CardHeader>
        <CardBody className="gap-4">
          <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative w-full">
              <FaEnvelope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <Input
                {...register("email", { required: "Email is required" })}
                id="email"
                type="email"
                placeholder="john@example.com"
                className="w-full pl-9 bg-slate-900/50 border-white/10 hover:border-pink-500/50 focus-within:!border-pink-500"
              />
            </div>
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}

            <Label htmlFor="password">Password</Label>
            <div className="relative w-full">
              <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <Input
                {...register("password", { required: "Password is required" })}
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full pl-9 bg-slate-900/50 border-white/10 hover:border-pink-500/50 focus-within:!border-pink-500"
              />
            </div>
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold h-12 shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20"
            >
              Sign In
            </Button>
          </Form>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/5" />
            <span className="mx-4 text-xs text-slate-500 font-semibold uppercase">
              Or Login With
            </span>
            <div className="flex-grow border-t border-white/5" />
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl border-white/10 hover:bg-white/5 hover:border-white/20 text-white font-semibold h-11"
          >
            <FaGoogle className="text-pink-500" />
            Google Account
          </Button>

          <p className="text-center text-sm text-slate-400 mt-6">
            New At Ticketo?{" "}
            <Link
              href="/register"
              className="text-pink-500 hover:text-pink-400 font-semibold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}