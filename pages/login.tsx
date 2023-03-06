import React from "react";
import styled from "styled-components";
import Head from "next/head";
import Image from "next/image";
import Button from "@mui/material/Button";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth, db } from "@/config/firebase";
import { doc, setDoc } from "firebase/firestore";

const StyledContainer = styled.div`
  height: 100vh;
  width: 100vw;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledLogin = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  flex-direction: column;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  padding: 100px;
`;

const StyledImageWrapper = styled.div`
  margin-bottom: 50px;
`;

//
const Login = () => {
  const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

  const handleSignIn = () => {
    signInWithGoogle();
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <StyledContainer>
        <StyledLogin>
          <StyledImageWrapper>
            <Image
              alt="Logo"
              src="https://www.svgrepo.com/show/106976/whatsapp.svg"
              width="120"
              height="120"
            />
          </StyledImageWrapper>
          <Button onClick={handleSignIn} variant="outlined">
            Sign in with Google
          </Button>
        </StyledLogin>
      </StyledContainer>
    </>
  );
};

export default Login;
