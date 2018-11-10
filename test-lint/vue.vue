<!--
  Prettier can put several attributes on one line, but "plugin:vue/recommended"
  wants at most one per line.
-->
<template>
  <div v-if="!isFirst" class="container">content</div>
</template>
