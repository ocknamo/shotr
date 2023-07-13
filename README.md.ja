# Shotr

<img src="/screen.png" />

[https://6or.cc](https://6or.cc/)

短縮URLサービス powered by nostr.

NIP-5を使って短縮URLを作成するサービス。フロントエンドのアプリケーションとNostrのリレーで動作します。

短縮URLを作成する人はNIP-5とNIP-07の設定が必要ですが、URLを使う人は何も必要ありません。

## Nostr

[Nostr](https://github.com/nostr-protocol/nostr)は、検閲に強いグローバルな "ソーシャル "ネットワークを作ることができる、最もシンプルなオープン・プロトコルです。

## NIP-05

[Nostrの鍵をDNSベースのインターネット識別子にマッピングする仕組みです。](https://github.com/nostr-protocol/nips/blob/master/05.md)

Shotrは、短縮URLを作成するユーザーの公開鍵を検出するためにNIP-05を使用します。

## Shorted URL Structure

`<service baseurl>#<NIP-05 name>@<NIP-05 domain>/<tag key>/<tag value(content id)>`

Sample: [`https://6or.cc/#ocknamo@ocknamo.com/s/15K`](https://6or.cc/#ocknamo@ocknamo.com/s/15K)

Original URL: `https://snort.social/e/nevent1qqs9sw5jd30j6eugqxjm3cuka5vhfa6ylg8qsngfwgyf5l0efdd6xpcpz4mhxue69uhhyetvv9ujuerpd46hxtnfduhszrnhwden5te0dehhxtnvdakz7n85nnt`

## Application Event Structure

長いURLを以下のようなNostrイベントとして保存します。

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

短縮URLを使用する方は、以下のフィルターを使用してリレーにリクエストを送ることで目的のURLを取得することができます。

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
