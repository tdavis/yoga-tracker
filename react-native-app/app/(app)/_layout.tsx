import { Stack } from "expo-router";
import { useSession } from "@/components/ctx";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Spinner } from "@/components/ui/spinner";
import "@/global.css";
import { Redirect } from "expo-router";

export default function RootLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <Spinner size="small" />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }
  return (
    <GluestackUIProvider mode="light">
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Home",
          }}
        />
        <Stack.Screen
          name="stats"
          options={{
            headerTitle: "Stats",
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
