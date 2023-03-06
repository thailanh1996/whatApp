import { auth } from "@/config/firebase";
import { Imessage } from "@/type";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";

const StyledMessage = styled.p`
  width: fit-content;
  word-break: break-all;
  max-width: 90%;
  min-width: 30%;
  border-radius: 8px;
  margin: 8px;
  position: relative;
  padding: 15px 15px 30px;
`;

const StyleSenderMessage = styled(StyledMessage)`
  margin-left: auto;
  background-color: #dcf8d6;
`;

const StyleReceiverMessage = styled(StyledMessage)`
  background-color: whitesmoke;
`;

const StyleTimeStamp = styled.span`
  color: gray;
  padding: 10px;
  font-size: x-small;
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: right;
`;

const Message = ({ message }: { message: Imessage }) => {
  const [loggerInUser, _loading, _error] = useAuthState(auth);

  const MessageType =
    loggerInUser?.email === message.user
      ? StyleSenderMessage
      : StyleReceiverMessage;
  return (
    <>
      <MessageType>
        {message.text}
        <StyleTimeStamp>{message.sent_at}</StyleTimeStamp>
      </MessageType>
    </>
  );
};

export default Message;
