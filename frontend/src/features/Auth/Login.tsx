import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.scss";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const isValid = email.trim() !== "" && validateEmail(email) && password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);

    if (!isValid) return;

    try {
      await login({ email, password });
      navigate("/");
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBox}>
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            className={styles.authInput}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setIsTouched(true);
            }}
            placeholder="Email"
            required
          />
          <input
            className={styles.authInput}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setIsTouched(true);
            }}
            placeholder="Password"
            required
          />
          <button
            className={styles.authButton}
            type="submit"
            disabled={!isValid || !isTouched}
          >
            Sign In
          </button>
        </form>

        <div className={styles.authLink}>
          Don&apos;t have an account?{" "}
          <Link to="/auth/register">Sign up</Link>
        </div>

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default Login;
