import { Home } from "../pages/Home";
import { AppRoute } from "@miguelludert/types-common";
import { ProfilePage } from "../pages/ProfilePage";

export const routes: AppRoute[] = [
  {
    path: "/",
    element: <Home />,
    label: "Home",
  },
  {
    path: "/profile",
    element: <ProfilePage />,
    label: "Profile",
  },
];
