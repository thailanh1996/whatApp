import { User } from "firebase/auth";
import { Conversation } from "./../type/index";

export const getRecipientEmail = (
  conversationUsers: Conversation["users"],
  loggerInUser?: User | null
) => {
  return conversationUsers.find(
    (userEmail) => userEmail !== loggerInUser?.email
  );
};
