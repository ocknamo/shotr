<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import CircularProgress from '@smui/circular-progress';

  export let canceled = false;
  export let nip5Name: string | null = null;
  export let nip5: string | null = null;
  export let redirectUrl: string | null = null;
</script>

<Dialog
  open
  scrimClickAction=""
  escapeKeyAction=""
  aria-labelledby="redirect notify"
  aria-describedby="Which URLs to redirect to. Information about who created the URL."
>
  <Title id="now-redirecting">Now Redirecting.</Title>
  <Content id="redirect-to"
    ><p class="redirect-url">
      <span style="font-weight: 600">Redirect to: </span>{redirectUrl ?? '???'}
    </p>
    <p>
      <span style="font-weight: 600">Who made this? :</span>
      {nip5Name ?? ''}@{nip5 ?? '???'}
    </p></Content
  >
  <div style="display: flex; justify-content: center">
    <CircularProgress
      class="my-four-colors"
      style="height: 32px; width: 32px;"
      indeterminate
      fourColor
    />
  </div>
  <Actions>
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
