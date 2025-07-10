import * as Dialog from '@radix-ui/react-dialog';
import { X, User as UserIcon, Phone as PhoneIcon, Save as SaveIcon, XCircle, Trash2 } from 'lucide-react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { UserProfile } from '@/lib/firebase';
import React from 'react';

interface CustomerDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: UserProfile | null;
  onSave?: (updated: UserProfile) => void;
  onDelete?: (uid: string) => void;
}

function isFirestoreTimestamp(obj: any): obj is { toDate: () => Date } {
  return obj && typeof obj.toDate === 'function';
}

export default function CustomerDetailsDrawer({ open, onOpenChange, customer, onSave, onDelete }: CustomerDetailsDrawerProps) {
  const [editMode, setEditMode] = React.useState(false);
  const [form, setForm] = React.useState({ firstName: '', lastName: '', phone: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  React.useEffect(() => {
    if (customer) {
      setForm({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || ''
      });
      setEditMode(false);
    }
  }, [customer]);
  if (!customer) return null;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Dialog.Content
          className="fixed top-0 right-0 h-full w-full max-w-md bg-gradient-to-br from-[#FFFBEA] via-[#F5F2E8] to-[#E6DCC0] shadow-2xl z-50 focus:outline-none flex flex-col"
          style={{ transition: 'transform 0.3s', willChange: 'transform' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-[#E6DCC0] bg-gradient-to-r from-[#FFFBEA] to-[#F5F2E8] rounded-tr-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center text-white font-bold text-xl shadow">
                {((customer.firstName || '')[0] || '').toUpperCase()}
                {((customer.lastName || '')[0] || '').toUpperCase()}
              </div>
              <div>
                <Dialog.Title asChild>
                  {editMode ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="text-2xl font-bold text-[#5E4E06] bg-[#FFFBEA] border border-[#D4AF37] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition w-44"
                        value={form.firstName + ' ' + form.lastName}
                        onChange={e => {
                          const [first, ...rest] = e.target.value.split(' ');
                          setForm(f => ({ ...f, firstName: first, lastName: rest.join(' ') }));
                        }}
                        placeholder="Full Name"
                      />
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#8B7A1A] text-xs font-semibold animate-fade-in">Edit Mode</span>
                    </div>
                  ) : (
                    <h3 className="text-2xl font-bold text-[#5E4E06]">{customer.firstName} {customer.lastName}</h3>
                  )}
                </Dialog.Title>
                <p className="text-[#8B7A1A] text-sm">Customer since {(() => {
                  if (!customer.createdAt) return '-';
                  if (isFirestoreTimestamp(customer.createdAt)) {
                    return customer.createdAt.toDate().toLocaleDateString();
                  } else if (customer.createdAt instanceof Date) {
                    return customer.createdAt.toLocaleDateString();
                  } else {
                    return new Date(customer.createdAt).toLocaleDateString();
                  }
                })()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!editMode && (
                <>
                  <button
                    className="p-2 rounded-full hover:bg-[#F5F2E8] transition-colors"
                    aria-label="Edit"
                    onClick={() => setEditMode(true)}
                  >
                    <svg className="w-5 h-5 text-[#8B7A1A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V21h8" /></svg>
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-red-50 transition-colors"
                    aria-label="Delete"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                  {/* Confirm Delete Dialog */}
                  <AlertDialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <AlertDialog.Portal>
                      <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                      <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 z-50 w-full max-w-xs flex flex-col items-center">
                        <Trash2 className="w-10 h-10 text-red-500 mb-4" />
                        <AlertDialog.Title className="text-xl font-bold text-[#5E4E06] mb-2">Delete Customer?</AlertDialog.Title>
                        <AlertDialog.Description className="text-[#8B7A1A] mb-6 text-center">Are you sure you want to delete this customer? This action cannot be undone.</AlertDialog.Description>
                        <div className="flex gap-4 w-full justify-center">
                          <AlertDialog.Cancel asChild>
                            <button className="px-4 py-2 rounded-xl font-bold text-[#8B7A1A] bg-[#F5F2E8] border border-[#D4AF37] hover:bg-[#FFFBEA] transition">Cancel</button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action asChild>
                            <button
                              className="px-4 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-red-700 hover:scale-105 transition"
                              onClick={() => { if (onDelete) onDelete(customer.uid); setShowDeleteConfirm(false); }}
                            >
                              Delete
                            </button>
                          </AlertDialog.Action>
                        </div>
                      </AlertDialog.Content>
                    </AlertDialog.Portal>
                  </AlertDialog.Root>
                </>
              )}
              <Dialog.Close asChild>
                <button className="p-2 rounded-full hover:bg-[#F5F2E8] transition-colors" aria-label="Close">
                  <X className="w-6 h-6 text-[#8B7A1A]" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          {/* Details */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="space-y-6">
              <div>
                <div className="text-xs text-[#8B7A1A] font-semibold mb-1">Email</div>
                <div className="text-[#5E4E06] text-lg font-medium">{customer.email}</div>
              </div>
              <div>
                <div className="text-xs text-[#8B7A1A] font-semibold mb-1">Phone</div>
                {editMode ? (
                  <div className="relative">
                    <PhoneIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
                    <input
                      className="pl-10 pr-2 py-2 text-lg font-medium text-[#5E4E06] bg-[#FFFBEA] border border-[#D4AF37] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition w-full"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="Phone Number"
                    />
                  </div>
                ) : (
                  <div className="text-[#5E4E06] text-lg font-medium">{customer.phone || '-'}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-[#8B7A1A] font-semibold mb-1">UID</div>
                <div className="text-[#5E4E06] text-lg font-mono break-all">{customer.uid}</div>
              </div>
              {/* Future: Add more details (orders, notes, etc.) */}
            </div>
          </div>
          {/* Edit Mode Actions */}
          {editMode && (
            <div className="flex items-center justify-end gap-4 px-8 pb-6 border-t border-[#E6DCC0] bg-gradient-to-r from-[#FFFBEA] to-[#F5F2E8] animate-fade-in">
              <button
                className="px-5 py-2 rounded-xl font-bold text-[#8B7A1A] bg-[#F5F2E8] border border-[#D4AF37] hover:bg-[#FFFBEA] transition flex items-center gap-2"
                onClick={() => setEditMode(false)}
              >
                <XCircle className="w-5 h-5" /> Cancel
              </button>
              <button
                className="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] hover:scale-105 transition flex items-center gap-2"
                onClick={() => { if (onSave) onSave({ ...customer, ...form }); setEditMode(false); }}
              >
                <SaveIcon className="w-5 h-5" /> Save
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 