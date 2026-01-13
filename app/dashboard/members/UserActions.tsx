'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2 } from 'lucide-react'
import EditUserForm from './EditUserForm'
import DeleteConfirmation from './DeleteConfirmation'

type User = {
  uid: string
  email: string
  displayName: string
  emailVerified: boolean
  role: 'superAdmin' | 'admin'
  disabled: boolean
}

interface UserActionsProps {
  user: User
}

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${user.uid}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      setShowDeleteConfirm(false)
      router.refresh()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowEditForm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Edit user"
        >
          <Edit className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete user"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {showEditForm && (
        <EditUserForm
          user={user}
          onClose={() => setShowEditForm(false)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmation
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone and will permanently remove the user account."
          itemName={`${user.displayName || 'User'} (${user.email})`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  )
}
