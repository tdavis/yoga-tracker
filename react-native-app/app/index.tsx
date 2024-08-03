import {
  Checkin,
  fetchCheckins,
  markComplete,
  useTasksState,
} from "@/components/CheckinsState";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useUserState } from "@/components/UserState";
import { cn } from "@gluestack-ui/nativewind-utils/cn";
import { useHookstate } from "@hookstate/core";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { FlatList } from "react-native";
import ReactTimeAgo from "react-time-ago";
import { Yoga } from "../constants/yoga";
import { Input, InputField } from "@/components/ui/input";

type ItemProps = { user: string; title: string; checkin: Checkin | undefined };

TimeAgo.addDefaultLocale(en);

function ItemDescription({ checkin }: { checkin: Checkin | undefined }) {
  if (checkin === undefined) {
    return <></>;
  } else {
    console.log("CA", checkin.completed_at, typeof checkin.completed_at);
    return (
      <Text className="text-sm font-roboto line-clamp-1">
        <ReactTimeAgo date={checkin.completed_at} locale="en-US" />
      </Text>
    );
  }
}

function Item({ user, title, checkin }: ItemProps) {
  const checkins = useTasksState();
  const completedToday = checkin?.completed_today ?? 0;
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
        <VStack>
          <Text className="text-typography-900 font-roboto line-clamp-1">
            {title}
          </Text>
          <ItemDescription checkin={checkin} />
        </VStack>
      </HStack>
      <Button
        isDisabled={checkin !== undefined}
        variant="outline"
        action="secondary"
        size="xs"
        onPress={() => {
          markComplete(user, title)
            .catch((e) => console.log(e))
            .then(() => fetchCheckins(user).then((r) => checkins.set(r)));
        }}
      >
        <ButtonText>Mark Complete</ButtonText>
      </Button>
    </HStack>
  );
}

function Login() {
  const name = useHookstate("");
  const user = useUserState();
  return (
    <SafeAreaView>
      <HStack space="md">
        <Input
          variant="outline"
          size="md"
          isDisabled={false}
          isInvalid={false}
          isReadOnly={false}
        >
          <InputField
            placeholder="Enter your name..."
            onChangeText={(v) => name.set(v)}
          />
        </Input>
        <Button
          action="primary"
          disabled={name.value.length == 0}
          onPress={() => user.set(name.value)}
        >
          <ButtonText>Login</ButtonText>
        </Button>
      </HStack>
    </SafeAreaView>
  );
}

function YogaList() {
  const checkins = useTasksState();
  const user = useUserState();

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <FlatList
        data={Yoga}
        renderItem={({ item }) => (
          <Item
            title={item.title}
            checkin={checkins.value.find((c) => c.meditation == item.title)}
            user={user.value!!}
          />
        )}
        keyExtractor={(item) => item.title}
      />
      <HStack space="md" className="gap-4 p-3">
        <Button size="md" onPress={() => checkins.set([])}>
          <ButtonText>Reset</ButtonText>{" "}
        </Button>
        <Button
          size="md"
          variant="outline"
          action="negative"
          onPress={() => user.set(null)}
        >
          <ButtonText>Logout</ButtonText>
        </Button>
      </HStack>
    </SafeAreaView>
  );
}

export default function Index() {
  const user = useUserState();
  const checkins = useTasksState();

  user.subscribe((v) => fetchCheckins(v!!).then((r) => checkins.set(r)));

  var child;
  if (user.value == null) {
    child = <Login />;
  } else {
    child = <YogaList />;
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      {child}
    </SafeAreaView>
  );
}
