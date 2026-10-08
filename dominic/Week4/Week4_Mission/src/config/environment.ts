export function readPort(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined) return fallback;

  if (!/^\d+$/.test(value)) {
    throw new Error(`${name}는 1~65535 범위의 정수여야 합니다.`);
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name}는 1~65535 범위의 정수여야 합니다.`);
  }
  return port;
}
