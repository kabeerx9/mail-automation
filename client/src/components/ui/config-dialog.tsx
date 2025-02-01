// components/EmailConfigModal.jsx
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { useState } from 'react'

interface SmtpConfig {
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;
  EMAIL_SUBJECT: string;
  EMAIL_RATE_LIMIT: number;
}

interface ConfigErrors {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  EMAIL_FROM?: string;
  EMAIL_SUBJECT?: string;
  EMAIL_RATE_LIMIT?: string;
  general?: string;
}

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: SmtpConfig) => Promise<void>;
}

export default function ConfigDialog({ isOpen, onClose, onSubmit }: ConfigDialogProps) {
  const [formData, setFormData] = useState<SmtpConfig>({
    SMTP_HOST: '',
    SMTP_PORT: '587',
    SMTP_USER: '',
    SMTP_PASS: '',
    EMAIL_FROM: '',
    EMAIL_SUBJECT: '',
    EMAIL_RATE_LIMIT: 60
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
                  value={formData.SMTP_HOST}
                  onChange={(e) => setFormData({ ...formData, SMTP_HOST: e.target.value })}
                />
                {errors.SMTP_HOST && <p className="text-red-500 text-sm">{errors.SMTP_HOST}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SMTP Port</label>
                <input
                  type="number"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.SMTP_PORT}
                  onChange={(e) => setFormData({ ...formData, SMTP_PORT: e.target.value })}
                />
                {errors.SMTP_PORT && <p className="text-red-500 text-sm">{errors.SMTP_PORT}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SMTP Username</label>
                <input
                  required
                  className="w-full p-2 border rounded"
                  value={formData.SMTP_USER}
                  onChange={(e) => setFormData({ ...formData, SMTP_USER: e.target.value })}
                />
                {errors.SMTP_USER && <p className="text-red-500 text-sm">{errors.SMTP_USER}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SMTP Password</label>
                <input
                  type="password"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.SMTP_PASS}
                  onChange={(e) => setFormData({ ...formData, SMTP_PASS: e.target.value })}
                />
                {errors.SMTP_PASS && <p className="text-red-500 text-sm">{errors.SMTP_PASS}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">From Email</label>
                <input
                  required
                  className="w-full p-2 border rounded"
                  value={formData.EMAIL_FROM}
                  onChange={(e) => setFormData({ ...formData, EMAIL_FROM: e.target.value })}
                />
                {errors.EMAIL_FROM && <p className="text-red-500 text-sm">{errors.EMAIL_FROM}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Subject</label>
                <input
                  required
                  className="w-full p-2 border rounded"
                  value={formData.EMAIL_SUBJECT}
                  onChange={(e) => setFormData({ ...formData, EMAIL_SUBJECT: e.target.value })}
                />
                {errors.EMAIL_SUBJECT && <p className="text-red-500 text-sm">{errors.EMAIL_SUBJECT}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rate Limit (emails per hour)</label>
                <input
                  type="number"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.EMAIL_RATE_LIMIT}
                  onChange={(e) => setFormData({ ...formData, EMAIL_RATE_LIMIT: parseInt(e.target.value, 10) })}
                />
                {errors.EMAIL_RATE_LIMIT && <p className="text-red-500 text-sm">{errors.EMAIL_RATE_LIMIT}</p>}
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
