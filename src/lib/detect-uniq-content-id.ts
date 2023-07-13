import {
  fetchApplicationEvent,
  type FetchConfig,
} from "./fetch-application-event";
import { getRandomBase64Url } from "./randomBase64Url";

export async function detectUniqContentId(
  digits: number,
  fetchConfig: FetchConfig,
): Promise<string> {
  const contentId = getRandomBase64Url(digits);

  // fetch id
  const event = await fetchApplicationEvent(contentId, fetchConfig);

  // Not uniq
  if (!!event) {
    return detectUniqContentId(digits, fetchConfig);
  }

  return contentId;
}
