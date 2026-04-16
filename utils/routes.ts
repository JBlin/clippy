import type { Href } from 'expo-router';

export type RouteParamValue = string | string[] | undefined;

export function getSingleParam(value: RouteParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

export function getLinkDetailRoute(id: string): Href {
  return {
    pathname: '/link/[id]',
    params: { id },
  };
}

export function getLinkEditRoute(id: string): Href {
  return {
    pathname: '/link/edit/[id]',
    params: { id },
  };
}
