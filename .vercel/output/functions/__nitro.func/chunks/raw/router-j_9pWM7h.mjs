import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { createContext, useState, useEffect, useContext } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import { createFileRoute, lazyRouteComponent, createRootRouteWithContext, HeadContent, Scripts, useRouter, Outlet, redirect, createRouter, Link } from '@tanstack/react-router';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { z } from 'zod';

var app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: "AIzaSyA1J-B_TneXbQWtT1MX4EOC87E6gOfIvFA",
  authDomain: "college-anual-function.firebaseapp.com",
  projectId: "college-anual-function",
  storageBucket: "college-anual-function.firebasestorage.app",
  messagingSenderId: "732796648652",
  appId: "1:732796648652:web:5f2fa5b0f602e290a09669",
  measurementId: "G-EGCVTJHLMH"
});
var auth = getAuth(app);
var db = getFirestore(app);
var storage = getStorage(app);

var AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = firebaseUser;
        appUser.id = firebaseUser.uid;
        setUser(appUser);
        setSession({ user: appUser });
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            setRoles(role ? [role] : ["student"]);
          } else
            setRoles(["student"]);
        } catch (err) {
          console.error("Error fetching user roles:", err);
          setRoles(["student"]);
        }
      } else {
        setUser(null);
        setSession(null);
        setRoles([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const value = {
    user,
    session,
    roles,
    loading,
    isAdmin: roles.includes("admin"),
    isVolunteer: roles.includes("volunteer") || roles.includes("admin"),
    signOut: async () => {
      await signOut(auth);
    }
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, {
    value,
    children
  });
}
function useAuth() {
  const c = useContext(AuthContext);
  if (!c)
    throw new Error("useAuth must be used inside AuthProvider");
  return c;
}

var $$splitComponentImporter$a = () => import('./events._eventId-BBAbikiT.mjs');
var Route$a = createFileRoute("/events/$eventId")({ component: lazyRouteComponent($$splitComponentImporter$a, "component") });

var styles_default = "/assets/styles-vc_05DPD.css";
var Toaster$1 = ({ ...props }) => {
  return /* @__PURE__ */ jsx(Toaster, {
    className: "toaster group",
    toastOptions: { classNames: {
      toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
      actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
    } },
    ...props
  });
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-screen items-center justify-center px-4",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-md text-center",
      children: [
        /* @__PURE__ */ jsx("h1", {
          className: "text-7xl font-bold text-gradient-gold",
          children: "404"
        }),
        /* @__PURE__ */ jsx("h2", {
          className: "mt-4 text-xl font-semibold",
          children: "Page not found"
        }),
        /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: "The page you're looking for doesn't exist or has been moved."
        }),
        /* @__PURE__ */ jsx("div", {
          className: "mt-6",
          children: /* @__PURE__ */ jsx(Link, {
            to: "/",
            className: "inline-flex items-center justify-center rounded-md gradient-gold px-4 py-2 text-sm font-medium text-primary-foreground",
            children: "Go home"
          })
        })
      ]
    })
  });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);
  return /* @__PURE__ */ jsx("div", {
    className: "flex min-h-screen items-center justify-center px-4",
    children: /* @__PURE__ */ jsxs("div", {
      className: "max-w-md text-center",
      children: [
        /* @__PURE__ */ jsx("h1", {
          className: "text-xl font-semibold",
          children: "Something went wrong"
        }),
        /* @__PURE__ */ jsx("p", {
          className: "mt-2 text-sm text-muted-foreground",
          children: error.message
        }),
        /* @__PURE__ */ jsxs("div", {
          className: "mt-6 flex justify-center gap-2",
          children: [/* @__PURE__ */ jsx("button", {
            onClick: () => {
              router.invalidate();
              reset();
            },
            className: "rounded-md gradient-gold px-4 py-2 text-sm font-medium text-primary-foreground",
            children: "Try again"
          }), /* @__PURE__ */ jsx("a", {
            href: "/",
            className: "rounded-md border border-border px-4 py-2 text-sm",
            children: "Go home"
          })]
        })
      ]
    })
  });
}
var Route$11 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      { title: "Festa \u2014 College Annual Function" },
      {
        name: "description",
        content: "Book QR-coded tickets for your college annual function events. Scan and check in seamlessly."
      }
    ],
    links: [
      {
        rel: "stylesheet",
        href: styles_default
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@500;600;700;800;900&family=Inter:wght@400;500;600&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
  });
}
function RootComponent() {
  const { queryClient } = Route$11.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      router.invalidate();
      if (user)
        queryClient.invalidateQueries();
    });
    return () => unsubscribe();
  }, [router, queryClient]);
  return /* @__PURE__ */ jsx(QueryClientProvider, {
    client: queryClient,
    children: /* @__PURE__ */ jsxs(AuthProvider, { children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(Toaster$1, {
      richColors: true,
      position: "top-center"
    })] })
  });
}
var $$splitComponentImporter$10 = () => import('./reset-password-Cjtv13FO.mjs');
var Route$10 = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({ meta: [{ title: "Reset Password \u2014 Festa" }] }),
  component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import('./auth-D3YoaELn.mjs');
var searchSchema = z.object({ redirect: z.string().optional() });
var Route$9 = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in \u2014 Festa" }] }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import('./route-Di7iQBCH.mjs');
var Route$8 = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    await auth.authStateReady();
    if (!auth.currentUser)
      throw redirect({
        to: "/auth",
        search: { redirect: location.href }
      });
    return { user: auth.currentUser };
  },
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import('./routes-BLYotEsL.mjs');
var Route$7 = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Festa \u2014 College Annual Function 2026" }, {
    name: "description",
    content: "Browse and book QR-coded tickets for performances, competitions, and ceremonies at the annual function."
  }] }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import('./events.index-ChKFNjvi.mjs');
var Route$6 = createFileRoute("/events/")({
  head: () => ({ meta: [
    { title: "All Events \u2014 Festa" },
    {
      name: "description",
      content: "Browse every published event of the annual function and book your QR ticket."
    },
    {
      property: "og:title",
      content: "All Events \u2014 Festa"
    },
    {
      property: "og:description",
      content: "Browse every published event of the annual function and book your QR ticket."
    }
  ] }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import('./volunteer-DspnbWOC.mjs');
var Route$5 = createFileRoute("/_authenticated/volunteer")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import('./tickets-B1jNHQXs.mjs');
var Route$4 = createFileRoute("/_authenticated/tickets")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import('./scan-DF45i0x_.mjs');
var Route$3 = createFileRoute("/_authenticated/scan")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import('./gate-pass-DAjQN5mK.mjs');
var Route$2 = createFileRoute("/_authenticated/gate-pass")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import('./dashboard-Cp1W5xGi.mjs');
var Route$1 = createFileRoute("/_authenticated/dashboard")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import('./admin-BsqHaqAC.mjs');
var Route = createFileRoute("/_authenticated/admin")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var ResetPasswordRoute = Route$10.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$11
});
var AuthRoute = Route$9.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$11
});
var AuthenticatedRouteRoute = Route$8.update({
  id: "/_authenticated",
  getParentRoute: () => Route$11
});
var IndexRoute = Route$7.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$11
});
var EventsIndexRoute = Route$6.update({
  id: "/events/",
  path: "/events/",
  getParentRoute: () => Route$11
});
var EventsEventIdRoute = Route$a.update({
  id: "/events/$eventId",
  path: "/events/$eventId",
  getParentRoute: () => Route$11
});
var AuthenticatedVolunteerRoute = Route$5.update({
  id: "/volunteer",
  path: "/volunteer",
  getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedTicketsRoute = Route$4.update({
  id: "/tickets",
  path: "/tickets",
  getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedScanRoute = Route$3.update({
  id: "/scan",
  path: "/scan",
  getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedGatePassRoute = Route$2.update({
  id: "/gate-pass",
  path: "/gate-pass",
  getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$1.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRouteRouteChildren = {
  AuthenticatedAdminRoute: Route.update({
    id: "/admin",
    path: "/admin",
    getParentRoute: () => AuthenticatedRouteRoute
  }),
  AuthenticatedDashboardRoute,
  AuthenticatedGatePassRoute,
  AuthenticatedScanRoute,
  AuthenticatedTicketsRoute,
  AuthenticatedVolunteerRoute
};
var rootRouteChildren = {
  IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
  AuthRoute,
  ResetPasswordRoute,
  EventsEventIdRoute,
  EventsIndexRoute
};
var routeTree = Route$11._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
  return createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
};

const routerJ_9pWM7h = /*#__PURE__*/Object.freeze({
	__proto__: null,
	getRouter: getRouter
});

export { Route$a as R, auth as a, db as d, routerJ_9pWM7h as r, storage as s, useAuth as u };
//# sourceMappingURL=router-j_9pWM7h.mjs.map
