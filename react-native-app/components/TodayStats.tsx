import { Card } from "@/components/ui/card";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { API_URL } from "@/constants";
import { useCheckinsState } from "@/hooks/useCheckinsState";
import { useHookstate } from "@hookstate/core";
import format from "date-fns/format";
import { PracticesProp } from "./PracticeList";
import { Spinner } from "./ui/spinner";

export function TodayStats({ practices }: PracticesProp) {
  const now = new Date();
  const formatted = format(now, "yyyy-MM-dd");
  const checkins = useCheckinsState();
  const users = useHookstate(() =>
    fetch(`${API_URL}/users/${formatted}`).then((r) => r.json()),
  );

  if (users.promised) {
    return <Spinner size="small" />;
  }

  const minutes = checkins.value.reduce(
    (acc, val) => acc + practices.get(val.meditation)!,
    0,
  );

  return (
    <Card size="md" variant="outline" className="m-3">
      <Heading>Today</Heading>
      <HStack className="w-full">
        <VStack className="p-3">
          <Center>
            <Heading size="4xl">{users.value}</Heading>
            <Heading size="2xl">Users</Heading>
          </Center>
        </VStack>
        <VStack className="p-3">
          <Center>
            <Heading size="4xl">{checkins.value.length}</Heading>
            <Heading size="2xl">Practices</Heading>
          </Center>
        </VStack>
        <VStack className="p-3">
          <Heading size="4xl">{minutes}</Heading>
          <Heading size="2xl">Minutes</Heading>
        </VStack>
      </HStack>
    </Card>
  );
}
