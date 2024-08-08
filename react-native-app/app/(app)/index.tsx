import { useSession } from "@/components/auth";
import { PracticeList } from "@/components/PracticeList";
import { Heading } from "@/components/ui/heading";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { Spinner } from "@/components/ui/spinner";
import { reloadTodaysCheckins } from "@/hooks/useCheckinsState";
import { usePracticesState } from "@/hooks/usePracticesState";

export default function Index() {
  const { session } = useSession();

  reloadTodaysCheckins(session!);

  const practices = usePracticesState();
  if (practices.promised) {
    return <Spinner size="small" />;
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Heading className="m-3">Hello, {session}</Heading>
      <PracticeList practices={practices.value} />
    </SafeAreaView>
  );
}
