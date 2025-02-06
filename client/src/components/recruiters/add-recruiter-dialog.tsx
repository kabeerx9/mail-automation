import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { addRecruiter } from '../../services/api';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRecruiterDialog({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: ''
  });

  const addRecruiterMutation = useMutation({
    mutationFn: addRecruiter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiters-check'] });
      toast.success('Recruiter added successfully');
      onClose();
      setFormData({ name: '', company: '', email: '' });
    },
    onError: () => {
      toast.error('Failed to add recruiter');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRecruiterMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
          <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-gray-900">
            Add New Recruiter
          </DialogTitle>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  placeholder="Enter recruiter's name"
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out text-gray-900 placeholder:text-gray-400 text-base"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  required
                  placeholder="Enter company name"
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out text-gray-900 placeholder:text-gray-400 text-base"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="Enter email address"
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200 ease-in-out text-gray-900 placeholder:text-gray-400 text-base"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addRecruiterMutation.isPending}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
              >
                {addRecruiterMutation.isPending ? 'Adding...' : 'Add Recruiter'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
