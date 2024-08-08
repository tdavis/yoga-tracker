import { API_URL } from "@/constants";
import { State, hookstate, useHookstate } from "@hookstate/core";

export type Practice = {
  name: string;
  minutes: number;
};

export type Practices = ReadonlyMap<string, number>;

const state = hookstate<Practices>(() =>
  fetch(`${API_URL}/practices`)
    .then((r) => r.json() as Promise<Practice[]>)
    .then((practices) =>
      practices.reduce(
        (acc, val) => acc.set(val.name, val.minutes),
        new Map<string, number>(),
      ),
    ),
);

export function usePracticesState(): State<Practices> {
  return useHookstate(state);
}
