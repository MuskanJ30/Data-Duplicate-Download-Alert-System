import React, { useEffect, useState } from "react";
import styles from "./Login.module.css";
import InputControl from "../InputControl/InputControl";
import { useNavigate } from "react-router-dom";
import { account } from "../../appwriteConfig";

const Login = () => {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

  useEffect(() => {
    const checkAuthAndSignOut = async () => {
      try {
        const user = await account.get();

        if (user) {
          await account.deleteSession("current");
          console.log("User logged out successfully");
          // navigate("/");
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      }
    };

    checkAuthAndSignOut();
  }, [navigate]);

  const validateEmail = (email) => {
    return validEmailRegex.test(email);
  };

  const validatePassword = (password) => {
    return passwordRegex.test(password);
  };

  const handleSubmission = async () => {
    setError("");
    if (!values.email || !values.password) {
      setError("Please fill all fields");
      return;
    }

    if (!validateEmail(values.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!validatePassword(values.password)) {
      setError(
        "Password must contain at least one uppercase letter, one special character"
      );
      return;
    }

    setLoading(true);
    try {
      await account.createEmailPasswordSession(values.email, values.password);
      setLoading(false);
      navigate("/landing-page", { replace: true });
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmission();
    }
  };

  useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        setError("");
      }, 5000);

      return () => clearTimeout(timer);
    };
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.innerBox} onKeyDown={handleKeyDown}>
        <h1 className={styles.heading}>Login</h1>
        <InputControl
          label="Email"
          placeholder="Enter Email Address"
          onChange={(e) =>
            setValues((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <InputControl
          label="Password"
          placeholder="Enter Password"
          type="password"
          onChange={(e) =>
            setValues((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <div className={styles.footer}>
          <b className={styles.error}>{error}</b>
          <button
            onClick={handleSubmission}
            className={styles.button}
            disabled={loading}
          >
            {loading ? <div className={styles.spinner}></div> : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Login;
