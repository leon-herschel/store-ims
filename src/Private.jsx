import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function render(component) {
  return component;
}

const Private = (Component) => {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    (async function () {
      const sessionStatus = await checkLoginSession();

      setHasSession(Boolean(sessionStatus));
    })();
  }, [hasSession, Component]);

  return hasSession ? render(Component) : <Navigate to="/" />;
};

export default Private;
