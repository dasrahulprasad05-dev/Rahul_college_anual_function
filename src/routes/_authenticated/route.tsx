import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    await auth.authStateReady();
    if (!auth.currentUser) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { user: auth.currentUser };
  },
  component: () => <Outlet />,
});
