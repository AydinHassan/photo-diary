<script setup lang="ts">

definePageMeta({
  layout: 'empty',
})

const providers = [{
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    window.location.href = '/auth/github'
  }
}]
</script>

<template>
  <UDashboardPanel>
    <div class="flex-1 flex items-center justify-center gap-4 p-4">
      <UPageCard class="w-full max-w-md">
          <UAuthForm
            :providers="providers"
            title="Welcome back!"
            icon="i-lucide-lock"
          >
            <template #password-hint>
              <ULink to="#" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
            </template>
            <template #validation>
              <UAlert color="error" icon="i-lucide-info" title="Error signing in" />
            </template>
            <template #footer>
              By signing in, you agree to our <ULink to="#" class="text-primary font-medium">Terms of Service</ULink>.
            </template>
          </UAuthForm>
      </UPageCard>
    </div>
  </UDashboardPanel>

</template>

