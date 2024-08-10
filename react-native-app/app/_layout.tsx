import { SessionProvider } from "@/components/auth";
import { Slot } from "expo-router";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function Root() {
  return (
    <GluestackUIProvider mode="light">
      <SessionProvider>
        <Slot />
      </SessionProvider>
    </GluestackUIProvider>
  );
}
