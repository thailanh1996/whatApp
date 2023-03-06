import { useCollection } from "react-firebase-hooks/firestore";
import { getRecipientEmail } from "./../utils/getRecipientEmail";
import { auth, db } from "@/config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { AppUser, Conversation } from "./../type/index";
import { collection, query, where } from "firebase/firestore";

export const useRecipient = (conversationUser: Conversation["users"]) => {
  const [loggerInUser, _loading, _error] = useAuthState(auth);

  //   Get recipient email
  const recipientEmail = getRecipientEmail(conversationUser, loggerInUser);

  //   Get reipient avatar
  const queryGetRecipient = query(
    collection(db, "users"),
    where("email", "==", recipientEmail)
  );
  const [recipientSnapshot, _loading2, _error2] =
    useCollection(queryGetRecipient);

  // recipientSnapshot
  const recipient = recipientSnapshot?.docs[0]?.data() as AppUser | undefined;

  return { recipient, recipientEmail };
};
