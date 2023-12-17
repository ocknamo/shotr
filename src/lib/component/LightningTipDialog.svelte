<script lang="ts">
  import Dialog, { Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import QrCode from 'svelte-qrcode';

  export let canceled = false;
  export let nip5Name: string | null = null;
  export let nip5: string | null = null;
  export let lightningAddressUrl: string | null = null;

  $: lightningAddress = lightningAddressUrl
    ? lightningAddressUrl.replace('lnurlp://', '')
    : '';
</script>

<Dialog
  open
  scrimClickAction=""
  escapeKeyAction=""
  aria-labelledby="redirect notify"
  aria-describedby="Which URLs to redirect to. Information about who created the URL."
>
  <Content id="redirect-to">
    <!-- XXXX: Depending on the environment, 'lnurlp://' could not be used. Fix me if you can. e.g. Pixel 6 -->
    <QrCode value={'lightning://' + lightningAddress}></QrCode>

    <p class="redirect-url">
      <span style="font-weight: 600">Tip to: </span>{lightningAddress ?? '???'}
    </p>
    <span style="font-weight: 600">Who made this link? :</span>
    <br />
    →
    <a
      href={`https://nostter.app/${nip5Name}@${nip5}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {nip5Name ?? ''}@{nip5 ?? '???'}
    </a>
  </Content>
  <div style="display: flex; justify-content: center"></div>
  <Actions>
    <a href={lightningAddressUrl} target="_blank" rel="noopener noreferrer">
      <Button style="background-color:orange;margin-right:1em;min-width:80px">
        <Label>⚡Tip!</Label>
      </Button>
    </a>
    <Button on:click={() => (canceled = true)}>
      <Label>Cancel</Label>
    </Button>
  </Actions>
</Dialog>

<style>
  .redirect-url {
    overflow-wrap: break-word;
  }
</style>
