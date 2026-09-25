import { redirect } from 'next/navigation'

export default function LegacyCredentialVaultRoute() {
  redirect('/challenges/dns-reconnaissance')
}
