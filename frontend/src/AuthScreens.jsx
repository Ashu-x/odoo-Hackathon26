import { Link, useNavigate } from "react-router-dom";
import { Check, ShieldCheck } from "lucide-react";
import { Field, PasswordField } from "./components/Form";
import { Brand } from "./components/Layout";

export default function AuthScreens({ mode = "login" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const submit = (event) => {
    event.preventDefault();
    localStorage.setItem("stocksense_token", "demo-token");
    navigate("/");
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
          {isSignup && <Field label="Full name" />}
          <Field label="Work email" type="email" />
          {isSignup ? (
            <div className="password-pair">
              <PasswordField label="Password" />
              <PasswordField label="Confirm password" />
            </div>
          ) : (
            <PasswordField label="Password" />
          )}
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
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          )}
          <button className="submit-button">
            {isSignup ? "Create account" : "Log in"} <span>→</span>
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
