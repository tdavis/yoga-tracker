import {
  Checkin,
  localhost,
  reloadTodaysCheckins,
  useCheckinsState,
} from "@/components/CheckinsState";
import { Practices, usePracticesState } from "@/components/PracticesState";
import { useSession } from "@/components/ctx";
import { Card } from "@/components/ui/card";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableData,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VStack } from "@/components/ui/vstack";
import { ImmutableArray, useHookstate } from "@hookstate/core";
import format from "date-fns/format";
import getYear from "date-fns/getYear";
import subDays from "date-fns/subDays";
import { ScrollView } from "react-native";

type UserProp = {
  user: string;
};

type PracticesProp = {
  practices: Practices;
};

function Today({ practices }: PracticesProp) {
  const checkins = useCheckinsState();

  const minutes = checkins.value.reduce(
    (acc, val) => acc + practices.get(val.meditation)!!,
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

async function getWeekOfStats(user: string): Promise<Map<Date, Checkin[]>> {
  const now = new Date();
  const range = [...Array(7).keys()];
  const promises = range.map(async (idx) => {
    const date = subDays(now, idx + 1);
    const formatted = format(date, "yyyy-MM-dd");
    const response = await fetch(
      `http://${localhost}/checkins/${user}/${formatted}`,
    );
    return response.json().then((body) => [date, body]);
  });
  const all = await Promise.all(promises);
  return all.reduce(
    (acc, val) => acc.set(val[0], val[1]),
    new Map<Date, Checkin[]>(),
  );
}

function PastWeek({ user, practices }: UserProp & PracticesProp) {
  const stats = useHookstate(() => getWeekOfStats(user));

  if (stats.promised) {
    return <Spinner size="small" />;
  }

  const sumMinutes = (checkins: ImmutableArray<Checkin>) =>
    checkins
      .map((c) => practices.get(c.meditation)!!)
      .reduce((acc, val) => acc + val, 0);
  const allCheckins = [...stats.value.values()].flat();

  const rows = [...stats.value.entries()].map(([date, checkins]) => (
    <TableRow key={date.toISOString()}>
      <TableData>{format(date, "E")}</TableData>
      <TableData>{checkins.length}</TableData>
      <TableData>{sumMinutes(checkins)}</TableData>
    </TableRow>
  ));

  return (
    <Card size="md" variant="outline" className="m-3">
      <Heading>Past Week</Heading>
      <Table className="w-full mt-3">
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Num</TableHead>
            <TableHead>Mins</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{rows}</TableBody>
        <TableFooter>
          <TableRow>
            <TableHead>Total</TableHead>
            <TableHead>{allCheckins.length}</TableHead>
            <TableHead>{sumMinutes(allCheckins)}</TableHead>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  );
}

type YearStats = { string: number };

function ThisYear({ user, practices }: UserProp & PracticesProp) {
  const year = getYear(new Date());
  const stats = useHookstate<YearStats>(() =>
    fetch(`http://${localhost}/stats/${user}/${year}`).then(
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
              (acc, val) => acc + practices.get(val[0])!! * val[1],
              0,
            )}
          </Heading>
          <Heading size="2xl">Minutes</Heading>
        </VStack>
      </HStack>
    </Card>
  );
}

export default function Stats() {
  const { session } = useSession();
  const user = session!!;
  reloadTodaysCheckins(user);

  const practices = usePracticesState();
  if (practices.promised) {
    return <Spinner size="small" />;
  }

  return (
    <SafeAreaView className="flex-1 items-center">
      <ScrollView>
        <Today practices={practices.value} />
        <PastWeek user={user} practices={practices.value} />
        <ThisYear user={user} practices={practices.value} />
      </ScrollView>
    </SafeAreaView>
  );
}
