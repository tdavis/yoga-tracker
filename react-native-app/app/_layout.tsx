import { SessionProvider } from "@/components/ctx";
import { Slot } from "expo-router";

export default function Root() {
  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
