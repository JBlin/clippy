export function parseTagInput(input: string) {
  return Array.from(
    new Set(
      input
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

export function stringifyTags(tags: string[]) {
  return tags.join(', ');
}
