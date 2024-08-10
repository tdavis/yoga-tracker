import { useSession } from "@/components/auth";
import { Practice } from "@/components/Practice";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { useCheckinsState } from "@/hooks/useCheckinsState";
import { Practices } from "@/hooks/usePracticesState";
import { Link } from "expo-router";
import { useEffect, useRef } from "react";
import { FlatList } from "react-native";

export type PracticesProp = { practices: Practices };

export function PracticeList({ practices }: PracticesProp) {
  const checkins = useCheckinsState();
  const { signOut, session } = useSession();

  const timerRef = useRef<any | undefined>(undefined);
  const delayAllowCompletion = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const cannotComplete = checkins.value.filter((i) => !i.canComplete);
      if (cannotComplete.length === 0) {
        return;
      }

      checkins.set((c) => {
        c.forEach((i) => {
          i.canComplete = true;
        });
        return c;
      });
    }, 10000);
    console.log(timerRef.current);
  };
  //useEffect(() => clearTimeout(timerRef.current));

  checkins.subscribe(delayAllowCompletion);

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <FlatList
        data={[...practices.keys()]}
        renderItem={({ item }) => (
          <Practice
            title={item}
            checkin={checkins.value.find((c) => c.meditation === item)}
            user={session!}
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
      </HStack>
    </SafeAreaView>
  );
}
