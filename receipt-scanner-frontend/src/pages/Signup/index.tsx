import React from "react";
import Layout from "@components/Layout";
import { useSignupController } from "./controller";
import { Container, Title, Input, Button, ErrorText } from "./styles";

const Signup: React.FC = () => {
  const { fullName, age, email, cellNumber, password, error, handleChange, handleSubmit } =
    useSignupController();

  return (
    <Layout>
      <Container>
        <Title>Create an Account</Title>

        <Input placeholder="Full Name" value={fullName} onChange={handleChange("fullName")} />
        <Input placeholder="Age" value={age} onChange={handleChange("age")} />
        <Input placeholder="Email" value={email} onChange={handleChange("email")} />
        <Input placeholder="Cell Number" value={cellNumber} onChange={handleChange("cellNumber")} />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={handleChange("password")}
        />

        <Button onClick={handleSubmit}>Sign Up</Button>
        {error && <ErrorText>{error}</ErrorText>}
      </Container>
    </Layout>
  );
};

export default Signup;
