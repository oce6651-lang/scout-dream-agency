import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useGame } from "@/game/store";

export const Route = createFileRoute("/_game")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const s = useGame.getState().save;
    if (!s) throw redirect({ to: "/novo" });
  },
  component: () => <Outlet />,
});
