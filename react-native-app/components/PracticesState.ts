import { State, hookstate, useHookstate } from "@hookstate/core";
import { localhost } from "./CheckinsState";

export type Practice = {
    name: string;
    minutes: number;
};

export type Practices = ReadonlyMap<String, number>;

const state = hookstate<Practices>(() =>
    fetch(`http://${localhost}/practices`)
        .then((r) => r.json() as Promise<Practice[]>)
        .then((practices) =>
            practices.reduce(
                (acc, val) => acc.set(val.name, val.minutes),
                new Map<String, number>(),
            ),
        ),
);

export function usePracticesState(): State<Practices> {
    return useHookstate(state);
}
