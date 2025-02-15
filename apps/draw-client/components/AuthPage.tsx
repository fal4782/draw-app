"use client";

import { authAction } from "@/actions/auth.action";
import { Button } from "@repo/ui/button";
import { useState } from "react";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    await authAction(formData, isSignin, setError);
  };

  const handleInputChange = () => {
    setError(null);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <form action={handleSubmit}>
        <div className="p-8 bg-white rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {isSignin ? "Welcome Back" : "Create Account"}
          </h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Email"
                name="email"
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                name="password"
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-black text-white rounded-md hover:opacity-90 transition-opacity"
              >
                {isSignin ? "Sign In" : "Sign Up"}
              </Button>
            </div>
            {error && <small className="text-red-500 mb-4">{error}</small>}
          </div>
        </div>
      </form>
    </div>
  );
}
