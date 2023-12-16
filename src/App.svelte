<script lang="ts">
  import Button from '@smui/button';
  import IconButton from '@smui/icon-button';
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import Card from '@smui/card';
  import Fab, { Icon, Label } from '@smui/fab';
  import { SimplePool, type Event, type UnsignedEvent } from 'nostr-tools';
  import { onMount } from 'svelte';
  import { detectUniqContentId } from './lib/detect-uniq-content-id';
  import githubLogo from './lib/github-mark.svg';
  import { name } from '../package.json';
  import { isValidUrl } from './lib/isValidUrl';
  import { fetchNip5json } from './lib/fetchNip5json';
  import RedirectingDialog from './lib/component/RedirectingDialog.svelte';
  import { sleep } from './lib/sleep';

  // nip07 types
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
      signEvent: (event: UnsignedEvent) => Promise<Event>;
    };
  }

  // constants
  const tagKey: string = 's';
  const appKind: number = 30078;
  const dTag = 'd';
  const appName = name;
  const baseUrl = window.location.origin;

  // form value
  let nip5: string | null = null;
  let nip5Name: string | null = null;
  let inputUrl: string | null = null;
  let isMobile = false;

  // interaction state
  $: disabled = !nip5 || !nip5Name || !inputUrl;
  let disabledInput = false;
  $: showCopyButton =
    !!window.navigator.clipboard.writeText && isValidUrl(result);
  let redirect = false;
  let redirectCancel = false;

  // result initial value
  let result = '...waiting your input';

  // Setup relay
  const pool = new SimplePool();

  // TODO: Add relay from NIP-07
  let relays = [
    'wss://relay.damus.io',
    'wss://relay-jp.nostr.wirednet.jp',
    'wss://nos.lol',
    'wss://yabu.me',
    'wss://relay.snort.social',
  ];

  onMount(async () => {
    isMobile = document.body.clientWidth <= 1024;
    const hash = window.location.hash;
    console.info(hash);
    if (!hash) {
      setTimeout(() => {
        if (!(window as Window).nostr) {
          result = 'Set NIP-7 please!';
        }
      }, 3000);
      return;
    }

    // parse
    const splitted = hash.replace('#', '').split('/');
    const nameAndNip5 = splitted[0].split('@');
    nip5Name = nameAndNip5[0];
    nip5 = nameAndNip5[1];
    const tag = splitted[1];
    const contentId = splitted[2];

    if (!nip5 || !tag || !contentId) {
      result = 'Something wrong. I see this is invalid url.';
      throw new Error(result);
    }

    result = 'Redirecting...';
    redirect = true;
    disabledInput = true;

    // Validation
    // fetch nip5 pub
    const nip5Json = await fetchNip5json(nip5);
    if (!nip5Json || !nip5Json['names']) {
      alert(`NIP-5: ${nip5}\nNIP5 not found. \nNIP-5がありません`);
      reset();

      return;
    }
    const yourPubKey = nip5Json['names'][nip5Name];
    // eg. http://localhost:5173/#ocknam@ocknamo.com/s/coY
    if (!yourPubKey) {
      alert(
        `name: ${nip5Name}\nPublic key not found. \n有効な公開鍵がありません`,
      );
      reset();

      return;
    }
    console.info(`pubkey: ${yourPubKey}`);

    // fetch event.
    const sub = pool.sub(relays, [
      {
        kinds: [appKind],
        authors: [yourPubKey],
        [`#${tagKey}` as any]: [contentId],
      },
    ]);

    sub.on('event', async (event) => {
      const redirectUrl = event.content;
      inputUrl = redirectUrl;

      console.info(`redirect URL: ${redirectUrl}`);

      // Wait cancel action.
      await sleep(3000);

      if (redirectCancel) {
        reset();
        sub.close();
        pool.close(relays);

        return;
      }
      window.location.href = redirectUrl;
      sub.close();
      pool.close(relays);
    });
  });

  async function onclick() {
    if (!(window as Window).nostr) {
      result = 'Set NIP-7 please!!!';
      throw new Error(result);
    }
    disabled = true;

    // Generate key
    const pk = await (window as Window).nostr?.getPublicKey();
    if (!pk) {
      throw new Error('Invalid publickey');
    }

    // Validation
    if (!nip5 || !nip5Name || !inputUrl) {
      return;
    }
    // fetch nip5 pub
    const nip5Json = await fetchNip5json(nip5, nip5Name);
    if (!nip5Json || !nip5Json['names'] || !nip5Json['names'][nip5Name]) {
      alert(`NIP-5: ${nip5}\nNIP5 not found. \nNIP-5がありません`);
      reset();

      return;
    }
    const yourPubKey = nip5Json['names'][nip5Name];
    // eg. http://localhost:5173/#ocknam@ocknamo.com/s/coY
    if (!yourPubKey) {
      alert(
        `name: ${nip5Name}\nPublic key not found. \n有効な公開鍵がありません`,
      );
      reset();

      return;
    }

    if (yourPubKey !== pk) {
      alert(
        `name: ${nip5Name}\nThe public key is different from NIP-7.. \n公開鍵がNIP-7と異なります`,
      );
      reset();

      return;
    }

    // Generate content id as random value
    // check content id duplication
    const contentId = await detectUniqContentId(3, {
      pool,
      relays,
      appKind,
      yourPubkey: pk,
      tagKey,
      timeoutSec: 3,
    });
    console.log(`ContentID: ${contentId}`);

    /**
     * Prepare event.
     */
    const unsignedEvent: UnsignedEvent = {
      kind: appKind,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        [tagKey, contentId],
        [dTag, appName],
      ],
      content: inputUrl!,
      pubkey: pk ?? '',
    };

    const event = await (window as Window).nostr?.signEvent(unsignedEvent);
    pool.publish(relays, event!);

    // TODO: Convert safety NIP-05 name and nip5 domain. eg. `/`, `@` value are not safety.
    result = `${baseUrl}#${nip5Name}@${nip5}/${tagKey}/${contentId}`;

    // cooling time
    setTimeout(() => {
      pool.close(relays);
    }, 5000);
  }

  function clickTitle() {
    window.location.href = baseUrl;
  }

  async function copyUrl() {
    window.navigator.clipboard.writeText(result);
  }

  function reset() {
    window.history.pushState('', 'top page', baseUrl);
    disabledInput = false;
    redirect = false;
    redirectCancel = false;
    result = '...waiting your input';
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
  <div class="head-space" />
  <Fab extended class="fab-title" on:click={clickTitle}>
    <Icon class="material-icons" style="margin-right: 4px;">link</Icon>
    <Label>{appName}</Label>
  </Fab>
  <p class="app-description">Shorted URL generator by NIP-05</p>
  <div class="top-space" />
  <div class="input-flex-container">
    <div class="card-container">
      <Card padded class="card-message">{result}</Card>
      {#if showCopyButton}
        <IconButton
          class="material-icons"
          style="margin-left: 0.4em;color:rgb(1, 135, 134)"
          on:click={copyUrl}>content_copy</IconButton
        >
      {/if}
    </div>
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
      >
        <HelperText persistent slot="helper"
          >example: "iris.to", "getalby.com"</HelperText
        >
      </Textfield>
    </div>
  </div>

  <!-- NIP-5 name input -->
  <div class="input-flex-container">
    <div class="text-input-container">
      <Textfield
        type="text"
        variant="outlined"
        bind:value={nip5Name}
        label="Your NIP-5 'name'"
        placeholder="hogehoge"
        class="text-input"
        disabled={disabledInput}
      >
        <HelperText persistent slot="helper">example: "ocknamo", "_"</HelperText
        >
      </Textfield>
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
      >
        <HelperText persistent slot="helper"
          >example: "https://xxxxxxx"</HelperText
        >
      </Textfield>
    </div>
  </div>

  <Button style="margin:8px;" variant="raised" on:click={onclick} {disabled}
    >Submit</Button
  >
  <p class="nip-05">
    NIP-5:{nip5 ?? ' ???'}
  </p>
  <div class="footer">
    {#if isMobile}
      <a
        href="lnurlp://s14pes@getalby.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p>Tip</p>
      </a>
    {/if}
    {#if !isMobile}
      <a
        href="https://github.com/ocknamo/shotr/issues"
        target="_blank"
        rel="noopener noreferrer"><p>Report</p></a
      >
    {/if}
    <a
      href="https://github.com/ocknamo/shotr"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img class="github-link" width="50em" src={githubLogo} alt="github" />
    </a>
  </div>

  {#if redirect}
    <RedirectingDialog
      bind:canceled={redirectCancel}
      bind:nip5
      bind:nip5Name
      bind:redirectUrl={inputUrl}
    ></RedirectingDialog>
  {/if}
</main>

<style>
  .head-space {
    margin-top: 6em;
  }
  .top-space {
    margin-top: 4em;
  }
  @media screen and (max-height: 740px) {
    .top-space {
      margin-top: 0.5em;
    }
    .head-space {
      margin-top: 0em;
    }
  }
  .card-container {
    margin: 4em;
    width: 100%;
    min-width: 200px;
    max-width: 300px;
    color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
  }
  .input-flex-container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    overflow-wrap: break-word;
  }
  .app-description {
    color: rgba(0, 0, 0, 0.8);
    font-size: 1.2em;
    font-family: "'Times New Roman', Times, serif";
    margin: 0.8em 0 0 0;
  }
  .text-input-container {
    margin: 0.5em;
    max-width: fit-content;
    min-width: 300px;
  }
  .nip-05 {
    color: black;
  }
  .footer {
    position: absolute;
    bottom: 1em;
    right: 1em;
    display: flex;
    justify-content: end;
    vertical-align: bottom;
    width: 100%;
    align-items: center;

    @media screen and (max-height: 700px) {
      bottom: 0.2em;
      right: 0.5em;
      margin-bottom: -10px;
    }
  }
  .footer a {
    margin-left: 1em;
  }
  .github-link {
    width: 40px;
    @media screen and (max-height: 700px) {
      width: 20px;
    }
  }
</style>
