<script>
    /** @type {string} */
    export let title = '';
</script>

<section>
    {#if title}
        <div class="text-xs pl-2 pt-2 pb-1 sticky top-0 uppercase text-neutral-400 dark:bg-neutral-800">
            {title}
        </div>
    {/if}
    <div class="flex pl-2 flex-col gap-1">
        <slot></slot>
    </div>
</section>
