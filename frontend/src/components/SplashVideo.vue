<template>
  <video
    v-if="visible"
    class="fixed inset-0 w-screen h-screen object-cover z-[9999] pointer-events-none"
    autoplay
    muted
    playsinline
    disablepictureinpicture
    controlslist="nodownload nofullscreen noremoteplayback"
    @ended="hide"
  >
    <source :src="src" type="video/mp4" />
  </video>
</template>

<script setup>
import { onMounted, ref } from "vue";

const props = defineProps({
  src: { type: String, required: true },
  durationMs: { type: Number, default: 3000 }
});

const emit = defineEmits(["done"]);
const visible = ref(false);
let timer = null;

function hide() {
  visible.value = false;
  emit("done");
}

onMounted(() => {
  visible.value = true;
  timer = setTimeout(() => {
    hide();
  }, props.durationMs);
});
</script>

