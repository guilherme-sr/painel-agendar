
import React, { useEffect, useState, createContext } from "react";
import { useNavigate } from "react-router-dom";
import MainCalendar from "../../components/MainCalendar";
import RightMenu from "../../components/RightMenu";
import { Layout, Image, Button } from "antd"; //Importe o componente Button do Ant Design
import "./home.css";
import MyMeetings from "../../components/MyMeetings";
import axios from "axios";
import RoomsContext from "../../contexts/RoomsContext";
import Configurations from "../../components/Configurations";

const { Header, Content, Footer, Sider } = Layout;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [logged, setLogged] = useState<boolean>(false);
  const [content, setContent] = useState<number>(3);
  const [userData, setUserData] = useState<any>(null);
  const [rooms, setRooms] = useState([]);
  const [theme, setTheme] = useState<string>(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return storedTheme || (prefersDark ? 'dark' : 'light');
  });
  const [buttonText, setButtonText] = useState<string>(theme === 'dark' ? 'Light-theme' : 'Dark-theme');

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    localStorage.setItem('theme', theme);
    setButtonText(theme === 'dark' ? 'Light-theme' : 'Dark-theme');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      setButtonText(newTheme === 'dark' ? 'Light-theme' : 'Dark-theme');
      return newTheme;
    });
  };

  useEffect(() => {
    const tokenLS = localStorage.getItem("token");
    if (tokenLS) {
      // TODO: Validar token
      setLogged(true);
    } else {
      setLogged(true);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:1337/api/Users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
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
        const response = await axios.get("http://localhost:1337/api/Rooms", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRooms(response.data.data);
      } catch (error) {
        console.error("Erro ao recuperar as salas:", error);
      }
    };
    getRooms();
  }, []);

  const handleContent = (newContent: number) => {
    setContent(0);
    setContent(newContent);
  };

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
          "padding": "0 20px 0 850px",
        }}
      >
        
        <Image width={180} src="/AgendarTopLogo.png" preview={false} />
        <Button id="Botao" onClick={toggleTheme}>{buttonText}</Button>{/* Adicionei o botão aqui */}
      </Header>
      <div className="home">
        {logged && (
          <RoomsContext.Provider value={{ rooms }}>
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
                <RightMenu selectContent={handleContent} />
              </Sider>

              {content !== 0 && (
                <Content
                  style={{ padding: "10px 80px 80px 80px", minHeight: 280 }}
                >
                  {content === 1 && <MyMeetings userId={userData.id} />}
                  {content === 2 && <Configurations />}
                  {content === 3 && <MainCalendar />}
                </Content>
              )}
            </Layout>
          </RoomsContext.Provider>
        )}
      </div>
    </Layout>
  );
};

export default Home;


