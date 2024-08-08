import { useSession } from "@/components/auth";
import { PastWeekStats } from "@/components/PastWeekStats";
import { ThisYearStats } from "@/components/ThisYearStats";
import { TodayStats } from "@/components/TodayStats";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Spinner } from "@/components/ui/spinner";
import { reloadTodaysCheckins } from "@/hooks/useCheckinsState";
import { usePracticesState } from "@/hooks/usePracticesState";
import { ScrollView } from "react-native";

export default function Stats() {
  const { session } = useSession();
  const user = session!;
  reloadTodaysCheckins(user);

  const practices = usePracticesState();
  if (practices.promised) {
    return <Spinner size="small" />;
  }

  return (
    <SafeAreaView className="flex-1 items-center">
      <ScrollView>
        <TodayStats practices={practices.value} />
        <PastWeekStats user={user} practices={practices.value} />
        <ThisYearStats user={user} practices={practices.value} />
      </ScrollView>
    </SafeAreaView>
  );
}
