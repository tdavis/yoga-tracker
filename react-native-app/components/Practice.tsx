import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { AddIcon, CheckIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Checkin, markComplete } from "@/hooks/useCheckinsState";
import TimeAgo from "@andordavoti/react-native-timeago";
import { cn } from "@gluestack-ui/nativewind-utils/cn";

type ItemProps = { user: string; title: string; checkin: Checkin | undefined };

function PracticeDescription({ checkin }: { checkin: Checkin | undefined }) {
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

export function Practice({ user, title, checkin }: ItemProps) {
  const completedToday = checkin?.completed_today ?? 0;

  let icon;
  if (checkin === undefined) {
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
          <PracticeDescription checkin={checkin} />
        </VStack>
        <Button
          isDisabled={checkin !== undefined}
          variant="link"
          onPress={() => markComplete(user, title)}
        >
          <Icon as={icon} size="xl" />
        </Button>
      </HStack>
    </HStack>
  );
}
