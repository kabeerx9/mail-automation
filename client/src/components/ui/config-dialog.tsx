// components/EmailConfigModal.jsx
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { useState } from 'react'
import { SmtpConfig } from '../../services/api'

interface ConfigErrors {
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail?: string;
  general?: string;
}

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: SmtpConfig) => Promise<void>;
}

export default function ConfigDialog({ isOpen, onClose, onSubmit }: ConfigDialogProps) {
  const [formData, setFormData] = useState<SmtpConfig>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    fromEmail: ''
  })
  const [errors, setErrors] = useState<ConfigErrors>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        const apiError = error as { response?: { data?: { errors?: ConfigErrors } } }
        setErrors(apiError.response?.data?.errors || { general: 'Configuration failed' })
      } else {
        setErrors({ general: 'An unexpected error occurred' })
      }
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 duration-300 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <Dialog.Title className="text-lg font-medium mb-4">
            Email Configuration Required
          </Dialog.Title>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SMTP Host</label>
                <input
                  required
                  className="w-full p-2 border rounded"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                />
                {errors.smtpHost && <p className="text-red-500 text-sm">{errors.smtpHost}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SMTP Port</label>
                <input
                  type="number"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value, 10) })}
                />
                {errors.smtpPort && <p className="text-red-500 text-sm">{errors.smtpPort}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SMTP Username</label>
                <input
                  required
                  className="w-full p-2 border rounded"
                  value={formData.smtpUser}
                  onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                />
                {errors.smtpUser && <p className="text-red-500 text-sm">{errors.smtpUser}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SMTP Password</label>
                <input
                  type="password"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.smtpPass}
                  onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
                />
                {errors.smtpPass && <p className="text-red-500 text-sm">{errors.smtpPass}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">From Email</label>
                <input
                  type="email"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.fromEmail}
                  onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                />
                {errors.fromEmail && <p className="text-red-500 text-sm">{errors.fromEmail}</p>}
              </div>

              {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
