import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import {
  Alert,
  AlertDescription,
} from "@project/remix/app/components/ui/alert";
import { Button } from "@project/remix/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@project/remix/app/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@project/remix/app/components/ui/form";
import { Input } from "@project/remix/app/components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { trpc } from "@project/trpc/client";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "test@test.com",
      password: "password",
    },
  });

  // Test tRPC connection on component mount
  useEffect(() => {
    async function testConnection() {
      try {
        // Test public endpoint
        const publicHello = await trpc.test.publicHello.query();
        console.log('Public endpoint response:', publicHello);

        // Test protected endpoint (will fail if not authenticated)
        try {
          const protectedHello = await trpc.test.protectedHello.query();
          console.log('Protected endpoint response:', protectedHello);
        } catch (error) {
          console.log('Protected endpoint error (expected if not logged in):', error);
        }
      } catch (error) {
        console.error('Error testing tRPC connection:', error);
      }
    }

    testConnection();
  }, []);

  // Display auth errors from the auth context
  useEffect(() => {
    if (authError) {
      form.setError("root", {
        type: "manual",
        message: authError,
      });
    }
  }, [authError, form]);

  const onSubmit = async (data: LoginFormData) => {
    const ok = await login(data.email, data.password);
    if (ok) {
      navigate("/");
    }
  };

  useEffect(() => {
    console.log("Fetching tokens...");
    (async () => {
      const tokens = await trpc.apiToken.getTokens.query();
      console.log("Tokens fetched:", tokens);
    })();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {form.formState.errors.root && (
        <Alert variant="destructive" className="mb-4 max-w-screen-sm">
          <AlertDescription className="text-center">
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
              <div className="text-sm text-center">
                No account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
