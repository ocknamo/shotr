# Shotr

Shorted URL service powered by nostr.

Service to create shortened URLs using NIP-5. The operation is completed by a front-end application with some Nostr relays.

The person creating the shortened URL needs NIP-5, but the person using the URL does not need anything.

## Shorted URL Structure

`<service baseurl>#<NIP-5 name>@<NIP-5 domain>/<tag key>/<tag value(content id)>`

Sample: `https://shotr.pages.dev/#ocknamo@ocknamo.com/s/63242`

## Application Event Structure

Save long url as Nostr Event.

```json
{
  "kind": 30078,
  "created_at": <number>,
  "tags": [
    [
      "<tag eg. 's'>",
      "<random content id>"
    ]
  ],
  "content": <your long url>,
  "pubkey": "<your Nostr public key set as NIP-5>"
}
```

## Event Filter

```json
{
  kinds: [30078],
  authors: [<your Nostr public key set as NIP-5>],
  [`#${tagKey}`]: [<content id>],
}
```

## Sequence

TBD

## Install

`yarn`

## Test

`yarn dev`
