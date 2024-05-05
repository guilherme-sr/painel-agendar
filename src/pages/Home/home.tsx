import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainCalendar from "../../components/MainCalendar";
import RightMenu from "../../components/RightMenu";
import { Layout } from "antd";
import "./home.css";
import MyMeetings from "../../components/MyMeetings";
import axios from "axios";
import { XFilled } from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [logged, setLogged] = useState<boolean>(false);
  const [content, setContent] = useState<number>(3);
  const [userData, setUserData] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const tokenLS = localStorage.getItem("token");
    if (tokenLS) {
      // TODO: Validar token
      setLogged(true);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.125:1337/api/Users/me",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Erro ao recuperar os dados do usuário:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const getRooms = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.125:1337/api/Rooms",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        response.data.data.forEach(
          (item: { id: number; attributes: { name: any; color: string } }) => {
            const novosItens = response.data.data.map(
              (newItem: {
                id: number;
                attributes: { name: any; color: any };
              }) => ({
                label: newItem.attributes.name,
                key: `room_${newItem.id}`,
                icon: <XFilled style={{ color: newItem.attributes.color }} />,
              })
            );
            setRooms(novosItens);
          }
        );
      } catch (error) {
        console.error("Erro ao recuperar as salas:", error);
      }
    };
    getRooms();
  }, []);

  const handleContent = (newContent: number) => {
    setContent(newContent);
  };

  return (
    <div className="home">
      {logged && (
        <Layout
          style={{
            margin: "25px 10px 0 ",
            borderRadius: "10px",
            background: "white",
          }}
        >
          <Sider
            width={255}
            style={{
              background: "white",
              borderRight: "1px solid #ddd",
              borderRadius: "10px 0 0 10px",
            }}
          >
            <RightMenu
              userdata={userData}
              selectContent={handleContent}
              rooms={rooms}
            />
          </Sider>
          <Content style={{ padding: "10px 80px 80px 80px", minHeight: 280 }}>
            {content == 1 && <MyMeetings userId={"1"} rooms={rooms} />}
            {content == 2 && <div>Configurações</div>}
            {content == 3 && <MainCalendar />}
          </Content>
        </Layout>
      )}
    </div>
  );
};

export default Home;
