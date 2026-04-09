export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL — points to our self-hosted Google OAuth route.
export const getLoginUrl = () => {
  return `${window.location.origin}/api/auth/google`;
};
