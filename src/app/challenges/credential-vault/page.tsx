import { redirect } from 'next/navigation'

export default function LegacyCredentialVaultRoute() {
  redirect('/challenges/idor-broken-access-control')
}
