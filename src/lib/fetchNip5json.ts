export async function fetchNip5json(
  nip5: string,
): Promise<{ names: { [key: string]: string } } | null> {
  try {
    return await (await fetch(`https://${nip5}/.well-known/nostr.json`)).json();
  } catch (error) {
    console.warn(error);

    return null;
  }
}
