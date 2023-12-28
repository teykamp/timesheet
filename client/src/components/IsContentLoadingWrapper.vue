<template>
  <div>
    <slot 
      v-if="props.displayCondition"
      name="loadedContent"  
    >

    </slot>
    <slot 
      v-else
      name="loadingContent"
    >
      <div 
        style="height: 500px; width: 100%"
        class="d-flex align-center justify-center"
      >
        <v-progress-circular 
          indeterminate 
          :size="57"
        ></v-progress-circular>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  displayCondition: boolean,
}>()
</script>