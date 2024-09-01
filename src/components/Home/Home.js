import React, { useEffect } from "react";
import styles from "./Home.module.css";
import { Link, useNavigate } from "react-router-dom";
import { account } from "../../appwriteConfig";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndSignOut = async () => {
      try {
        const user = await account.get();

        if (user) {
          await account.deleteSession("current");
          console.log("User logged out successfully");
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      }
    };

    checkAuthAndSignOut();
  }, [navigate]);
  return (
    <div className={styles.container}>
      <div className={styles.welcomeText}>DupAlerts</div>
      <Link to="/login" className={styles.loginLink}>
        Click here to login
      </Link>
    </div>
  );
};

export default Home;
