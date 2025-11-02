import { ref } from 'vue'

interface ConfirmParams {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => Promise<void> | void
}

const confirming = ref(false)
const params = ref<ConfirmParams>({
  title: '',
  message: undefined,
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
  onConfirm: () => {}
})

export function useConfirm() {
  function openConfirm(options: Omit<ConfirmParams, 'onConfirm'> & { onConfirm: ConfirmParams['onConfirm'] }) {
    params.value = {
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel ?? 'Delete',
      cancelLabel: options.cancelLabel ?? 'Cancel',
      onConfirm: options.onConfirm
    }
    confirming.value = true
  }

  async function confirm() {
    await params.value.onConfirm()
    confirming.value = false
  }

  function cancel() {
    confirming.value = false
  }

  return {
    confirming,
    params,
    openConfirm,
    confirm,
    cancel
  }
}
