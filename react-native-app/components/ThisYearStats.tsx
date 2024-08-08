import { UserProp } from "@/components/PastWeekStats";
import { Card } from "@/components/ui/card";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { API_URL } from "@/constants";
import { useHookstate } from "@hookstate/core";
import getYear from "date-fns/getYear";
import { PracticesProp } from "./PracticeList";

type YearStats = { string: number };

export function ThisYearStats({ user, practices }: UserProp & PracticesProp) {
  const year = getYear(new Date());
  const stats = useHookstate<YearStats>(() =>
    fetch(`${API_URL}/stats/${user}/${year}`).then(
      (r) => r.json() as Promise<YearStats>,
    ),
  );

  if (stats.promised) {
    return <Spinner size="small" />;
  }

  return (
    <Card size="md" variant="outline" className="m-3">
      <Heading>This Year</Heading>
      <HStack className="w-full">
        <VStack className="p-3">
          <Center>
            <Heading size="4xl">
              {Object.values(stats.value).reduce((acc, val) => acc + val, 0)}
            </Heading>
            <Heading size="2xl">Practices</Heading>
          </Center>
        </VStack>
        <VStack className="p-3">
          <Heading size="4xl">
            {Object.entries(stats.value).reduce(
              (acc, val) => acc + practices.get(val[0])! * val[1],
              0,
            )}
          </Heading>
          <Heading size="2xl">Minutes</Heading>
        </VStack>
      </HStack>
    </Card>
  );
}
