<template>

  Some text right there
  <br>
  {{some_number}}
  <br>
  <button @click="some_number++">Add one</button>

</template>

<script setup lang="ts">
import {ref} from "vue";
let some_number = ref<number>(0);

console.log(typeof some_number)
</script>=