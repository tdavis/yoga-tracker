import { useSession } from "@/components/auth";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { SafeAreaView } from "@/components/ui/safe-area-view";
import { useHookstate } from "@hookstate/core";
import { router } from "expo-router";

export default function Login() {
  const { signIn } = useSession();
  const name = useHookstate("");
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Heading className="m-3">Welcome to Yoga Tracker!</Heading>
      <HStack space="md">
        <Input
          variant="outline"
          size="lg"
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
          disabled={name.value.length === 0}
          onPress={() => {
            signIn(name.value);
            router.replace("/");
          }}
        >
          <ButtonText>Start Tracking!</ButtonText>
        </Button>
      </HStack>
    </SafeAreaView>
  );
}
