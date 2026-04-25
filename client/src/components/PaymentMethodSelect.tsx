import React, { useEffect, useState } from "react";
import paymentMethodService from "./../services/paymentmethod.service";
import type { PaymentMethodResponse } from "./../services/paymentmethod.service";

interface PaymentMethodSelectProps {
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  onlyActive?: boolean;
  className?: string;
  required?: boolean;
}

const PaymentMethodSelect: React.FC<PaymentMethodSelectProps> = ({
  value,
  onChange,
  placeholder = "Select payment method",
  disabled = false,
  onlyActive = true,
  className = "form-input",
  required = false,
}) => {
  const [methods, setMethods] = useState<PaymentMethodResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentMethodService
      .getAll()
      .then((res) => {
        const filtered = onlyActive ? res.data.filter((m) => m.isActive) : res.data;
        setMethods(filtered);
      })
      .catch(() => setMethods([]))
      .finally(() => setLoading(false));
  }, [onlyActive]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled || loading}
      className={className}
      required={required}
    >
      <option value="">{loading ? "Loading…" : placeholder}</option>
      {methods.map((method) => (
        <option key={method.id} value={method.id}>
          {method.name}
        </option>
      ))}
    </select>
  );
};

export default PaymentMethodSelect;
