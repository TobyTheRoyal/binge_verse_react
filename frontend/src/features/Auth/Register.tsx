import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Register.module.scss";

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const isValid =
    username.trim() !== "" &&
    email.trim() !== "" &&
    validateEmail(email) &&
    password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      await register({ username, email, password });
      navigate("/");
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          "Registration failed. Please try a different username or email."
      );
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBox}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            className={styles.authInput}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            className={styles.authInput}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className={styles.authInput}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className={styles.authButton}
            disabled={!isValid}
          >
            Sign Up
          </button>
        </form>

        <p className={styles.authLink}>
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </p>

        {errorMessage && (
          <p className={styles.errorMessage}>{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default Register;
