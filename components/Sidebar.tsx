import React, { useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import {
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import {
  addDoc,
  collection,
  doc,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import * as EmailValidator from "email-validator";
import { useCollection } from "react-firebase-hooks/firestore";
import { Conversation } from "@/type";
import ConversationSelect from "./ConversationSelect";

const StyledContainer = styled.div`
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;
  border-right: 1px solid whitesmoke;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid whitesmoke;
  padding: 15px;

  position: sticky;
  top: 0;
  z-index: 100;
  background-color: white;
`;

const StyledSearch = styled.div`
  display: flex;
  align-items: center;
  border-radius: 2px;
  padding: 15px;
`;

const StyledSidebarButton = styled(Button)`
  width: 100%;
  border-top: 1px solid whitesmoke;
  border-bottom: 1px solid whitesmoke;
`;

const StyledUserAvatar = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const StyledInputSearch = styled.input`
  flex: 1;
  outline: none;
  border: none;
`;

//
const Sidebar = () => {
  const [loggedInUser, loading, _error] = useAuthState(auth);
  const [open, setOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const toggleNewConversation = (isOpen: boolean) => {
    setOpen(false);

    if (!isOpen) setRecipientEmail;
  };

  const toggleCloseNewConversation = () => {
    setOpen(false);
  };

  const isInvitingSelf = recipientEmail === loggedInUser?.email;

  const queryConversationForCurrentUser = query(
    collection(db, "conversation"),
    where("users", "array-contains", loggedInUser?.email)
  );

  const [conversationSnapshot, _loading, _err] = useCollection(
    queryConversationForCurrentUser
  );
  //
  // const a = conversationSnapshot?.docs.map((el) => el.data());
  // console.log(a);
  // console.log(a?.find((el) => el.users.includes("phucnguyen2021@gmail.com")));
  //
  const isConversationAlreadyExist = (recipientEmail: string) => {
    return conversationSnapshot?.docs.find((conversation) =>
      (conversation.data() as Conversation).users.includes(recipientEmail)
    );
  };

  const createConversation = async () => {
    console.log("Creating conversation");

    if (!recipientEmail) return;
    if (
      EmailValidator.validate(recipientEmail) &&
      !isInvitingSelf &&
      !isConversationAlreadyExist(recipientEmail)
    ) {
      await addDoc(collection(db, "conversation"), {
        users: [loggedInUser?.email, recipientEmail],
      });
    }
    toggleCloseNewConversation();
  };

  const handleLoggout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <StyledContainer>
        <StyledHeader>
          <Tooltip title={loggedInUser?.email as string} placement="right">
            <StyledUserAvatar src={loggedInUser?.photoURL || ""} />
          </Tooltip>

          <div>
            <IconButton>
              <i className="ri-message-3-line"></i>
            </IconButton>
            <IconButton>
              <i className="ri-more-2-line"></i>
            </IconButton>
            <IconButton onClick={handleLoggout}>
              <i className="ri-logout-circle-r-line"></i>
            </IconButton>
          </div>
        </StyledHeader>
        <StyledSearch>
          <span>
            <i className="ri-search-line"></i>
          </span>
          <StyledInputSearch placeholder="Enter search conversation..." />
        </StyledSearch>
        <StyledSidebarButton onClick={handleClickOpen} variant="outlined">
          Start a new conversation
        </StyledSidebarButton>

        {/* list of conversation */}
        {conversationSnapshot?.docs.map((conversation) => (
          <ConversationSelect
            key={conversation.id}
            id={conversation.id}
            conversationUsers={(conversation.data() as Conversation).users}
          />
        ))}

        {/* --diaglog */}
        <Dialog open={open} onClose={() => toggleNewConversation(false)}>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter a Google email address for user you wish to chat
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Email Address"
              type="email"
              fullWidth
              variant="standard"
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleCloseNewConversation}>Cancel</Button>
            <Button disabled={!recipientEmail} onClick={createConversation}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </StyledContainer>
    </>
  );
};

export default Sidebar;
