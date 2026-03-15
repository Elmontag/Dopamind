/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/achievements` | `/(tabs)/planner` | `/(tabs)/settings` | `/(tabs)/tasks` | `/_sitemap` | `/achievements` | `/planner` | `/settings` | `/tasks`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
