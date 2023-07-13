# Shotr

<img src="/screen.png" />

[https://6or.cc](https://6or.cc/)

Shorted URL service powered by nostr.

Service to create shortened URLs using NIP-05. The operation is completed by a front-end application with some Nostr relays.

The person creating the shortened URL needs NIP-05 and NIP-07, but the person using the URL does not need anything.

## Nostr

[Nostr](https://github.com/nostr-protocol/nostr) is the simplest open protocol. that is able to create a censorship-resistant global "social" network once and for all.

## NIP-05

[Mapping Nostr keys to DNS-based internet identifiers](https://github.com/nostr-protocol/nips/blob/master/05.md).

Shotr use NIP-05 in order to detect public key of user creating shorted URL.

## Shorted URL Structure

`<service baseurl>#<NIP-05 name>@<NIP-05 domain>/<tag key>/<tag value(content id)>`

Sample: [`https://6or.cc/#ocknamo@ocknamo.com/s/15K`](https://6or.cc/#ocknamo@ocknamo.com/s/15K)

Original URL: `https://snort.social/e/nevent1qqs9sw5jd30j6eugqxjm3cuka5vhfa6ylg8qsngfwgyf5l0efdd6xpcpz4mhxue69uhhyetvv9ujuerpd46hxtnfduhszrnhwden5te0dehhxtnvdakz7n85nnt`

## Application Event Structure

Save long url as Nostr Event.

```json
{
  "kind": 30078,
  "created_at": <number>,
  "tags": [
    [
      "<tag eg. 's'>",
      "<duplicate checked random content_id>"
    ]
  ],
  "content": <your long url input>,
  "pubkey": "<your Nostr public key set as NIP-05>"
}
```

## Event Filter

Those who use shortened URLs should use the following filters.

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

## License

[MIT License](./LICENSE.md)
