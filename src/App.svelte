<script lang="ts">
  import Button from "@smui/button";
  import Textfield from "@smui/textfield";
  import Card from "@smui/card";
  import Fab, { Icon, Label } from "@smui/fab";
  import {
    SimplePool,
    type Event,
    type UnsignedEvent,
  } from "nostr-tools";
  import { onMount } from 'svelte';
  import { getRandomBase64Url } from './lib/randomBase64Url';

  // nip07 types
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
      signEvent: (event: UnsignedEvent) => Promise<Event>;
    };
  }

  // constants
  const tagKey: string = 's';
  const appKind: number = 30078

  // form value
  let nip5 = null;
  let nip5Name = null;
  let inputUrl = null;

  // interaction state
  $: disabled = !nip5 || !nip5Name || !inputUrl;
  let disabledInput = false;

  // result initial value
  let result = "...waiting your input";

  // Setup relay
  const pool = new SimplePool();
  let relays = [
    "wss://relay.damus.io",
    "wss://relay-jp.nostr.wirednet.jp",
    "wss://nos.lol",
    "wss://yabu.me",
  ];

  onMount(async () => {
    const hash = window.location.hash;
    console.info(hash)
    if(!hash) {
      setTimeout(() => {
        if(!(window as Window).nostr) {
          result = 'Set NIP-7 please!!!'
        }
      }, 3000);
      return;
    }

    result = 'Redirecting...';
    disabledInput = true;

    // parse
    const splitted = hash.replace('#', '').split('/');
    const nameAndNip5 = splitted[0].split('@');
    nip5Name = nameAndNip5[0];
    nip5 = nameAndNip5[1];
    const tag = splitted[1];
    const contentId = splitted[2];

    if(!nip5 || !tag || !contentId) {
      result = 'Something wrong. I see this is invalid url.'
      throw new Error(result);
    }

    // fetch nip5 pub
    const nip5Json: {names: {[key: string]: string}} = await (await fetch(`https://${nip5}/.well-known/nostr.json`)).json();
    const yourPubKey = nip5Json['names'][nip5Name];
    console.info(`pubkey: ${yourPubKey}`);

    // fetch event.
    const sub = pool.sub(relays, [
      {
        kinds: [appKind],
        authors: [yourPubKey],
        [`#${tagKey}` as any]: [contentId],
      },
    ]);

    sub.on("event", (event) => {
      const redirectUrl = event.content;

      console.info(`redirect URL: ${redirectUrl}`);
      window.location.href = redirectUrl;
      sub.close();
      pool.close(relays);
    });

  });

  async function onclick() {
    if(!(window as Window).nostr) {
      result = 'Set NIP-7 please!!!'
      throw new Error(result);
    }

    // Generate key
    const pk = await (window as Window).nostr.getPublicKey()

    // Generate content id as random value
    const contentId = getRandomBase64Url(3);
    console.log(`ContentID: ${contentId}`);

    // TODO: check content id duplication

    /**
     * Prepare event.
     */
    const unsignedEvent: UnsignedEvent = {
      kind: appKind,
      created_at: Math.floor(Date.now() / 1000),
      tags: [[tagKey, contentId]],
      content: inputUrl,
      pubkey: pk,
    };

    const event = await (window as Window).nostr.signEvent(unsignedEvent)
    pool.publish(relays, event);

    const baseUrl = window.location.href
    result = `${baseUrl}#${nip5Name}@${nip5}/${tagKey}/${contentId}`;

    // cooling time
    // FIXME: We can request when update input.
    setTimeout(() => {
      disabled = false;
      pool.close(relays);
    }, 5000);
  }
</script>

<link
  href="https://fonts.googleapis.com/css2?family=Material+Icons&Roboto+Mono:ital@0;1&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
  rel="stylesheet"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/svelte-material-ui@6.0.0/bare.min.css"
/>
<main>
  <Fab extended style="height: 40px;font-size: 0.8em;width: auto;">
    <Icon class="material-icons" style="margin-right: 4px;">link</Icon>
    <Label
      >NIP-5 Short URL</Label
    >
  </Fab>
  <div class="top-space" />
  <div class="input-flex-container">
    <div class="card-container message"><Card padded>{result}</Card></div>
  </div>

  <!-- NIP-5 input -->
  <div class="input-flex-container">
    <div class="text-input-container">
      <Textfield
        type="text"
        variant="outlined"
        bind:value={nip5}
        label="Your NIP-5 domain"
        class="text-input"
        disabled={disabledInput}
      />
    </div>
  </div>

    <!-- NIP-5 name input -->
  <div class="input-flex-container">
    <div class="text-input-container">
      <Textfield
        type="text"
        variant="outlined"
        bind:value={nip5Name}
        label='Your NIP-5 "name"'
        class="text-input"
        disabled={disabledInput}
      />
    </div>
  </div>

  <div class="input-flex-container">
    <div class="text-input-container">
      <Textfield
        type="text"
        variant="outlined"
        bind:value={inputUrl}
        label="Input your long url"
        class="text-input"
        disabled={disabledInput}
      />
    </div>
  </div>

  <Button variant="raised" on:click={onclick} {disabled}>Submit</Button>
  <p>
   NIP-5:{nip5 ?? " ???"}
  </p>
  <div class="footer">
    <a href="https://github.com/ocknamo/shotr/issues" target="_blank" rel="noopener noreferrer"><p>Report</p></a>
    <a href="https://github.com/ocknamo/shotr" target="_blank" rel="noopener noreferrer">
      <img width="50em" src="src/assets/github-mark.svg" alt="github"/>
    </a>
  </div>
</main>

<style>
  .top-space {
    margin-top: 8em;
  }
  @media screen and (max-height: 740px) {
    .top-space {
      margin-top: 2em;
    }
  }
  .card-container {
    margin: 4em;
    width: 100%;
    min-width: 200px;
    max-width: 600px;
    color: rgba(0, 0, 0, 0.5);
  }
  .input-flex-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    overflow-wrap: break-word;
  }
  .text-input-container {
    margin: 0.5em;
    max-width: fit-content;
    min-width: 200px;
  }
  .message {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
  .footer {
    position: absolute;
    bottom: 1em;
    right: 1em;
    display: flex;
    justify-content: end;
    vertical-align: bottom;
    width: 100%;
  }
  .footer a {
    margin-left: 1em;
  }
</style>
