import { injectGlobal } from "@emotion/css";

import { kebabCaseToCamel } from "utils/text";
import type { KebabToCamelCase, RemovePrefix } from "utils/type";

export const darkThemeCssSelectors =
  'html[data-theme="dark"],html.dark-theme,body.dark-theme,html.theme-dark,body.theme-dark';

export const isDarkThemeEnabled = (): boolean => {
  return (
    document.documentElement.getAttribute("data-theme") === "dark" ||
    ["dark-theme", "theme-dark"].some(
      (className) =>
        document.documentElement.classList.contains(className) ||
        document.body.classList.contains(className),
    )
  );
};

export function getCssVarNames<
  T extends Record<string, unknown>,
  Prefix extends string = "--vis-",
>(
  cssVarsObject: T,
  prefix?: Prefix,
): {
  [Property in Extract<keyof T, string> as KebabToCamelCase<
    RemovePrefix<Property, Prefix>
  >]: Property;
} {
  const defaultPrefix = "--vis-";
  const entries = Object.entries(cssVarsObject);
  return Object.fromEntries(
    entries.map(([key]) => [
      kebabCaseToCamel(key.replace(prefix ?? defaultPrefix, "")),
      key,
    ]),
  ) as {
    [Property in Extract<keyof T, string> as KebabToCamelCase<
      RemovePrefix<Property, Prefix>
    >]: Property;
  };
}

export function injectGlobalCssVariables<
  T extends Record<string, string | number | undefined>,
>(cssVarsObject: T, componentRootClassName: string): void {
  injectGlobal({
    ":root": cssVarsObject,
    [`${darkThemeCssSelectors} .${componentRootClassName}`]: Object.keys(
      cssVarsObject,
    )
      .filter((key) => key.includes("--vis-dark"))
      .map((key) => ({
        [key.replace("--vis-dark", "--vis")]: `var(${key})`,
      })),
  });
}

export function cssvar<T extends string>(name: T): `var(${T})` {
  return `var(${name})` as `var(${T})`;
}
