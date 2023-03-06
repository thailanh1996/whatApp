import Sidebar from "@/components/Sidebar";
import { auth, db } from "@/config/firebase";
import { Conversation, Imessage } from "@/type";
import {
  generateQueryMessages,
  transformMessage,
} from "@/utils/getMesagesInConversation";
import { getRecipientEmail } from "@/utils/getRecipientEmail";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import ConversationScreen from "./ConversationScreen";

interface Props {
  conversation: Conversation;
  messages: Imessage[];
}

const StyledContainer = styled.div`
  display: flex;
`;

const StyledConversationContainer = styled.div`
  height: 100vh;
  flex-grow: 1;
  overflow: scroll;
  position: relative;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const Conversation = ({ conversation, messages }: Props) => {
  const [loggedInUser, _loading, _err] = useAuthState(auth);

  console.log(conversation, messages);

  return (
    <>
      <Head>
        <title>
          Conversation with{" "}
          {getRecipientEmail(conversation.users, loggedInUser)}
        </title>
        <link
          rel="icon"
          href="https://www.svgrepo.com/show/106976/whatsapp.svg"
        />
      </Head>
      <StyledContainer>
        <Sidebar />

        <StyledConversationContainer>
          <ConversationScreen conversation={conversation} messages={messages} />
        </StyledConversationContainer>
      </StyledContainer>
    </>
  );
};

export default Conversation;

// Tuong tuong day chinh la server
export const getServerSideProps: GetServerSideProps<
  Props,
  { id: string }
> = async (context) => {
  const conversationId = context.params?.id;

  // Get conversation to know who we are
  const conversationRef = doc(db, "conversation", conversationId as string);
  const conversationSnapshot = await getDoc(conversationRef);

  // get all messages between logged in user and recipient in this conversation
  const queryMessages = generateQueryMessages(conversationId);
  const messageSnapshot = await getDocs(queryMessages);

  const messages = messageSnapshot.docs.map((messageDoc) =>
    transformMessage(messageDoc)
  );

  return {
    props: {
      conversation: conversationSnapshot.data() as Conversation,
      messages,
    },
  };
};
