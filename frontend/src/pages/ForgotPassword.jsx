import { Link } from "react-router-dom";
import { Field } from "../components/Form";
import { Brand } from "../components/Layout";

export default function ForgotPassword() {
  return (
    <div className="simple-auth">
      <Brand />
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <div className="form-kicker">ACCOUNT RECOVERY</div>
        <h2>Reset your password.</h2>
        <p>We’ll send a one-time code to your email address.</p>
        <Field label="Email address" type="email" />
        <button className="submit-button">
          Send OTP <span>→</span>
        </button>
        <Link className="back-link" to="/login">
          ← Back to login
        </Link>
      </form>
    </div>
  );
}