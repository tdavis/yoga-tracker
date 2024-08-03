import { State, useHookstate } from "@hookstate/core";
import { Platform } from "react-native";

const localhost = Platform.OS === "web" ? "localhost:8080" : "10.0.2.2:8080";

export interface Checkin {
  id: number;
  user: string;
  meditation: string;
  completed_at: Date;
  completed_today: number;
}

export function fetchCheckins(user: string) {
  const resourcePath = `http://${localhost}/checkins/${user}`;
  console.log(resourcePath);
  return fetch(resourcePath).then((r) => {
    console.log("FETCH", r, "JSON", r.json());
    return r.json();
  });
}

export function markComplete(user: string, meditation: string) {
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_name: user, meditation }),
  };
  return fetch(`http://${localhost}/complete`, requestOptions).catch((e) =>
    console.log("EE", e),
  );
}

const state = useHookstate<Checkin[]>([]);

export function useTasksState(): State<Checkin[]> {
  return useHookstate(state);
}
