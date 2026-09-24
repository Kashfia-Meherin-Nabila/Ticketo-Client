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
import { FaUser, FaEnvelope, FaLock, FaImage, FaGoogle } from "react-icons/fa";
import Logo from "@/components/Logo";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { uploadImage } from "@/utils/uploadImage";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  
//   console.log(errors);

  const onSubmit = async (data) => {
    // Upload image to imgbb
    const imageFile = data.image[0];
    const imageUrl = await uploadImage(imageFile);

    const { data: signUpData, error: signUpError } =
      await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        image: imageUrl,
        role: data.role,
      });
     console.log(signUpData, signUpError);
    if (signUpError) {
  toast.error(signUpError.message || "Registration failed");
  return;
}
router.push("/");
router.refresh();
  };
  console.log(errors);

  return (
    <div>
      <Card className="w-full max-w-lg border border-white/5 bg-slate-950/70 backdrop-blur-xl shadow-2xl p-4 my-8 mx-auto">
        <CardHeader className="flex flex-col gap-1 items-center pb-6 text-center">
          <Logo />
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-pink-500 bg-clip-text text-transparent">
            Create an Account
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Join Ticketo to book premium events or host your own organization.
          </p>
        </CardHeader>
        <CardBody className="gap-4">
          <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
            <Label htmlFor="name">Full Name</Label>
<div className="relative w-full">
  <FaUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
  <Input
    {...register("name", { required: "Name is Required" })}
    id="name"
    placeholder="John Doe"
    className="w-full pl-9 bg-slate-900/50 border-white/10 hover:border-pink-500/50 focus-within:!border-pink-500"
  />
</div>
{errors.name && <p className="text-red-500">{errors.name.message}</p>}

<Label htmlFor="email">Email Address</Label>
<div className="relative w-full">
  <FaEnvelope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
  <Input
    {...register("email", { required: "Email is Required" })}
    id="email"
    type="email"
    placeholder="john@example.com"
    className="w-full pl-9 bg-slate-900/50 border-white/10 hover:border-pink-500/50 focus-within:!border-pink-500"
  />
</div>
{errors.email && <p className="text-red-500">{errors.email.message}</p>}


<Label htmlFor="image">Profile Image</Label>
<Input
  {...register("image", { required: "Image is Required" })}
  id="image"
  type="file"
  accept="image/*"
  className="w-full bg-slate-900/50 border-white/10 hover:border-pink-500/50 focus-within:!border-pink-500"
/>
{errors.image && <p className="text-red-500">{errors.image.message}</p>}
<Label htmlFor="password">Password</Label>
<div className="relative w-full">
  <FaLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
  <Input
    {...register("password", {
      required: "Password is Required",
      minLength: { value: 6, message: "Min 6 characters" },
      maxLength: { value: 12, message: "Max 12 characters" },
    })}
    id="password"
    type="password"
    placeholder="••••••••"
    className="w-full pl-9 bg-slate-900/50 border-white/10 hover:border-pink-500/50 focus-within:!border-pink-500"
  />
</div>
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}

            <div className="flex flex-col gap-2 w-full">
              <Label
                htmlFor="role"
                className="text-sm font-semibold text-slate-300"
              >
                Select Role
              </Label>
              <select
                id="role"
                {...register("role", { required: "Role is required" })}
                className="w-full bg-slate-900/50 border-white/10 hover:border-pink-500/50 focus-within:!border-pink-500 p-3"
              >
                <option value="attendee">Attendee</option>
                <option value="organizer">Organizer</option>
              </select>
              {errors.role && (
                <p className="text-red-500">{errors.role.message}</p>
              )}
            </div>

            <Button
  type="submit"
  className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-bold h-12 shadow-lg shadow-pink-500/10 hover:shadow-pink-500/20"
>
  Create Account
</Button>
          </Form>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/5" />
            <span className="mx-4 text-xs text-slate-500 font-semibold uppercase">
              Or Sign Up With
            </span>
            <div className="flex-grow border-t border-white/5" />
          </div>

          <Button
  variant="outline"
  className="w-full rounded-xl border-white/10 hover:bg-white/5 hover:border-white/20 text-white font-semibold h-11"
>
  <FaGoogle className="text-pink-500" />
  Google OAuth
</Button>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-pink-500 hover:text-pink-400 font-semibold hover:underline"
            >
              Log In
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
