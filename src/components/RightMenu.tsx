import React, { useState, useContext } from "react";
import { Menu, Button, Divider, Flex } from "antd";
import {
  AppstoreOutlined,
  SettingOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  XFilled,
} from "@ant-design/icons";
// import NewMeeting from "./NewMeeting";
import RoomsContext from "../contexts/RoomsContext";
import MainModal from "./Modal/MainModal";
import { ModalProvider } from "../contexts/ModalContext";

interface RightMenuProps {
  selectContent: (content: number) => void;
}

const RightMenu: React.FC<RightMenuProps> = (props) => {
  const { selectContent } = props;
  const { rooms } = useContext(RoomsContext);
  const [modalNM, setModalNM] = useState<boolean>(false);
  const [selectMenu, setSelectMenu] = useState<string>("meetings");

  const menuHandler = (item: any) => {
    selectContent(0);
    setSelectMenu(item.key);
    switch (item.key) {
      case "meetings":
        selectContent(1);
        break;
      case "calendar":
        selectContent(3);
        break;
      case "settings":
        selectContent(2);
        break;
      case "logout":
        localStorage.removeItem("token");
        window.location.reload();
        break;
      default:
        if (item.key.includes("room_")) {
          selectContent(3);
        }
    }
  };

  const handleModalClose = () => {
    console.log("Fechou Modal");
    setModalNM(false);
    // menuHandler({ key: selectMenu });
  };

  return (
    <div style={{ width: 256, height: "100%", padding: "10% 2%" }}>
      {modalNM && (
        <ModalProvider>
          <MainModal create loading={false} closeModal={handleModalClose} />
        </ModalProvider>
      )}
      {rooms && (
        <Flex align="center" vertical>
          <Button id="btn-new-meeting" onClick={() => setModalNM(true)}>
            <PlusCircleOutlined /> Novo Agendamento
          </Button>
          <Divider />
          <Menu
            className="right-menu"
            defaultSelectedKeys={["calendar"]}
            onClick={menuHandler}
            mode="inline"
            theme="light"
            items={[
              {
                label: <div id="btn-meetings">Meus Agendamentos</div>,
                key: "meetings",
                icon: <AppstoreOutlined />,
              },
              {
                label: <div id="btn-calendar">Calendário</div>,
                key: "calendar",
                icon: <CalendarOutlined />,
              },
              {
                label: <div id="btn-settings">Configurações</div>,
                key: "settings",
                icon: <SettingOutlined />,
              },
              {
                label: <div id="btn-logout">Sair</div>,
                key: "logout",
                icon: <XFilled />,
              },
            ]}
          />
        </Flex>
      )}
    </div>
  );
};

export default RightMenu;
