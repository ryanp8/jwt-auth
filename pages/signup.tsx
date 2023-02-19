import React from 'react';

export default function login() {
  const [usernameInput, setUsernameInput] = React.useState("");
  const [passwordInput, setPasswordInput] = React.useState("");

  const submit = async () => {
    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({
        username: usernameInput,
        password: passwordInput,
      }),
    });
    const json = await res.json();
  };

  return (
    <>
      <h1>Signup</h1>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => {
          setUsernameInput(e.target.value);
        }}
      ></input>
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => {
          setPasswordInput(e.target.value);
        }}
      ></input>
      <button onClick={submit}>Sign Up</button>
    </>
  );
}
