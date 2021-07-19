import React, { useState } from "react";
import { Redirect } from "react-router-dom";

const Session = (props) => {
  const [loading, loadState] = useState(null);

  if (!loading) {
    fetch("/session")
      .then((data) => data.json())
      .then((data) => {
        console.log(data);
        loadState(data);
      })
      .catch((err) => console.log("Error in session request: ", err));
  }

  if (!loading) return <h1>Loading...</h1>;

  return (
    <Redirect
      to={{
        pathname: '/main',
        state: { admin:loading.admin, wsURL:loading.wsURL },
      }}
    />
  );
};

export default Session;
