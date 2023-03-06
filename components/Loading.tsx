import React from "react";
import styled from "styled-components";
import Image from "next/image";
import CircularProgress from "@mui/material/CircularProgress";

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100vw;
  height: 100vh;
`;

//
const Loading = () => {
  return (
    <StyledContainer>
      <CircularProgress />
    </StyledContainer>
  );
};

export default Loading;
