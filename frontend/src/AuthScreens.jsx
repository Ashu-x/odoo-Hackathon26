import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ShieldCheck } from "lucide-react";
import { Field, PasswordField } from "./components/Form";
import { Brand } from "./components/Layout";
import { api } from "./api/client";

export default function AuthScreens({ mode = "login" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "INVENTORY_MANAGER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (isSignup && form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const data = await api.post(isSignup ? "/api/auth/signup" : "/api/auth/login", isSignup ? { name: form.name, email: form.email, password: form.password, role: form.role } : { email: form.email, password: form.password });
      localStorage.setItem("stocksense_token", data.token);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-brand-panel quiet">
        <div className="ambient-glow" />
        <div className="accent-line" />
        <Brand />
        <div className="brand-story">
          <h1>
            {isSignup
              ? "Bring every stock movement into focus."
              : "Return to a calmer, more certain operation."}
          </h1>
          <p>
            {isSignup
              ? "Set up a shared workspace for products, receipts, deliveries, adjustments, and transfers—without losing sight of what needs action."
              : "Monitor stock, coordinate receipts, and keep every warehouse team working from the same trusted inventory record."}
          </p>
        </div>
        <div className="trust">
          <ShieldCheck size={17} />
          {isSignup
            ? "Role-based access and traceable activity help your team stay accountable from day one."
            : "Protected access, encrypted sessions, and a complete audit trail for every inventory action."}
        </div>
      </div>
      <div className="auth-form-area">
        <div className="auth-switch">
          {isSignup ? "Already have an account?" : "New to StockSense?"}{" "}
          <Link to={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Log in" : "Create account"}
          </Link>
        </div>
        <form className="auth-form revised" onSubmit={submit}>
          <div className="form-kicker">
            {isSignup ? "CREATE YOUR WORKSPACE" : "SECURE WORKSPACE ACCESS"}
          </div>
          <h2>{isSignup ? "Start with clearer inventory" : "Welcome back"}</h2>
          <p>
            {isSignup
              ? "Set up your StockSense account and invite your operations team when you’re ready."
              : "Log in to continue managing live inventory across your warehouse network."}
          </p>
          {isSignup && <Field label="Full name" value={form.name} onChange={update("name")} />}
          <Field label="Work email" type="email" value={form.email} onChange={update("email")} />
          {isSignup ? (
            <div className="password-pair">
              <PasswordField label="Password" value={form.password} onChange={update("password")} />
              <PasswordField label="Confirm password" value={form.confirmPassword} onChange={update("confirmPassword")} />
            </div>
          ) : (
            <PasswordField label="Password" value={form.password} onChange={update("password")} />
          )}
          {isSignup && <label className="field"><span>Role</span><select value={form.role} onChange={update("role")}><option value="INVENTORY_MANAGER">Inventory Manager</option><option value="WAREHOUSE_STAFF">Warehouse Staff</option></select></label>}
          {isSignup ? (
            <>
              <div className="password-guidance">
                <span>
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                Strong · 12+ characters with a number and symbol
              </div>
              <label className="terms">
                <input type="checkbox" defaultChecked />{" "}
                <span>
                  I agree to the <b>Terms of Service</b> and acknowledge the{" "}
                  <b>Privacy Policy</b>.
                </span>
              </label>
            </>
          ) : (
            <div className="form-row">
              <label className="check">
                <input type="checkbox" defaultChecked /> Remember me on this
                device
              </label>
            </div>
          )}
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="submit-button" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create account" : "Log in"} {!loading && <span>→</span>}
          </button>
          <div className="secure-note">
            <Check size={13} />
            {isSignup
              ? "Role-based security keeps every workspace accountable."
              : "Your session is encrypted and monitored for unusual access."}
          </div>
          {!isSignup && (
            <div className="alternative-prompt">
              Need a workspace for your team?{" "}
              <Link to="/signup">Create an account</Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
