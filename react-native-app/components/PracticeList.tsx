import { useSession } from "@/components/auth";
import { Practice } from "@/components/Practice";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { useCheckinsState } from "@/hooks/useCheckinsState";
import { Practices } from "@/hooks/usePracticesState";
import { Link } from "expo-router";
import { FlatList } from "react-native";

export type PracticesProp = { practices: Practices };

export function PracticeList({ practices }: PracticesProp) {
  const checkins = useCheckinsState();
  const { signOut, session } = useSession();
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <FlatList
        data={[...practices.keys()]}
        renderItem={({ item }) => (
          <Practice
            title={item as string}
            checkin={checkins.value.find((c) => c.meditation == item)}
            user={session!!}
          />
        )}
      />
      <HStack space="md" className="gap-4 p-3">
        <Link href="/stats" asChild>
          <Button>
            <ButtonText>Stats</ButtonText>
          </Button>
        </Link>
        <Button variant="outline" action="negative" onPress={() => signOut()}>
          <ButtonText>Logout</ButtonText>
        </Button>
        <Button
          variant="outline"
          action="secondary"
          onPress={() => checkins.set([])}
        >
          <ButtonText>Reset</ButtonText>
        </Button>
      </HStack>
    </SafeAreaView>
  );
}
