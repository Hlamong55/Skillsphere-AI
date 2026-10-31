
import { useContext } from "react";

import OnlinePresenceContext from "../context/OnlinePresenceContext";

const useOnlinePresence = () => {
  const context = useContext(
    OnlinePresenceContext
  );

  if (!context) {
    throw new Error(
      "useOnlinePresence must be used inside OnlinePresenceProvider."
    );
  }

  return context;
};

export default useOnlinePresence;
