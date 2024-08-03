import { Stack } from "expo-router";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            // Hide the header for this route
            headerShown: false,
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
