import { useActivity } from '../store/useActivity'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import Icon from './Icon'

export default function SavedButton({ campaignId, variant = 'icon' }) {
  const { user } = useAuth()
  const store = useActivity()
  const toast = useToast()

  if (!user) return null

  const saved = store.isSaved(user.id, campaignId)

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    const nowSaved = store.toggleSave(user.id, campaignId)
    toast.push(
      nowSaved ? 'Saved to your collection' : 'Removed from saved',
      'info',
      1800
    )
  }

  if (variant === 'text') {
    return (
      <button
        className={`btn btn-sm ${saved ? 'btn-ghost' : 'btn-neutral'}`}
        onClick={handleClick}
      >
        <Icon name={saved ? 'book' : 'plus'} size={14} />
        {saved ? 'Saved' : 'Save'}
      </button>
    )
  }

  return (
    <button
      className={`saved-button ${saved ? 'is-saved' : ''}`}
      onClick={handleClick}
      aria-label={saved ? 'Unsave' : 'Save'}
      title={saved ? 'Unsave' : 'Save to your collection'}
    >
      <Icon
        name="book"
        size={14}
        color={saved ? 'var(--orange-500)' : 'var(--ink-500)'}
      />
    </button>
  )
}