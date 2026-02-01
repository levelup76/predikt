'use client'

import { deleteEventAdminAction } from '@/app/actions'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'

export function DeleteEventButton({ eventId }: { eventId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm('BIZTOSAN TÖRÖLNI SZERETNÉD? Ez a művelet nem visszavonható!')) return;
        
        setIsDeleting(true)
        const formData = new FormData()
        formData.append('id', eventId)
        
        try {
            const res = await deleteEventAdminAction(formData)
            
            if (res?.error) {
                alert(res.error)
                setIsDeleting(false)
            } else {
                // Success
                // router.refresh() handles the UI update if revalidatePath worked
                // But a reload ensures clean state
                alert('Esemény sikeresen törölve!')
            }
        } catch (err) {
            alert('Váratlan hiba történt.')
            setIsDeleting(false)
        }
    }

    return (
        <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 font-medium text-red-600 dark:text-red-500 hover:underline disabled:opacity-50"
        >
            <Trash2 size={16} />
            {isDeleting ? '...' : 'Törlés'}
        </button>
    )
}
