import {
  Checkin,
  fetchCheckins,
  markComplete,
  useTasksState,
} from "@/components/CheckinsState";
import { useUserState } from "@/components/UserState";
import { useHookstate } from "@hookstate/core";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import {
  Button,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import ReactTimeAgo from "react-time-ago";
import { Yoga } from "../constants/yoga";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ItemProps = { user: string; title: string; checkin: Checkin | undefined };

TimeAgo.addDefaultLocale(en);

function Item({ user, title, checkin }: ItemProps) {
  const checkins = useTasksState();

  if (checkin == undefined) {
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
        <Button
          title="Mark Complete"
          onPress={() => {
            markComplete(user, title)
              .catch((e) => console.log(e))
              .then(() => fetchCheckins(user).then((r) => checkins.set(r)));
          }}
        />
      </View>
    );
  } else {
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
        <div>
          Completed <ReactTimeAgo date={checkin.completed_at} locale="en-US" />
          <Text> | Practiced {checkin.completed_today} time(s) today</Text>
        </div>
      </View>
    );
  }
}

function Login() {
  const name = useHookstate("");
  const user = useUserState();
  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="Name"
        maxLength={20}
        onChangeText={(v) => name.set(v)}
      />
      <Button title="Login" onPress={() => user.set(name.value)} />
    </SafeAreaView>
  );
}

export default function Index() {
  const user = useUserState();
  const checkins = useTasksState();

  user.subscribe((v) => fetchCheckins(v!!).then((r) => checkins.set(r)));

  if (user.ornull) {
    return (
      <SafeAreaView style={styles.container}>
        <Button title="Reset" onPress={() => checkins.set([])} />
        <Button title="Logout" onPress={() => AsyncStorage.clear()} />
        <FlatList
          data={Yoga}
          renderItem={({ item }) => (
            <Item
              title={item.title}
              checkin={checkins.value.find((c) => c.meditation == item.title)}
              user={user.value!!}
            />
          )}
          keyExtractor={(item) => item.title}
        />
      </SafeAreaView>
    );
  } else {
    return <Login />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    backgroundColor: "#b37535",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 32,
  },
});
