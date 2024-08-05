import { SessionProvider } from "@/components/auth";
import { Slot } from "expo-router";

export default function Root() {
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
