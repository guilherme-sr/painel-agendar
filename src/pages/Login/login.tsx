import React, { useEffect, useState } from "react";
import { Flex, Space, Form, Input, Button, Layout, Image } from "antd";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

const { Header } = Layout;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const onFinish = async (values: {
    username: string;
    password: string;
    remember: boolean;
  }) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:1337/api/auth/local",
        {
          identifier: values.username,
          password: values.password,
        }
      );
      
      console.log("Resposta do servidor:", response.data);
      localStorage.setItem("token", response.data.jwt);
      window.location.href = "/";
    } catch (error: AxiosError | any) {
      console.error("Erro ao autenticar:", error);
      if (error.response && error.response.status === 400) {
        setError(
          "Credenciais inválidas. Por favor, verifique seu nome de usuário e senha."
        );
      } else {
        setError(
          "Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde."
        );
      }
    }
    setLoading(false);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60px",
        }}
      >
        <Image width={180} src="/AgendarTopLogo.png" preview={false} />
      </Header>
      <Flex gap="middle" align="center" vertical>
        <Space>
          <div className="login-container">
            <h2>Login</h2>

            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
              className="form-login"
            >
              <Form.Item
                label="E-mail"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Insira seu usuário!",
                    type: "email",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Senha"
                name="password"
                rules={[{ required: true, message: "Insira sua senha!" }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Login
                </Button>
              </Form.Item>

              <Form.Item>
                {error && <div className="login-error">{error}</div>}
              </Form.Item>
            </Form>
          </div>
        </Space>
      </Flex>
    </Layout>
  );
};

export default Login;
