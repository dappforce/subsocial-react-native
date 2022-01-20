import { AccountId, ProfileData } from 'src/types/subsocial'

export const truncateAddress = (id: AccountId) => id.substr(0, 6) + '...' + id.substr(-6)

export function getDisplayName(id: AccountId | undefined, profile: ProfileData | undefined): string {
  if (!id) {
    if (profile){
      id = profile.id
    }
    else {
      return ''
    }
  }
  
  if (profile?.content?.name) return profile.content.name
  
  return id.substring(0, 6) + '...' + id.substring(id.length - 6)
}
