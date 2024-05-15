import React, { useEffect, useState } from "react";
import axios from "axios";
import qs from "qs";
import {
  Button,
  Card,
  ColorPicker,
  Flex,
  Form,
  Input,
  List,
  Modal,
} from "antd";
import { XFilled } from "@ant-design/icons";

interface DataType {
  username: string;
  email: string;
  id: number;
}

interface RoomType {
  id: number;
  attributes: {
    name: string;
    color: string;
  };
}

const Configurations = () => {
  const [loading, setLoading] = useState(false);
  const [dataUser, setDataUser] = useState<DataType[]>([]);
  const [newUserModal, setNewUserModal] = useState(false);
  const [newRoomModal, setNewRoomModal] = useState(false);
  const [dataRooms, setDataRooms] = useState<RoomType[]>([]);
  const [newRoomColor, setNewRoomColor] = useState<string>("");

  const [formUser] = Form.useForm();
  const [formRoom] = Form.useForm();

  const fetchData = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("http://192.168.1.125:1337/api/Users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setDataUser(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRoomsData();
  }, []);

  const fetchRoomsData = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("http://192.168.1.125:1337/api/Rooms", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("🚀 ~ fetchData ~ response:", response.data.data);
      setDataRooms(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await axios.delete(`http://192.168.1.125:1337/api/Users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const addNewUser = () => {
    const erros = formUser.getFieldsError();
    var hasError = false;
    erros.forEach((error) => {
      if (error.errors.length > 0 || error.warnings.length > 0) {
        hasError = true;
      }
    });

    if (hasError) {
      return;
    }
    const values = formUser.getFieldsValue(true);
    try {
      axios.post(
        "http://192.168.1.125:1337/api/Users",
        { ...values, role: 2 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setNewUserModal(false);
      formUser.resetFields();
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const addNewRoom = () => {
    const erros = formRoom.getFieldsError();
    var hasError = false;
    erros.forEach((error) => {
      if (error.errors.length > 0 || error.warnings.length > 0) {
        hasError = true;
      }
    });

    if (hasError) {
      return;
    }
    const values = formRoom.getFieldsValue(true);
    try {
      axios.post(
        "http://192.168.1.125:1337/api/Rooms",
        { data: { ...values } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNewRoomModal(false);
      formRoom.resetFields();
      fetchRoomsData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    try {
      await axios.delete(`http://192.168.1.125:1337/api/Rooms/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchRoomsData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h1>Configurações</h1>
      <Flex justify="space-between">
        <div style={{ minWidth: "48%" }}>
          <Modal
            title="Adicionar Novo Usuário"
            open={newUserModal}
            onOk={addNewUser}
            onCancel={() => setNewUserModal(false)}
            width={450}
          >
            <Form
              style={{ marginTop: "30px" }}
              layout="vertical"
              form={formUser}
            >
              <Form.Item
                label="Nome"
                name={"username"}
                rules={[{ required: true, message: "Nome obrigatório!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Email"
                name={"email"}
                rules={[
                  { required: true, message: "Email obrigatório!" },
                  { type: "email", message: "Email inválido!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Senha"
                name={"password"}
                rules={[{ required: true, message: "Senha obrigatória!" }]}
              >
                <Input.Password />
              </Form.Item>
            </Form>
          </Modal>

          <Card
            title={<h2>Usuários</h2>}
            extra={
              <Button type="primary" onClick={() => setNewUserModal(true)}>
                Adicionar
              </Button>
            }
          >
            <List
              dataSource={dataUser}
              renderItem={(item) => (
                <List.Item key={item.email}>
                  <List.Item.Meta
                    title={item.username}
                    description={item.email}
                  />
                  <Button onClick={() => handleDeleteUser(item.id)}>
                    Excluir
                  </Button>
                </List.Item>
              )}
            />
          </Card>
        </div>
        <div style={{ minWidth: "48%" }}>
          <Modal
            title="Adicionar Nova Sala"
            open={newRoomModal}
            onOk={addNewRoom}
            onCancel={() => setNewRoomModal(false)}
            width={450}
          >
            <Form
              style={{ marginTop: "30px" }}
              layout="vertical"
              form={formRoom}
            >
              <Form.Item
                label="Nome"
                name={"name"}
                rules={[{ required: true, message: "Nome obrigatório!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Cor"
                name={"color"}
                rules={[{ required: true }]}
              >
                <ColorPicker
                  defaultValue="#1677ff"
                  showText
                  onChangeComplete={(e) =>
                    formRoom.setFieldsValue({ color: e.toHexString() })
                  }
                />
                ;
              </Form.Item>
            </Form>
          </Modal>

          <Card
            title={<h2>Salas</h2>}
            extra={
              <Button type="primary" onClick={() => setNewRoomModal(true)}>
                Adicionar
              </Button>
            }
          >
            <List
              dataSource={dataRooms}
              renderItem={(item) => (
                <List.Item key={item.attributes.name}>
                  <List.Item.Meta
                    title={item.attributes.name}
                    avatar={
                      <XFilled
                        style={{
                          color: `${item.attributes.color}`,
                          marginRight: "10px",
                        }}
                      />
                    }
                  />
                  <Button onClick={() => handleDeleteRoom(item.id)}>
                    Excluir
                  </Button>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </Flex>
    </>
  );
};

export default Configurations;
