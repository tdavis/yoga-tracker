import {
  Checkin,
  markComplete,
  reloadTodaysCheckins,
  useCheckinsState,
} from "@/components/CheckinsState";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import TimeAgo from "@andordavoti/react-native-timeago";
import { FlatList } from "react-native";
import { Link } from "expo-router";
import { useSession } from "@/components/ctx";
import { Heading } from "@/components/ui/heading/index.web";
import { Practices, usePracticesState } from "@/components/PracticesState";
import { Spinner } from "@/components/ui/spinner";
import { AddIcon, CheckIcon, Icon } from "@/components/ui/icon";

export type PracticesProp = { practices: Practices };
type ItemProps = { user: string; title: string; checkin: Checkin | undefined };

function ItemDescription({ checkin }: { checkin: Checkin | undefined }) {
  if (checkin === undefined) {
    return <></>;
  } else {
    return (
      <Text className="text-sm font-roboto line-clamp-1">
        <TimeAgo dateTo={checkin.completed_at} />
      </Text>
    );
  }
}

function Item({ user, title, checkin }: ItemProps) {
  const completedToday = checkin?.completed_today ?? 0;

  let icon;
  if (checkin == undefined) {
    icon = AddIcon;
  } else {
    icon = CheckIcon;
  }

  return (
    <HStack
      space="lg"
      key={title}
      className="w-full px-4 py-2 justify-between items-center"
    >
      <HStack space="xl" className="items-center">
        <Box
          className={cn(
            "rounded-full h-10 w-10 items-center justify-center",
            { "bg-success-0": completedToday !== 0 },
            { "bg-error-50": completedToday === 0 },
          )}
        >
          <Text
            className={cn(
              { "text-success-800": completedToday > 0 },
              { "text-error-700": completedToday === 0 },
            )}
          >
            {checkin?.completed_today ?? "?"}
          </Text>
        </Box>
        <VStack className="w-[250px]">
          <Text className="text-typography-900 font-roboto line-clamp-1">
            {title}
          </Text>
          <ItemDescription checkin={checkin} />
        </VStack>
        <Button
          isDisabled={checkin !== undefined}
          variant="link"
          onPress={() => {
            markComplete(user, title).then(() => reloadTodaysCheckins(user));
          }}
        >
          <Icon as={icon} size="xl" />
        </Button>
      </HStack>
    </HStack>
  );
}

function YogaList({ practices }: PracticesProp) {
  const checkins = useCheckinsState();
  const { signOut, session } = useSession();
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <FlatList
        data={[...practices.keys()]}
        renderItem={({ item }) => (
          <Item
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

export default function Index() {
  const { session } = useSession();
  reloadTodaysCheckins(session!!);

  const practices = usePracticesState();
  if (practices.promised) {
    return <Spinner size="small" />;
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Heading>Hello, {session}</Heading>
      <YogaList practices={practices.value} />
    </SafeAreaView>
  );
}
