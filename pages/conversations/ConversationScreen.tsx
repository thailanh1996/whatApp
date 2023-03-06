import RecipientAvatar from "@/components/RecipientAvatar";
import { auth, db } from "@/config/firebase";
import { useRecipient } from "@/hook/useRecipient";
import { Conversation, Imessage } from "@/type";
import {
  convertFirestoreTimestampToString,
  generateQueryMessages,
} from "@/utils/getMesagesInConversation";
import { Icon, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import React, {
  KeyboardEventHandler,
  MouseEventHandler,
  useRef,
  useState,
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import styled from "styled-components";
import { transformMessage } from "@/utils/getMesagesInConversation";
import Message from "@/components/Message";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const StyledRecipientHeader = styled.div`
  position: sticky;
  background-color: white;
  top: 0;
  display: flex;
  align-items: center;
  padding: 11px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
  z-index: 100;
`;

const StyledHeaderInfo = styled.div`
  margin-left: 15px;
  flex-grow: 1;

  > h3 {
    margin-top: 0;
    margin-bottom: 3px;
  }

  > span {
    font-size: 14px;
    color: gray;
  }
`;

const StyleH3 = styled.h3`
  word-break: break-all;
`;

const StyledMessageContainer = styled.div`
  flex: 1;
  background: #a7727d;
  padding-bottom: 55px;
`;

const StyledHeaderIcon = styled.div``;

const StyledInputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: white;
  z-index: 100;

  position: fixed;
  bottom: 0;
  width: calc(100% - 300px);
`;

const StyledInput = styled.input`
  flex-grow: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 10px;
  margin-left: 15px;
  margin-right: 15px;
`;

const EndOfMessagesForAutoScoll = styled.div`
  margin-bottom: 30px;
`;

//
const ConversationScreen = ({
  conversation,
  messages,
}: {
  conversation: Conversation;
  messages: Imessage[];
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [loggerInUser, loggerInMessage, _error1] = useAuthState(auth);
  const conversationUsers = conversation.users;
  const { recipientEmail, recipient } = useRecipient(conversationUsers);
  const router = useRouter();
  const endOfMessageref = useRef<HTMLDivElement>(null);
  const conversationId = router.query.id;

  const queryGetMessages = generateQueryMessages(conversationId as string);

  const [messagesSnapshot, messageLoading, _error2] =
    useCollection(queryGetMessages);

  const showMessage = () => {
    // if FE is loading messages behind the sinces, display messages retrived from next SSR
    if (messageLoading) {
      return messages.map((msg, index) => (
        <Message key={msg.id} message={msg} />
      ));
    }

    // if FE has finished loading messages, know we have msgSnapshot
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((msg, index) => (
        <Message key={msg.id} message={transformMessage(msg)} />
      ));
    }

    return null;
  };

  const addMessageToDbAndUpdateLastSeen = async () => {
    // Update last seen in db
    await setDoc(
      doc(db, "users", loggerInUser?.email as string),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
    // Add to database a new mesage

    await addDoc(collection(db, "messages"), {
      conversation_id: conversationId,
      sent_at: serverTimestamp(),
      text: newMessage,
      user: loggerInUser?.email,
    });

    // reset Input
    setNewMessage("");

    // Scroll to bottom
    scrollToBottom();
  };

  const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!newMessage) return;
      addMessageToDbAndUpdateLastSeen();
    }
  };

  const sendMessageOnClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();

    if (!newMessage) return;

    addMessageToDbAndUpdateLastSeen();
  };

  const scrollToBottom = () => {
    endOfMessageref.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <>
      <StyledRecipientHeader>
        <RecipientAvatar
          recipient={recipient}
          recipientEmail={recipientEmail}
        />
        <StyledHeaderInfo>
          <StyleH3>{recipientEmail}</StyleH3>
          {recipient && (
            <span>
              Last active:{" "}
              {convertFirestoreTimestampToString(recipient.lastSeen)}
            </span>
          )}
        </StyledHeaderInfo>

        <StyledHeaderIcon>
          <IconButton>
            <i className="ri-attachment-2"></i>
          </IconButton>
          <IconButton>
            <i className="ri-more-2-line"></i>
          </IconButton>
        </StyledHeaderIcon>
      </StyledRecipientHeader>

      <StyledMessageContainer>
        {showMessage()}
        <EndOfMessagesForAutoScoll ref={endOfMessageref} />
      </StyledMessageContainer>

      {/* Enter new message */}

      <StyledInputContainer>
        <IconButton>
          <i className="ri-emotion-line"></i>
        </IconButton>
        <StyledInput
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={sendMessageOnEnter}
        />
        <IconButton>
          <i className="ri-search-line"></i>
        </IconButton>

        <IconButton onClick={sendMessageOnClick} disabled={!newMessage}>
          <i className="ri-send-plane-line"></i>
        </IconButton>

        <IconButton>
          <i className="ri-mic-line"></i>
        </IconButton>
      </StyledInputContainer>
    </>
  );
};

export default ConversationScreen;
