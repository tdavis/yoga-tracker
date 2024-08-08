import { useCheckinsState } from "@/hooks/useCheckinsState";
import { Card } from "@/components/ui/card";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { PracticesProp } from "./PracticeList";

export function TodayStats({ practices }: PracticesProp) {
  const checkins = useCheckinsState();

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
