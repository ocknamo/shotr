export async function fetchNip5json(
  nip5: string,
  nip5Name,
): Promise<{ names: { [key: string]: string } } | null> {
  try {
    return await (
      await fetch(`https://${nip5}/.well-known/nostr.json?name=${nip5Name}`)
    ).json();
  } catch (error) {
    console.warn(error);

    return null;
  }
}
