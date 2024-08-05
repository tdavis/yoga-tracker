import { PracticesProp } from "@/components/PracticeList";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
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
import { Checkin, localhost } from "@/hooks/useCheckinsState";
import { ImmutableArray, useHookstate } from "@hookstate/core";
import format from "date-fns/format";
import subDays from "date-fns/subDays";

export type UserProp = {
  user: string;
};

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

export function PastWeekStats({ user, practices }: UserProp & PracticesProp) {
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
      <Heading>Previous Seven Days</Heading>
      <Table className="w-full mt-3">
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>#</TableHead>
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
