import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Field({ label, value = "", type = "text", disabled = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} defaultValue={value} disabled={disabled} />
    </label>
  );
}
export function PasswordField({ label }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <div className="password-input">
        <input
          type={visible ? "text" : "password"}
          placeholder="••••••••••••"
        />
        <button type="button" onClick={() => setVisible((value) => !value)}>
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          <small>Show</small>
        </button>
      </div>
    </label>
  );
}
