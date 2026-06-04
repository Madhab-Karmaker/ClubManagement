import React, { useState } from 'react';

interface DonationFormData {
  memberId: string;
  amount: string;
  categoryId: string;
  paymentMethodId: string;
  date: string;
  note: string;
  referenceNumber: string;
}

interface AddDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    memberId: number;
    amount: number;
    categoryId: number;
    paymentMethodId: number;
    date: string;
    note?: string;
    referenceNumber?: string;
  }) => void | Promise<void>;
  memberOptions: Array<{ id: number; name: string }>;
  categoryOptions?: Array<{ id: number; name: string }>;
  paymentMethodOptions?: Array<{ id: number; name: string }>;
}


const AddDonationModal: React.FC<AddDonationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  memberOptions,
  categoryOptions = [],
  paymentMethodOptions = []
}) => {
  const [formData, setFormData] = useState<DonationFormData>({
    memberId: '',
    amount: '',
    categoryId: categoryOptions.length > 0 ? categoryOptions[0].id.toString() : '',
    paymentMethodId: paymentMethodOptions.length > 0 ? paymentMethodOptions[0].id.toString() : '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    referenceNumber: '',
  });

  // Make sure to use the safe paymentMethodOptions
  React.useEffect(() => {
    if (categoryOptions.length > 0 || paymentMethodOptions.length > 0) {
      setFormData(prev => ({
        ...prev,
        categoryId: categoryOptions[0]?.id.toString() || '',
        paymentMethodId: paymentMethodOptions[0]?.id.toString() || '',
      }));
    }
  }, [categoryOptions, paymentMethodOptions]);

  const [errors, setErrors] = useState<Partial<Record<keyof DonationFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DonationFormData, string>> = {};

    if (!formData.memberId) {
      newErrors.memberId = 'Please select a donor';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof DonationFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        memberId: parseInt(formData.memberId, 10),
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId, 10),
        paymentMethodId: parseInt(formData.paymentMethodId, 10),
        date: formData.date,
        note: formData.note || undefined,
        referenceNumber: formData.referenceNumber || undefined,
      });
      setFormData({
        memberId: '',
        amount: '',
        categoryId: categoryOptions[0]?.id.toString() || '',
        paymentMethodId: paymentMethodOptions[0]?.id.toString() || '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        referenceNumber: '',
      });
      onClose();
    } catch (error) {
      console.error('Error submitting donation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-out',
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
      animation: 'slideUp 0.3s ease-out',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px',
      borderBottom: '1px solid #f0f0f0',
    },
    title: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1a1a1a',
      margin: 0,
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#999',
      transition: 'color 0.2s',
      padding: '0',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      '&:hover': {
        color: '#333',
        backgroundColor: '#f5f5f5',
      },
    } as React.CSSProperties,
    body: {
      padding: '24px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px',
      fontSize: '14px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      transition: 'all 0.2s',
      boxSizing: 'border-box' as const,
      fontFamily: 'inherit',
    },
    inputError: {
      borderColor: '#ef4444',
    },
    select: {
      width: '100%',
      padding: '12px',
      fontSize: '14px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxSizing: 'border-box' as const,
      fontFamily: 'inherit',
    },
    errorText: {
      fontSize: '12px',
      color: '#ef4444',
      marginTop: '6px',
      display: 'block',
    },
    footer: {
      padding: '16px 24px',
      borderTop: '1px solid #f0f0f0',
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
    },
    button: {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    cancelButton: {
      backgroundColor: '#f5f5f5',
      color: '#333',
      '&:hover': {
        backgroundColor: '#e5e5e5',
      },
    } as React.CSSProperties,
    submitButton: {
      backgroundColor: '#3b82f6',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#2563eb',
      },
      '&:disabled': {
        backgroundColor: '#bfdbfe',
        cursor: 'not-allowed',
      },
    } as React.CSSProperties,
    rowGroup: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    },
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        input:focus, select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        @media (max-width: 600px) {
          .donation-modal-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={styles.header}>
            <h2 style={styles.title}>💰 Add Donation</h2>
            <button
              style={styles.closeButton}
              onClick={onClose}
              aria-label="Close modal"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#333';
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#999';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div style={styles.body}>
              {/* Donor Name Dropdown */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Donor Name *</label>
                <select
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  style={{
                    ...styles.select,
                    ...(errors.memberId ? styles.inputError : {}),
                  }}
                >
                  <option value="">-- Select Member --</option>
                  {memberOptions.map((member) => (
                    <option key={member.id} value={member.id.toString()}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {errors.memberId && (
                  <span style={styles.errorText}>{errors.memberId}</span>
                )}
              </div>

              {/* Amount and Date Row */}
              <div style={styles.rowGroup} className="donation-modal-row">
                {/* Amount */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount (USD) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={{
                      ...styles.input,
                      ...(errors.amount ? styles.inputError : {}),
                    }}
                  />
                  {errors.amount && (
                    <span style={styles.errorText}>{errors.amount}</span>
                  )}
                </div>

                {/* Date */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      ...(errors.date ? styles.inputError : {}),
                    }}
                  />
                  {errors.date && (
                    <span style={styles.errorText}>{errors.date}</span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Payment Method</label>
                <select
                  name="paymentMethodId"
                  value={formData.paymentMethodId}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {paymentMethodOptions.map((method) => (
                    <option key={method.id} value={method.id.toString()}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reference Number */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Reference Number</label>
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="e.g. check number, transaction hash"
                  style={styles.input}
                />
              </div>

              {/* Note */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Note</label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Enter remarks"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <button
                type="button"
                onClick={onClose}
                style={{ ...styles.button, ...styles.cancelButton }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  ...styles.button,
                  ...styles.submitButton,
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Donation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddDonationModal;
