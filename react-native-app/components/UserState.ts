import { LocalStored, localstored } from "@hookstate/localstored";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  hookstate,
  useHookstate,
  extend,
  InferStateExtensionType,
  State,
} from "@hookstate/core";
import { Subscribable, subscribable } from "@hookstate/subscribable";
import { Identifiable, identifiable } from "@hookstate/identifiable";

function extensions<S, E>(key: string) {
  return extend<S, E, Identifiable, Subscribable, LocalStored>(
    localstored({
      engine: {
        getItem: (key) => AsyncStorage.getItem(key),
        setItem: (key, val) => AsyncStorage.setItem(key, val),
        removeItem: (key) => AsyncStorage.removeItem(key),
      },
    }),
    subscribable(),
    identifiable(key),
  );
}

type Extended = InferStateExtensionType<typeof extensions>;

const state = hookstate<string | null, Extended>(null, extensions("user"));

export function useUserState(): State<string | null, Extended> {
  return useHookstate(state);
}
